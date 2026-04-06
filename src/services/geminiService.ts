import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeCarData(text: string, base64Image?: string) {
  const systemInstruction = `You are Jarvis, a brilliant AI car mechanic. 
  Greeting: "Assalamu alaikum sir, I am Jarvis."
  Language: Mix of technical English and common Indian English (Hinglish).
  Task: If you see an image, describe the warning lights or damage. If you see text, explain the fault codes.
  Structure:
  1. **Main Issue** (DTC codes or parts)
  2. **Severity** (Safe to drive?)
  3. **Action Required** (Mechanic visit or easy fix?)
  Be concise but thorough.`;

  const parts: any[] = [];
  if (text) parts.push({ text: `Analyze this car data: ${text}` });
  if (base64Image) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts }],
    config: {
      systemInstruction,
    },
  });

  return response.text || "I couldn't analyze the data, sir.";
}

export async function chatWithJarvis(history: { role: "user" | "model"; parts: { text: string }[] }[], message: string) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are Jarvis, a helpful AI car mechanic. Answer briefly about the car issue based on the context.",
    },
    history: history,
  });

  const response = await chat.sendMessage({ message });
  return response.text || "I'm sorry sir, I couldn't process that.";
}

export async function generateJarvisVoice(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say professionally and calmly: ${text.substring(0, 500)}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "Puck" },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
}
