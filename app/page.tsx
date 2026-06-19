"use client"

import { useState, useEffect, useRef } from "react"
import {
  Activity,
  Zap,
  Terminal as TerminalIcon,
  ShieldCheck,
  Upload,
  FileCode,
  Wrench,
  Volume2,
  Square,
  Search,
  ShieldAlert,
  Sparkles,
  BrainCircuit,
  Cpu,
  Gauge,
  Radio,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Settings,
  Shield,
  Database,
  Network,
  Fingerprint,
  Eye,
} from "lucide-react"

/**
 * JARVIS OBD2 SCANNER - CYBERPUNK EDITION
 * AI features are powered by Gemini via secure API routes.
 */

// --- Typing Effect Hook ---
function useTypingEffect(text: string, speed: number = 100, startDelay: number = 0, shouldStart: boolean = true) {
  const [displayedText, setDisplayedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!shouldStart) return
    
    setDisplayedText("")
    setIsComplete(false)
    
    const startTimeout = setTimeout(() => {
      let index = 0
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1))
          index++
        } else {
          setIsComplete(true)
          clearInterval(interval)
        }
      }, speed)
      
      return () => clearInterval(interval)
    }, startDelay)

    return () => clearTimeout(startTimeout)
  }, [text, speed, startDelay, shouldStart])

  return { displayedText, isComplete }
}

