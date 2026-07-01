import { NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// Models to try in order (fallback chain)
const ANALYSIS_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-pro",
  "gemini-pro",
]

async function callGeminiWithRetry(
  prompt: string,
  config: Record<string, unknown>,
  models: string[] = ANALYSIS_MODELS
): Promise<{ data?: unknown; error?: string }> {
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            ...config,
          }),
        }
      )

      const result = await response.json()

      // Check for errors in response
      if (result.error) {
        console.error(`[v0] Model ${model} error:`, result.error.message)
        
        // If rate limited or not found, try next model
        if (result.error.code === 429 || result.error.code === 404) {
          continue
        }
        
        return { error: result.error.message }
      }

      // Check for valid response
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        return { data: JSON.parse(result.candidates[0].content.parts[0].text) }
      }

      console.error(`[v0] Model ${model} - no valid response`)
    } catch (err) {
      console.error(`[v0] Model ${model} exception:`, err)
    }
  }

  return { error: "All models failed or rate limited. Please try again in a minute." }
}

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    const { action, payload } = await request.json()

    if (action === "analyze") {
      const { codes } = payload
      const prompt = `You are an expert automotive diagnostic technician. Analyze these OBD2 fault codes in detail: ${codes.join(", ")}. 

For EACH code, explain:
- What the code means technically
- The specific component or system affected
- Common root causes (list 3-5 possibilities)
- Symptoms the driver may experience
- Potential consequences if ignored

Provide a JSON response with:
1. "codes": Array of objects, each containing:
   - "code": The OBD2 code (e.g., "P0420")
   - "title": Short description (e.g., "Catalyst System Efficiency Below Threshold")
   - "system": Affected system (e.g., "Emissions", "Engine", "Transmission")
   - "severity": "Critical", "Moderate", or "Minor"
   - "explanation": Detailed technical explanation in Hinglish (3-4 sentences)
   - "causes": Array of possible causes (3-5 items)
   - "symptoms": Array of symptoms the driver may notice
   - "consequences": What happens if not fixed
   - "partsCost": Estimated parts cost range in INR (e.g., "₹2,000 - ₹8,000")
2. "summary": A comprehensive Hinglish paragraph (4-5 sentences) explaining how these codes may be interconnected and the overall vehicle health assessment.
3. "estimatedTime": String with repair time range (e.g., "2-3 Hours").
4. "toolsNeeded": Array of specific tools and equipment needed.
5. "stepByStepDiagnosis": Array of diagnostic steps a mechanic should follow.
6. "proTip": 2-3 sentences of expert advice for the mechanic, including common mistakes to avoid.
7. "urgency": "Immediate", "Soon", or "When Convenient" - overall repair urgency.`

      const result = await callGeminiWithRetry(prompt, {
        generationConfig: { responseMimeType: "application/json" },
      })

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 429 })
      }

      return NextResponse.json(result.data)
    }

    if (action === "lookup") {
      const { code } = payload
      
      // RAG System Prompt - Forces AI to ONLY use OBD2 standard data, never guess
      const systemPrompt = `You are a vehicle diagnostic expert assistant.

**CRITICAL INSTRUCTIONS (RAG - Retrieval-Augmented Generation):**
1. Answer diagnostic code queries ONLY using standard OBD2 database definitions.
2. NEVER rely on your training memory or guesses - only use known OBD2 standards.
3. If the code is NOT in the standard OBD2 database, respond with: {"found": false}
4. ALWAYS include "source": "OBD2 Standard Database" in your response.
5. Be honest about data limitations - never fabricate diagnostic information.

Standard OBD2 Code Format:
- P codes: Powertrain (P0xxx - P3xxx are valid ranges)
- First digit after P: 0=Generic, 1=Manufacturer-specific, 2=Reserved, 3=Reserved
- Codes MUST exist in official OBD2 standards to be reported as found.`

      const userPrompt = `Code to lookup: ${code}

Search the standard OBD2 diagnostic database for this code ONLY.

If found, return ONLY valid JSON:
{
  "found": true,
  "code": "${code}",
  "title": "Official OBD2 code definition",
  "system": "Vehicle system (e.g., Engine, Transmission, ABS)",
  "severity": "Critical/Moderate/Minor",
  "explanation": "Technical explanation in Hinglish (2-3 sentences)",
  "causes": ["root cause 1", "root cause 2", "root cause 3"],
  "symptoms": ["symptom 1", "symptom 2"],
  "consequences": "What happens if not fixed",
  "partsCost": "Estimated cost in INR",
  "source": "OBD2 Standard Database"
}

If NOT found in OBD2 database, return:
{
  "found": false,
  "code": "${code}",
  "message": "This code is not found in the standard OBD2 diagnostic database",
  "source": "OBD2 Standard Database"
}`

      const result = await callGeminiWithRetry(userPrompt, {
        generationConfig: { responseMimeType: "application/json" },
      })

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 429 })
      }

      const data = result.data as any
      
      // Validate RAG response - ensure source is cited
      if (data.found === false) {
        return NextResponse.json({
          found: false,
          code,
          message: `Code ${code} not found in standard OBD2 database. Professional diagnosis may be required.`,
          source: "OBD2 Standard Database"
        })
      }

      // Ensure all required fields are present for found codes
      if (data.found === true) {
        return NextResponse.json({
          ...data,
          source: data.source || "OBD2 Standard Database via Gemini"
        })
      }

      return NextResponse.json({
        found: false,
        code,
        message: "Unable to validate code in database",
        source: "OBD2 Standard Database"
      })
    }

    if (action === "tts") {
      const { text } = payload
      
      // TTS uses a specific model
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Say in a professional, polite, and fast Indian mechanic voice. Start with Assalamualikum Sir. Use 'Aap' and 'Kariye'.: ${text}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } } },
            },
          }),
        }
      )

      const result = await response.json()
      
      if (result.error) {
        console.error("[v0] TTS error:", result.error.message)
        return NextResponse.json({ error: result.error.message }, { status: result.error.code || 500 })
      }

      const audioBase64 = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data

      if (audioBase64) {
        return NextResponse.json({ audio: audioBase64 })
      }

      return NextResponse.json({ error: "No audio generated" }, { status: 500 })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Gemini API error:", error)
    return NextResponse.json({ error: "API request failed" }, { status: 500 })
  }
}
