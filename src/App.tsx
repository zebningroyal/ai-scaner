/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const Particles = ({ count = 60 }: { count?: number }) => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: Math.random() * 0.2 + 0.05,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            y: [null, (Math.random() * 100) + "%"],
            x: [null, (Math.random() * 100) + "%"],
            opacity: [0.05, 0.3, 0.05]
          }}
          transition={{ 
            duration: Math.random() * 30 + 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
      ))}
    </div>
  );
};

const TypingText = ({ text, delay = 0, soundEnabled = false }: { text: string; delay?: number; soundEnabled?: boolean }) => {
  const [displayedText, setDisplayedText] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (soundEnabled) {
      // Using a pleasant typing sound
      audioRef.current = new Audio("https://www.soundjay.com/communication/typewriter-key-1.mp3");
      audioRef.current.volume = 0.1;
    }
  }, [soundEnabled]);

  useEffect(() => {
    let timeout: any;
    let i = 0;
    
    const startTyping = () => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        if (soundEnabled && audioRef.current && text[i] !== " ") {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
        i++;
        timeout = setTimeout(startTyping, 60);
      }
    };
    
    const initialDelay = setTimeout(startTyping, delay);
    
    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timeout);
    };
  }, [text, delay, soundEnabled]);
  
  return <span>{displayedText}<span className="animate-pulse">_</span></span>;
};