// --- Boot Sequence Intro ---
function JarvisIntro({ onComplete }: { onComplete: () => void }) {
  const [bootStep, setBootStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showLogo, setShowLogo] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [bootComplete, setBootComplete] = useState(false)
  const [showGreeting, setShowGreeting] = useState(false)

  // Typing effects
  const jarvisTitle = useTypingEffect("J.A.R.V.I.S.", 150, 500, showLogo)
  const subtitle = useTypingEffect("OBD-II Diagnostic System", 50, 0, jarvisTitle.isComplete)
  const greeting = useTypingEffect("Good day. All systems nominal. Awaiting your command.", 30, 0, showGreeting)

  const bootSequence = [
    { icon: Shield, text: "INITIALIZING SECURE CONNECTION", delay: 400 },
    { icon: Database, text: "LOADING OBD-II PROTOCOLS", delay: 600 },
    { icon: Cpu, text: "ACTIVATING NEURAL INTERFACE", delay: 500 },
    { icon: Network, text: "SYNCING VEHICLE NETWORKS", delay: 700 },
    { icon: BrainCircuit, text: "CONNECTING GEMINI AI CORE", delay: 600 },
    { icon: Fingerprint, text: "AUTHENTICATING USER", delay: 400 },
    { icon: Eye, text: "VISUAL SYSTEMS ONLINE", delay: 500 },
  ]

  const handleStart = () => {
    setFadeOut(true)
    setTimeout(onComplete, 700)
  }

  useEffect(() => {
    // Show logo first
    const logoTimer = setTimeout(() => setShowLogo(true), 300)
    
    // Start boot sequence
    const bootTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setBootStep((prev) => {
          if (prev >= bootSequence.length - 1) {
            clearInterval(interval)
            return prev
          }
          return prev + 1
        })
      }, 800)
      
      return () => clearInterval(interval)
    }, 1500)

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setBootComplete(true)
          setShowGreeting(true)
          return 100
        }
        return prev + 1.5
      })
    }, 50)

    return () => {
      clearTimeout(logoTimer)
      clearTimeout(bootTimer)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className={`fixed inset-0 z-50 bg-[#020617] flex items-center justify-center transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 jarvis-grid-bg opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-cyan-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-cyan-500/10 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
      </div>

      {/* Scanlines */}
      <div className="absolute inset-0 jarvis-scanline" />

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className={`mb-12 transition-all duration-1000 ${showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          {/* Rotating ring */}
          <div className="relative w-40 h-40 mx-auto mb-8">
            <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
            <div className="absolute inset-2 border border-cyan-400/20 rounded-full animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
            <div className="absolute inset-4 border border-dashed border-cyan-500/40 rounded-full animate-spin" style={{ animationDuration: '6s' }} />
            
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-xl animate-pulse" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center border border-cyan-400/50">
                  <Cpu size={40} className="text-cyan-400" />
                </div>
              </div>
            </div>

            {/* Orbiting dots */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 jarvis-text-glow mb-2">
            JARVIS
          </h1>
          <p className="text-cyan-500/60 text-xs tracking-[0.5em] uppercase">OBD-II Diagnostic System</p>
        </div>

        {/* Boot sequence */}
        <div className="w-96 mx-auto space-y-3 mb-8">
          {bootSequence.map((step, index) => {
            const Icon = step.icon
            const isActive = index === bootStep
            const isComplete = index < bootStep
            
            return (
              <div
                key={index}
                className={`flex items-center gap-3 text-left transition-all duration-500 ${
                  index > bootStep ? 'opacity-20' : 'opacity-100'
                }`}
              >
                <div className={`w-8 h-8 rounded flex items-center justify-center transition-colors duration-300 ${
                  isComplete ? 'bg-cyan-500/20 border border-cyan-500/50' : 
                  isActive ? 'bg-cyan-500/30 border border-cyan-400 animate-pulse' : 
                  'bg-slate-800/50 border border-slate-700/50'
                }`}>
                  {isComplete ? (
                    <CheckCircle2 size={14} className="text-cyan-400" />
                  ) : (
                    <Icon size={14} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />
                  )}
                </div>
                <span className={`text-[10px] tracking-widest uppercase font-mono transition-colors duration-300 ${
                  isComplete ? 'text-cyan-400' : isActive ? 'text-cyan-300' : 'text-slate-600'
                }`}>
                  {step.text}
                  {isActive && <span className="animate-pulse">_</span>}
                </span>
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="w-96 mx-auto">
          <div className="flex justify-between text-[9px] text-cyan-500/60 mb-2 font-mono tracking-wider">
            <span>SYSTEM BOOT</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 transition-all duration-100 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[9px] text-slate-500 mt-4 tracking-widest uppercase">
            {progress < 100 ? 'Initializing diagnostic protocols...' : 'System ready. Welcome, Operator.'}
          </p>
          
          {/* Start Button */}
          <div className={`mt-8 transition-all duration-700 ${bootComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button
              onClick={handleStart}
              disabled={!bootComplete}
              className="group relative px-12 py-4 bg-transparent overflow-hidden"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Animated border */}
              <div className="absolute inset-0 border border-cyan-500/50 group-hover:border-cyan-400 transition-colors duration-300">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
              </div>
              
              {/* Scanning line effect */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
              </div>
              
              {/* Button text */}
              <span className="relative flex items-center gap-3 text-sm tracking-[0.3em] uppercase font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">
                <Zap size={18} className="group-hover:animate-pulse" />
                Initialize System
                <Zap size={18} className="group-hover:animate-pulse" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-20 h-20 border-t-2 border-l-2 border-cyan-500/30" />
      <div className="absolute top-8 right-8 w-20 h-20 border-t-2 border-r-2 border-cyan-500/30" />
      <div className="absolute bottom-8 left-8 w-20 h-20 border-b-2 border-l-2 border-cyan-500/30" />
      <div className="absolute bottom-8 right-8 w-20 h-20 border-b-2 border-r-2 border-cyan-500/30" />
    </div>
  )
}

// --- Animated Background ---
function HexagonGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 jarvis-grid-bg opacity-50" />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 jarvis-scanline" />
    </div>
  )
}

// --- Shared UI Components ---

function Panel({
  title,
  children,
  icon: Icon,
  className = "",
  glowing = false,
}: {
  title: string
  children: React.ReactNode
  icon?: React.ElementType
  className?: string
  glowing?: boolean
}) {
  return (
    <div
      className={`relative jarvis-panel rounded-lg p-5 backdrop-blur-md jarvis-corners transition-all duration-300 hover:border-cyan-400/50 ${glowing ? 'jarvis-glow' : ''} ${className}`}
    >
      {/* Top decorative line */}
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-cyan-500/20">
        {Icon && (
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md" />
            <Icon size={18} className="text-cyan-400 relative z-10" />
          </div>
        )}
        <h2 className="text-cyan-300 text-xs tracking-[0.25em] uppercase font-bold jarvis-text-glow">{title}</h2>
      </div>
      
      {children}
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60 rounded-tl" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60 rounded-tr" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60 rounded-bl" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60 rounded-br" />
    </div>
  )
}

function StatRow({
  label,
  value,
  unit,
  icon: Icon,
  status = "normal",
}: {
  label: string
  value: string | number
  unit: string
  icon?: React.ElementType
  status?: "normal" | "warning" | "danger"
}) {
  const statusColors = {
    normal: "text-cyan-400",
    warning: "text-yellow-400",
    danger: "text-red-500",
  }
  const statusBg = {
    normal: "bg-cyan-400/10",
    warning: "bg-yellow-400/10",
    danger: "bg-red-500/10",
  }
  return (
    <div className={`flex justify-between items-center py-3 px-3 rounded-lg ${statusBg[status]} border border-cyan-500/10 transition-all hover:border-cyan-500/30`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-cyan-500/70" />}
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">{label}</span>
      </div>
      <div className="flex items-end gap-1">
        <span className={`text-sm font-black tracking-tight ${statusColors[status]}`}>{value}</span>
        <span className="text-[9px] text-slate-500 font-medium">{unit}</span>
      </div>
    </div>
  )
}

function StatusIndicator({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-slate-600'}`}>
        {active && <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />}
      </div>
      <span className="text-[9px] text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  )
}

// --- Core Application ---

interface DiagnosticReport {
  id: number
  code: string
  issue: string
  hinglish: string
  checklist: string[]
  urgency: string
}

interface CodeAnalysis {
  code: string
  title: string
  system: string
  severity: "Critical" | "Moderate" | "Minor"
  explanation: string
  causes: string[]
  symptoms: string[]
  consequences: string
  partsCost: string
}

interface AIAnalysis {
  codes?: CodeAnalysis[]
  summary: string
  estimatedTime: string
  toolsNeeded: string[]
  stepByStepDiagnosis?: string[]
  proTip: string
  urgency?: "Immediate" | "Soon" | "When Convenient"
}

export default function JarvisOBD2Scanner() {
  const [showIntro, setShowIntro] = useState(true)
  const [telemetry] = useState({ rpm: 0, battery: 12.6, temp: 92, fuel: 78 })
  const [logs, setLogs] = useState(["[SYSTEM] J.A.R.V.I.S. Diagnostic Core Initialized."])
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "complete">("idle")
  const [diagnosticReports, setDiagnosticReports] = useState<DiagnosticReport[]>([])
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  const logsEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev.slice(-20), `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  // Helper to convert PCM data to WAV for the TTS API
  const pcmToWav = (pcmData: Int16Array, sampleRate: number) => {
    const buffer = new ArrayBuffer(44 + pcmData.length * 2)
    const view = new DataView(buffer)
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    writeString(0, "RIFF")
    view.setUint32(4, 32 + pcmData.length * 2, true)
    writeString(8, "WAVE")
    writeString(12, "fmt ")
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, "data")
    view.setUint32(40, pcmData.length * 2, true)
    for (let i = 0; i < pcmData.length; i++) {
      view.setInt16(44 + i * 2, pcmData[i], true)
    }
    return new Blob([buffer], { type: "audio/wav" })
  }

  const speakText = async (text: string, id: string) => {
    if (isSpeaking === id) {
      if (audioRef.current) audioRef.current.pause()
      window.speechSynthesis.cancel()
      setIsSpeaking(null)
      return
    }

    setIsSpeaking(id)
    addLog(`[AUDIO] Broadcasting briefing...`)

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "tts", payload: { text } }),
      })

      const result = await response.json()

      if (result.audio) {
        const binaryString = atob(result.audio)
        const len = binaryString.length
        const bytes = new Int16Array(len / 2)
        for (let i = 0; i < len; i += 2) {
          bytes[i / 2] = (binaryString.charCodeAt(i + 1) << 8) | binaryString.charCodeAt(i)
        }
        const wavBlob = pcmToWav(bytes, 24000)
        const url = URL.createObjectURL(wavBlob)
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => setIsSpeaking(null)
        audio.play()
      } else {
        throw new Error("No audio in response")
      }
    } catch {
      addLog("[WARN] TTS API unavailable. Falling back to Browser Voice.")
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onend = () => setIsSpeaking(null)
      window.speechSynthesis.speak(utterance)
    }
  }

  const runAiAnalysis = async (codes: string[], retryCount = 0) => {
    setIsAnalyzing(true)
    addLog("[AI] Deep Scanning Fault Codes...")

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze", payload: { codes } }),
      })

      const data = await response.json()

      if (data.error) {
        if (response.status === 429 && retryCount < 2) {
          addLog(`[WARN] Rate limited. Retrying in ${(retryCount + 1) * 30} seconds...`)
          setTimeout(() => {
            runAiAnalysis(codes, retryCount + 1)
          }, (retryCount + 1) * 30000)
          return
        }
        throw new Error(data.error)
      }

      setAiAnalysis(data)
      addLog("[AI] Advanced Repair Strategy Loaded.")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      addLog(`[ERROR] Gemini Brain: ${errorMsg}`)
      
      if (errorMsg.includes("rate") || errorMsg.includes("quota")) {
        addLog("[INFO] Tip: Wait 1 minute and upload the file again.")
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const playFullReport = () => {
    if (diagnosticReports.length === 0) return

    const codesStr = diagnosticReports.map((r) => r.code).join(", ")
    let fullScript = `Assalamualikum Sir. Scan mein ${diagnosticReports.length} faults mile hain. Codes hain: ${codesStr}. `

    if (aiAnalysis) {
      fullScript += aiAnalysis.summary + " Kaam mein " + aiAnalysis.estimatedTime + " lagenge. JazakAllah."
    } else {
      fullScript += "Engine missing aur wiring problems dikh rahe hain. Kripya dhyan se check kariye. Dhanyawad."
    }

    speakText(fullScript, "FULL_REPORT")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadStatus("uploading")
    setDiagnosticReports([])
    setAiAnalysis(null)
    addLog(`[UPLINK] Processing ${file.name}...`)

    setTimeout(() => {
      setUploadStatus("complete")
      const results: DiagnosticReport[] = [
        {
          id: 1,
          code: "P0300",
          issue: "Random Misfire",
          hinglish: "Sir, engine missing hai. Spark plugs aur ignition coils check kariye. Ye problem fuel delivery ya compression issue ki wajah se bhi ho sakti hai.",
          checklist: ["Plugs", "Coils"],
          urgency: "CRITICAL",
        },
        {
          id: 2,
          code: "P0420",
          issue: "Catalyst System Efficiency Below Threshold",
          hinglish: "Catalytic converter choke ho sakta hai ya efficiency kam ho gayi hai. Pehle O2 sensors check kariye, agar wo theek hain toh converter replace karna padega.",
          checklist: ["O2 Sensor", "Cat Converter"],
          urgency: "MEDIUM",
        },
        {
          id: 3,
          code: "P0115",
          issue: "Engine Coolant Temperature Sensor Circuit",
          hinglish: "Temperature sensor ki wiring check kariye, connection loose lag raha hai. Sensor bhi kharab ho sakta hai. ECU ko sahi temp reading nahi mil rahi.",
          checklist: ["Check Pins", "Sensor", "Wiring"],
          urgency: "HIGH",
        },
      ]
      setDiagnosticReports(results)
      runAiAnalysis(results.map((r) => r.code))
    }, 1200)
  }

  const getSeverityColor = (urgency: string) => {
    switch (urgency) {
      case "CRITICAL": return "from-red-500 to-red-600"
      case "HIGH": return "from-orange-500 to-orange-600"
      case "MEDIUM": return "from-yellow-500 to-yellow-600"
      default: return "from-blue-500 to-blue-600"
    }
  }

  const getSeverityBg = (urgency: string) => {
    switch (urgency) {
      case "CRITICAL": return "bg-red-500/10 border-red-500/30"
      case "HIGH": return "bg-orange-500/10 border-orange-500/30"
      case "MEDIUM": return "bg-yellow-500/10 border-yellow-500/30"
      default: return "bg-blue-500/10 border-blue-500/30"
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-mono overflow-x-hidden relative">
      {/* Intro Screen */}
      {showIntro && <JarvisIntro onComplete={() => setShowIntro(false)} />}
      
      <HexagonGrid />

      {/* Main Container */}
      <div className="relative z-10 p-4 md:p-8">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 pb-6 border-b border-cyan-800/30">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400/20 rounded-2xl blur-xl" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 flex items-center justify-center">
                <Wrench className="text-cyan-400 w-8 h-8" />
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 jarvis-text-glow">
                J.A.R.V.I.S.
              </h1>
              <p className="text-[10px] text-cyan-500/70 tracking-[0.3em] mt-1 uppercase font-medium">
                Just A Rather Very Intelligent Scanner
              </p>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-slate-900/50 border border-cyan-500/20">
              <StatusIndicator active={true} label="System Online" />
              <div className="w-px h-4 bg-cyan-500/20" />
              <StatusIndicator active={diagnosticReports.length > 0} label="Data Loaded" />
              <div className="w-px h-4 bg-cyan-500/20" />
              <StatusIndicator active={isAnalyzing} label="AI Active" />
            </div>
            
            <div className="text-right">
              <div className="text-xl font-black text-cyan-400 tracking-wider tabular-nums">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest">
                {currentTime.toLocaleDateString()}
              </div>
            </div>
          </div>
        </header>

        {/* Play Report Button */}
        {diagnosticReports.length > 0 && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={playFullReport}
              className={`group relative flex items-center gap-4 px-10 py-5 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                isSpeaking === "FULL_REPORT"
                  ? "bg-red-500/20 border-red-400 text-red-400"
                  : "bg-cyan-500/10 border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 hover:scale-105"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {isSpeaking === "FULL_REPORT" ? (
                <Square size={24} fill="currentColor" className="animate-pulse" />
              ) : (
                <Sparkles size={24} />
              )}
              <span className="text-sm font-black tracking-[0.2em] uppercase relative z-10">
                {isSpeaking === "FULL_REPORT" ? "STOP BROADCAST" : "PLAY AI DIAGNOSTIC REPORT"}
              </span>
              <Radio size={20} className={isSpeaking === "FULL_REPORT" ? "animate-pulse" : ""} />
            </button>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* System Vitals */}
            <Panel title="System Vitals" icon={Activity}>
              <div className="space-y-3">
                <StatRow label="Engine Sync" value="ACTIVE" unit="" icon={Cpu} />
                <StatRow label="Battery" value={telemetry.battery} unit="V" icon={Zap} />
                <StatRow label="Coolant Temp" value={telemetry.temp} unit="°C" icon={Gauge} status={telemetry.temp > 100 ? "danger" : "normal"} />
                <StatRow label="Fuel Level" value={telemetry.fuel} unit="%" icon={Activity} />
              </div>
            </Panel>

            {/* Connection Status */}
            <Panel title="Connection" icon={Wifi}>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-400" />
                    <span className="text-xs text-green-400 font-medium">OBD2 Port</span>
                  </div>
                  <span className="text-[10px] text-green-400/70 uppercase">Connected</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  <div className="flex items-center gap-2">
                    <BrainCircuit size={16} className="text-cyan-400" />
                    <span className="text-xs text-cyan-400 font-medium">Gemini AI</span>
                  </div>
                  <span className="text-[10px] text-cyan-400/70 uppercase">Ready</span>
                </div>
              </div>
            </Panel>

            {/* File Upload */}
            <Panel title="Data Uplink" icon={Upload}>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  uploadStatus === "complete"
                    ? "border-green-500/50 bg-green-500/5"
                    : "border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-400/50 hover:bg-cyan-500/10"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                
                {uploadStatus === "uploading" ? (
                  <>
                    <div className="relative w-16 h-16 mb-4">
                      <div className="absolute inset-0 border-4 border-cyan-400/30 rounded-full" />
                      <div className="absolute inset-0 border-4 border-cyan-400 rounded-full border-t-transparent animate-spin" />
                    </div>
                    <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Processing...</span>
                  </>
                ) : uploadStatus === "complete" ? (
                  <>
                    <ShieldCheck size={48} className="text-green-400 mb-4" />
                    <span className="text-xs text-green-400 font-bold uppercase tracking-widest">Data Synced</span>
                    <span className="text-[10px] text-slate-500 mt-1">{diagnosticReports.length} Codes Detected</span>
                  </>
                ) : (
                  <>
                    <FileCode size={48} className="text-cyan-400/70 mb-4" />
                    <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Drop Scan File</span>
                    <span className="text-[10px] text-slate-500 mt-1">or click to browse</span>
                  </>
                )}
              </div>
            </Panel>
          </div>

          {/* Center Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* AI Analysis */}
            {isAnalyzing && (
              <Panel title="AI Processing" icon={BrainCircuit} glowing>
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-cyan-400/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-cyan-400 rounded-full border-t-transparent animate-spin" />
                    <div className="absolute inset-4 border-4 border-cyan-400/40 rounded-full border-b-transparent animate-spin animation-delay-200" style={{ animationDirection: 'reverse' }} />
                    <BrainCircuit className="absolute inset-0 m-auto w-8 h-8 text-cyan-400" />
                  </div>
                  <p className="text-sm text-cyan-400 font-bold uppercase tracking-widest animate-pulse">
                    Analyzing Fault Codes...
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2">Gemini AI Processing</p>
                </div>
              </Panel>
            )}

            {aiAnalysis && !isAnalyzing && (
              <Panel title="Gemini AI Strategy" icon={BrainCircuit} className="border-cyan-400/40">
                <div className="space-y-5">
                  {/* Urgency Badge */}
                  {aiAnalysis.urgency && (
                    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${
                      aiAnalysis.urgency === "Immediate" ? "bg-red-500/20 text-red-400 border border-red-500/50" :
                      aiAnalysis.urgency === "Soon" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50" :
                      "bg-green-500/20 text-green-400 border border-green-500/50"
                    }`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        aiAnalysis.urgency === "Immediate" ? "bg-red-500 animate-pulse" :
                        aiAnalysis.urgency === "Soon" ? "bg-yellow-500" : "bg-green-500"
                      }`} />
                      Repair Priority: {aiAnalysis.urgency}
                    </div>
                  )}

                  {/* Summary */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20">
                    <p className="text-sm text-cyan-100 leading-relaxed">{aiAnalysis.summary}</p>
                  </div>

                  {/* Detailed Code Analysis */}
                  {aiAnalysis.codes && aiAnalysis.codes.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <Settings size={12} />
                        Detailed Code Analysis
                      </h4>
                      {aiAnalysis.codes.map((codeInfo, idx) => (
                        <div key={idx} className="p-5 rounded-xl bg-slate-900/50 border border-slate-700/50 space-y-4 hover:border-cyan-500/30 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1.5 rounded-lg text-sm font-black ${
                                codeInfo.severity === "Critical" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                                codeInfo.severity === "Moderate" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                                "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              }`}>{codeInfo.code}</span>
                              <div>
                                <span className="text-sm text-white font-bold">{codeInfo.title}</span>
                                <span className="text-[9px] text-slate-500 uppercase ml-2 px-2 py-0.5 rounded bg-slate-800">{codeInfo.system}</span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-xs text-slate-300 leading-relaxed">{codeInfo.explanation}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-[10px]">
                            <div className="p-3 rounded-lg bg-slate-800/50">
                              <h5 className="text-cyan-400 font-bold uppercase mb-2 flex items-center gap-1">
                                <AlertTriangle size={10} /> Possible Causes
                              </h5>
                              <ul className="text-slate-400 space-y-1">
                                {codeInfo.causes.map((cause, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-cyan-600 mt-0.5">-</span>
                                    <span>{cause}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-800/50">
                              <h5 className="text-cyan-400 font-bold uppercase mb-2 flex items-center gap-1">
                                <Activity size={10} /> Symptoms
                              </h5>
                              <ul className="text-slate-400 space-y-1">
                                {codeInfo.symptoms.map((symptom, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-cyan-600 mt-0.5">-</span>
                                    <span>{symptom}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                            <div className="flex items-center gap-2">
                              <AlertTriangle size={12} className="text-red-400" />
                              <span className="text-[10px] text-slate-400">{codeInfo.consequences}</span>
                            </div>
                            <span className="text-xs text-green-400 font-bold px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">{codeInfo.partsCost}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Time & Tools */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={14} className="text-cyan-400" />
                        <h4 className="text-[10px] text-cyan-500 font-black uppercase">Est. Time</h4>
                      </div>
                      <p className="text-lg font-bold text-white">{aiAnalysis.estimatedTime}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench size={14} className="text-cyan-400" />
                        <h4 className="text-[10px] text-cyan-500 font-black uppercase">Tools Needed</h4>
                      </div>
                      <p className="text-xs text-slate-300">{aiAnalysis.toolsNeeded.join(", ")}</p>
                    </div>
                  </div>

                  {/* Step by Step */}
                  {aiAnalysis.stepByStepDiagnosis && aiAnalysis.stepByStepDiagnosis.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                      <h4 className="text-[10px] text-cyan-500 font-black uppercase mb-3 flex items-center gap-2">
                        <Settings size={12} /> Diagnostic Steps
                      </h4>
                      <ol className="text-xs text-slate-300 space-y-2">
                        {aiAnalysis.stepByStepDiagnosis.map((step, i) => (
                          <li key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-cyan-500/5 transition-colors">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">{i + 1}</span>
                            <span className="pt-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Pro Tip */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/30">
                    <p className="text-[10px] text-yellow-400 font-bold uppercase mb-2 flex items-center gap-2">
                      <Zap size={12} className="animate-pulse" /> Expert Mechanic Tip
                    </p>
                    <p className="text-sm text-slate-300">{aiAnalysis.proTip}</p>
                  </div>
                </div>
              </Panel>
            )}

            {/* Captured Faults */}
            <Panel title="Captured Fault Codes" icon={Search}>
              {diagnosticReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 opacity-30">
                  <ShieldAlert size={64} className="mb-4" />
                  <p className="text-xs uppercase font-bold tracking-[0.2em]">No Diagnostic Data</p>
                  <p className="text-[10px] text-slate-500 mt-1">Upload a scan file to begin</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity size={14} className="text-cyan-400" />
                      <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">System Summary</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {diagnosticReports.length} fault code{diagnosticReports.length > 1 ? "s" : ""} detected. 
                      {diagnosticReports.some(r => r.urgency === "CRITICAL") && " Critical issues require immediate attention. "}
                      {(() => {
                        const critical = diagnosticReports.filter(r => r.urgency === "CRITICAL").length
                        const high = diagnosticReports.filter(r => r.urgency === "HIGH").length
                        const medium = diagnosticReports.filter(r => r.urgency === "MEDIUM").length
                        const parts = []
                        if (critical > 0) parts.push(`${critical} critical`)
                        if (high > 0) parts.push(`${high} high priority`)
                        if (medium > 0) parts.push(`${medium} medium priority`)
                        return parts.join(", ") + "."
                      })()}
                    </p>
                  </div>

                  {/* Fault Cards */}
                  <div className="space-y-3">
                    {diagnosticReports.map((report) => (
                      <div
                        key={report.id}
                        className={`relative p-5 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${getSeverityBg(report.urgency)}`}
                      >
                        {/* Severity indicator bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gradient-to-b ${getSeverityColor(report.urgency)}`} />
                        
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`text-xl font-black tracking-tight bg-gradient-to-r ${getSeverityColor(report.urgency)} bg-clip-text text-transparent`}>
                              {report.code}
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded bg-gradient-to-r ${getSeverityColor(report.urgency)} text-white`}>
                              {report.urgency}
                            </span>
                          </div>
                          <button
                            onClick={() => speakText(report.hinglish, report.code)}
                            className={`p-3 rounded-full transition-all ${
                              isSpeaking === report.code
                                ? "bg-cyan-400 text-black animate-pulse"
                                : "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                            }`}
                          >
                            <Volume2 size={16} />
                          </button>
                        </div>

                        <div className="mb-3">
                          <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider">Issue: </span>
                          <span className="text-sm text-white font-medium">{report.issue}</span>
                        </div>

                        <div className="p-3 rounded-lg bg-black/30 border border-slate-700/50">
                          <p className="text-xs text-slate-300 leading-relaxed italic">{report.hinglish}</p>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {report.checklist.map((item, i) => (
                            <span key={i} className="text-[9px] px-2 py-1 rounded bg-slate-800 text-slate-400 uppercase tracking-wider">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Panel>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Terminal */}
            <Panel title="System Terminal" icon={TerminalIcon}>
              <div className="h-80 overflow-y-auto rounded-lg bg-black/50 p-3 font-mono text-[10px] border border-slate-800">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={`leading-relaxed ${
                      log.includes("[ERROR]") ? "text-red-400" :
                      log.includes("[WARN]") ? "text-yellow-400" :
                      log.includes("[AI]") ? "text-cyan-400" :
                      log.includes("[AUDIO]") ? "text-green-400" :
                      "text-slate-400"
                    }`}
                  >
                    {log}
                  </div>
                ))}
                <div ref={logsEndRef} />
                <div className="flex items-center gap-1 text-cyan-400 mt-2">
                  <span className="animate-pulse">_</span>
                </div>
              </div>
            </Panel>

            {/* Quick Stats */}
            <Panel title="Quick Actions" icon={Zap}>
              <div className="space-y-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs uppercase tracking-wider hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Upload size={16} />
                  Upload New Scan
                </button>
                <button
                  onClick={() => {
                    setDiagnosticReports([])
                    setAiAnalysis(null)
                    setUploadStatus("idle")
                    addLog("[SYSTEM] Buffer cleared.")
                  }}
                  className="w-full p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={16} />
                  Clear Data
                </button>
              </div>
            </Panel>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-cyan-800/30 text-center">
          <p className="text-[10px] text-slate-500 tracking-[0.3em] uppercase">
            J.A.R.V.I.S. OBD2 Diagnostic System v2.0 // Powered by Gemini AI
          </p>
        </footer>
      </div>
    </div>
  )
}