import { 
  Car, 
  FileText, 
  Camera, 
  Send, 
  Volume2, 
  RefreshCw, 
  AlertCircle,
  Loader2,
  ChevronRight,
  User,
  Bot,
  Zap,
  Gauge,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import ReactMarkdown from 'react-markdown';
import { analyzeCarData, chatWithJarvis, generateJarvisVoice } from './services/geminiService';

// Set up PDF.js worker using Vite's ?url import for the local package worker
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type ViewState = 'intro' | 'upload' | 'loading' | 'result';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [view, setView] = useState<ViewState>('intro');
  const [isBooting, setIsBooting] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Initializing Jarvis systems...');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
      setImageFile(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setPdfFile(null);
      const url = URL.createObjectURL(e.target.files[0]);
      setImagePreview(url);
    }
  };

  const extractTextFromPdf = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let extractedContent = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const items = textContent.items as any[];
      
      const lines: Record<number, any[]> = {};
      items.forEach(item => {
        const y = Math.round(item.transform[5]); 
        if (!lines[y]) lines[y] = [];
        lines[y].push(item);
      });
      
      const sortedY = Object.keys(lines).map(Number).sort((a, b) => b - a);
      sortedY.forEach(y => {
        const lineItems = lines[y].sort((a, b) => a.transform[4] - b.transform[4]);
        extractedContent += lineItems.map(item => item.str).join(" ") + "\n";
      });
    }
    return extractedContent;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!pdfFile && !imageFile && !manualText.trim()) {
      alert("Please provide a report, image, or text first, Sir.");
      return;
    }

    setView('loading');
    setLoadingMsg("Initializing Jarvis systems...");

    try {
      let context = "";
      let base64Image = undefined;

      if (pdfFile) {
        setLoadingMsg("Scanning PDF documents...");
        context = await extractTextFromPdf(pdfFile);
      } else if (imageFile) {
        setLoadingMsg("Processing visual scan...");
        base64Image = await fileToBase64(imageFile);
        context = "Visual inspection required for attached dashboard photo.";
      } else {
        context = manualText;
      }

      setLoadingMsg("Running diagnostic algorithms...");
      const result = await analyzeCarData(context, base64Image);
      setDiagnosis(result);
      setView('result');
    } catch (err: any) {
      console.error(err);
      setDiagnosis(`System Error: ${err.message || "Unknown error occurred"}`);
      setView('result');
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const history = [
        { role: 'model' as const, parts: [{ text: `Diagnosis Context: ${diagnosis}` }] },
        ...chatHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
        }))
      ];
      
      const answer = await chatWithJarvis(history, userMsg);
      setChatHistory(prev => [...prev, { role: 'model', text: answer }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'model', text: "Neural link failed, sir. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleTts = async () => {
    if (!diagnosis || isTtsLoading) return;
    setIsTtsLoading(true);

    try {
      const base64 = await generateJarvisVoice(diagnosis);
      if (base64) {
        playPCM(base64);
      }
    } catch (err) {
      console.error(err);
      alert("Voice synthesis failed, sir.");
    } finally {
      setIsTtsLoading(false);
    }
  };

  const playPCM = (base64: string) => {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Int16Array(len / 2);
    for (let i = 0; i < len; i += 2) {
      bytes[i / 2] = binary.charCodeAt(i) | (binary.charCodeAt(i + 1) << 8);
    }
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    const buffer = audioContextRef.current.createBuffer(1, bytes.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < bytes.length; i++) {
      channelData[i] = bytes[i] / 32768;
    }
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  };

  const resetScan = () => {
    setView('intro');
    setPdfFile(null);
    setImageFile(null);
    setImagePreview(null);
    setManualText('');
    setDiagnosis('');
    setChatHistory([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-slate-50 font-sans selection:bg-purple-500/30 overflow-x-hidden relative">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none"></div>
      <Particles count={80} />
      <AnimatePresence>
        {isBooting && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center p-6 overflow-hidden"
          >
            {/* Particles are already rendered in the main container */}
            
            <div className="flex flex-col items-center">
              <div className="text-center font-mono space-y-8 max-w-2xl">
                <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-3xl md:text-5xl font-black tracking-widest uppercase leading-tight">
                  <TypingText text="WELCOME TO JARVIS WORLD OF CAR" soundEnabled={true} />
                </h2>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.5 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-purple-500/30"></div>
                    <p className="text-purple-400/60 text-sm tracking-[0.5em] uppercase font-light">
                      Neural Link Established
                    </p>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-purple-500/30"></div>
                  </div>
                  <p className="text-slate-600 text-xs uppercase tracking-widest animate-pulse">
                    Accessing secure connection to Shazeb Labs v2.1
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="relative mb-12">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-baseline gap-2">
                JARVIS <span className="text-white/50 text-xl font-light">v2.1</span>
              </h1>
              <div className="text-slate-400 text-xs font-mono mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-pink-400 animate-pulse"></span>
                <TypingText text="SYSTEM ACTIVE: NEURAL CAR DIAGNOSTIC" delay={1000} />
              </div>
            </motion.div>
            <motion.div 
              animate={{ 
                boxShadow: ["0 0 20px rgba(99,102,241,0.2)", "0 0 40px rgba(168,85,247,0.4)", "0 0 20px rgba(236,72,153,0.2)"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-pink-500/20 border border-purple-500/40 flex items-center justify-center overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Car className="w-7 h-7 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 relative z-10" />
              <motion.div 
                animate={{ top: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-sm z-20"
              />
            </motion.div>
          </div>
          
          {/* Decorative scanning line across header */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute -bottom-4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent origin-left"
          />
        </header>

        <main className="relative">
          <AnimatePresence mode="wait">
            {view === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-12 py-4"
              >
                {/* Hero Section with Large Text */}
                <div className="relative">
                  {/* Decorative background elements */}
                  <motion.div
                    animate={{ 
                      top: [0, -20, 0],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none"
                  />
                  <motion.div
                    animate={{ 
                      bottom: [0, 20, 0],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -bottom-32 -left-20 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none"
                  />

                  <div className="relative z-10 text-center space-y-8">
                    {/* Animated icon */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.1 }}
                      className="flex justify-center"
                    >
                      <div className="relative w-28 h-28">
                        <motion.div
                          animate={{ 
                            rotate: 360,
                            scale: [1, 1.15, 1]
                          }}
                          transition={{ 
                            rotate: { duration: 5, repeat: Infinity, ease: "linear" },
                            scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                          }}
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-2xl opacity-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-pink-500/30 rounded-full border-2 border-white/30 backdrop-blur-2xl flex items-center justify-center shadow-2xl">
                          <motion.div
                            animate={{ 
                              y: [0, -10, 0],
                              rotate: [0, 8, 0, -8, 0]
                            }}
                            transition={{ 
                              duration: 3, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <Car className="w-14 h-14 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-pink-300" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Main Headline */}
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 80 }}
                      className="space-y-4"
                    >
                      <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight">
                        <span className="block text-slate-100">Understand Your</span>
                        <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Vehicle Like Never</span>
                        <span className="block text-slate-100">Before</span>
                      </h1>
                      <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Advanced AI diagnostics with JARVIS. Upload your car's diagnostic data, dashboard photos, or scan codes to get instant, intelligent analysis powered by cutting-edge neural networks.
                      </p>
                    </motion.div>

                    {/* Primary CTA Button */}
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
                    >
                      <button
                        onClick={() => setView('upload')}
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 text-white shadow-2xl shadow-purple-500/50 hover:shadow-3xl hover:shadow-purple-500/60 transition-all hover:scale-105 active:scale-95"
                      >
                        <span className="text-lg">Start Scanning Now</span>
                        <motion.div
                          animate={{ x: [0, 6, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="w-6 h-6" />
                        </motion.div>
                      </button>
                    </motion.div>
                  </div>
                </div>

                {/* Features Showcase - 2 Column */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 70 }}
                  className="grid md:grid-cols-2 gap-6"
                >
                  {[
                    {
                      icon: FileText,
                      title: "PDF Report Analysis",
                      desc: "Upload diagnostic reports and get instant AI-powered insights",
                      color: "from-blue-500 to-cyan-500"
                    },
                    {
                      icon: Camera,
                      title: "Image Recognition",
                      desc: "Dashboard photos analyzed with advanced computer vision",
                      color: "from-purple-500 to-pink-500"
                    }
                  ].map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: idx === 0 ? -40 : 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      whileHover={{ y: -8 }}
                      className="group bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 hover:border-white/40 transition-all"
                    >
                      <motion.div
                        animate={{ rotate: [0, 12, -12, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: idx * 0.3 }}
                        className={`inline-block p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg`}
                      >
                        <feature.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-pink-400 transition-all">
                        {feature.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                        {feature.desc}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Capabilities Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 70 }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-2">JARVIS Capabilities</h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mx-auto"></div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: Zap, label: "Instant Results", delay: 0.7 },
                      { icon: Gauge, label: "Precision AI", delay: 0.75 },
                      { icon: Sparkles, label: "Neural Analysis", delay: 0.8 },
                      { icon: RefreshCw, label: "Live Chat", delay: 0.85 }
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: item.delay,
                          type: "spring",
                          stiffness: 100,
                          damping: 12
                        }}
                        whileHover={{ scale: 1.08, y: -4 }}
                        className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center hover:border-purple-400/50 hover:bg-white/15 transition-all cursor-default"
                      >
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: idx * 0.15 }}
                          className="flex justify-center mb-3"
                        >
                          <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 group-hover:scale-125 transition-transform">
                            <item.icon className="w-8 h-8 mx-auto" />
                          </div>
                        </motion.div>
                        <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                          {item.label}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Feature List with Premium Look */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 70 }}
                  className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl"
                >
                  <h3 className="text-2xl font-bold text-white mb-8 text-center">Why Choose JARVIS?</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { num: "1", title: "Multi-Format Support", desc: "PDF reports, car photos, diagnostic codes - we handle it all" },
                      { num: "2", title: "AI-Powered Insights", desc: "Get intelligent, context-aware analysis of your vehicle's health" },
                      { num: "3", title: "Interactive Q&A", desc: "Chat with JARVIS neural AI to understand every detail" },
                      { num: "4", title: "Real-Time Feedback", desc: "Instant diagnostics with zero configuration needed" }
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ x: idx % 2 === 0 ? -20 : 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.85 + idx * 0.08 }}
                        className="flex gap-4 group"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                          className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-lg group-hover:scale-110 transition-transform shadow-lg"
                        >
                          {item.num}
                        </motion.div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-lg mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-pink-400 transition-all">
                            {item.title}
                          </h4>
                          <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                            {item.desc}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Secondary CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center pt-6"
                >
                  <p className="text-slate-400 mb-6">Ready to experience neural car diagnostics?</p>
                  <motion.button
                    onClick={() => setView('upload')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border-2 border-gradient-to-r from-purple-500 to-pink-500 border-transparent bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 text-white transition-all group"
                  >
                    Begin Analysis
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {view === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl"
              >
                <div className="text-center mb-8">
                  <p className="text-slate-300 font-medium">Upload PDF Scan, Dashboard Image, or Paste Text</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-purple-400/50 rounded-2xl cursor-pointer hover:bg-purple-500/10 hover:border-purple-400/80 transition-all group bg-white/5 backdrop-blur-sm">
                    <FileText className="w-10 h-10 mb-2 text-purple-400 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Report PDF</p>
                    <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                  </label>

                  <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-blue-400/50 rounded-2xl cursor-pointer hover:bg-blue-500/10 hover:border-blue-400/80 transition-all group bg-white/5 backdrop-blur-sm">
                    <Camera className="w-10 h-10 mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Dashboard Photo</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>

                <div className="h-6 mb-4 text-center">
                  <p id="selection-status" className="text-xs font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 truncate">
                    {pdfFile ? `📄 PDF Selected: ${pdfFile.name}` : imageFile ? `🖼️ Image Selected: ${imageFile.name}` : ''}
                  </p>
                </div>

                <div className="relative group">
                  <textarea 
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Paste scan text manually..." 
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-sm focus:border-purple-400/50 focus:outline-none h-28 text-slate-200 transition-all resize-none placeholder-slate-500"
                  />
                  <div className="absolute top-4 right-4 text-slate-500">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                
                <button 
                  onClick={handleAnalyze}
                  className="w-full mt-8 py-4 rounded-2xl font-bold bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(236,72,153,0.4)] hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  ANALYZE WITH JARVIS
                </button>
              </motion.div>
            )}

            {view === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 shadow-2xl text-center"
              >
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-t-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full border-l-blue-500 border-r-pink-500 border-b-purple-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Car className="w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400" />
                  </div>
                </div>
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 font-bold text-lg mb-2 animate-pulse">{loadingMsg}</p>
                <p className="text-slate-400 text-sm">Accessing neural diagnostic database...</p>
              </motion.div>
            )}

            {view === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 80 }}
                className="space-y-8"
              >
                {/* Header Section */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between mb-2"
                >
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Diagnosis Complete
                    </h1>
                    <p className="text-slate-400 text-sm mt-2">JARVIS Neural Analysis Results</p>
                  </div>
                  <motion.button 
                    onClick={resetScan}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 rounded-full font-bold text-white bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/50 hover:from-purple-500/50 hover:to-pink-500/50 transition-all uppercase text-xs tracking-wider"
                  >
                    New Scan
                  </motion.button>
                </motion.div>

                {/* Image Preview - Enhanced */}
                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-gradient-to-br from-blue-500/10 to-pink-500/10">
                      <img src={imagePreview} className="w-full h-72 object-cover" alt="Analyzed car part" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent"></div>
                    </div>
                  </motion.div>
                )}

                {/* Main Diagnosis Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden">
                    <motion.div
                      animate={{ 
                        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                      }}
                      transition={{ duration: 15, repeat: Infinity }}
                      className="absolute -inset-full bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 opacity-40"
                      style={{ backgroundSize: '200% 200%' }}
                    />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400"
                        >
                          <Sparkles className="w-6 h-6" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
                          AI Analysis Report
                        </h2>
                      </div>

                      <div className="prose prose-invert prose-sm max-w-none text-slate-200 [&>*]:text-slate-200 [&>h1]:text-xl [&>h1]:font-bold [&>h1]:text-white [&>h1]:mb-3 [&>h1]:mt-4 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-white [&>h2]:mb-2 [&>p]:mb-3 [&>ul]:mb-3 [&>li]:mb-1">
                        <ReactMarkdown>{diagnosis}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* TTS Button - Enhanced */}
                <motion.button 
                  onClick={handleTts}
                  disabled={isTtsLoading}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-2 border-blue-400/50 text-blue-300 hover:from-blue-500/50 hover:to-cyan-500/50 hover:border-blue-300 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTtsLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>JARVIS is Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5 group-hover:scale-125 transition-transform" />
                      <span>Listen to JARVIS Explanation</span>
                    </>
                  )}
                </motion.button>

                {/* Chat Interface Section */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                    />
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      Ask JARVIS Questions
                    </h3>
                  </div>

                  {/* Chat Messages */}
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-3 custom-scrollbar bg-white/5 rounded-2xl p-4">
                    {chatHistory.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8 text-slate-500"
                      >
                        <p className="text-sm">Start asking JARVIS about your vehicle's diagnosis...</p>
                      </motion.div>
                    ) : (
                      chatHistory.map((msg, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={idx} 
                          className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: idx * 0.1 }}
                            className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-pink-500 text-white' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'}`}
                          >
                            {msg.role === 'user' ? 'U' : 'J'}
                          </motion.div>
                          <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className={`max-w-xs p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none shadow-lg' : 'bg-white/15 text-slate-100 rounded-bl-none border border-white/20'}`}
                          >
                            {msg.text}
                          </motion.div>
                        </motion.div>
                      ))
                    )}
                    {isChatLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-sm text-white">
                          J
                        </div>
                        <div className="bg-white/15 p-4 rounded-2xl rounded-bl-none border border-white/20 flex gap-1">
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-purple-400"
                          />
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                            className="w-2 h-2 rounded-full bg-pink-400"
                          />
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 rounded-full bg-blue-400"
                          />
                        </div>
                      </motion.div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="flex gap-3">
                    <motion.input 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isChatLoading && handleChatSend()}
                      type="text" 
                      placeholder="Ask me anything about your vehicle..." 
                      className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-sm text-slate-100 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 transition-all placeholder-slate-500"
                      disabled={isChatLoading}
                    />
                    <motion.button 
                      onClick={handleChatSend}
                      disabled={isChatLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 p-3 rounded-2xl hover:shadow-lg hover:shadow-purple-500/50 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                      <Send className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-12 text-center">
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.3em]">Shazeb Labs • Neural Edition</p>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168,85,247,0.5);
        }
      `}</style>
    </div>
  );
}
