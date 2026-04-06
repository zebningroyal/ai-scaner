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
  Bot
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import ReactMarkdown from 'react-markdown';
import { analyzeCarData, chatWithJarvis, generateJarvisVoice } from './services/geminiService';

// Set up PDF.js worker using Vite's ?url import for the local package worker
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type ViewState = 'upload' | 'loading' | 'result';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [view, setView] = useState<ViewState>('upload');
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
    setView('upload');
    setPdfFile(null);
    setImageFile(null);
    setImagePreview(null);
    setManualText('');
    setDiagnosis('');
    setChatHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
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
                <h2 className="text-blue-400 text-3xl md:text-5xl font-black tracking-widest uppercase leading-tight">
                  <TypingText text="WELCOME TO JARVIS WORLD OF CAR" soundEnabled={true} />
                </h2>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.5 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-[1px] w-12 bg-blue-500/30"></div>
                    <p className="text-blue-400/60 text-sm tracking-[0.5em] uppercase font-light">
                      Neural Link Established
                    </p>
                    <div className="h-[1px] w-12 bg-blue-500/30"></div>
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
              <h1 className="text-4xl font-black tracking-tighter text-blue-400 flex items-baseline gap-2">
                JARVIS <span className="text-white text-xl font-light opacity-50">v2.1</span>
              </h1>
              <div className="text-slate-400 text-xs font-mono mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <TypingText text="SYSTEM ACTIVE: NEURAL CAR DIAGNOSTIC" delay={1000} />
              </div>
            </motion.div>
            <motion.div 
              animate={{ 
                boxShadow: ["0 0 10px rgba(59,130,246,0.2)", "0 0 25px rgba(59,130,246,0.5)", "0 0 10px rgba(59,130,246,0.2)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Car className="w-7 h-7 text-blue-400 relative z-10" />
              <motion.div 
                animate={{ top: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-blue-400/50 blur-sm z-20"
              />
            </motion.div>
          </div>
          
          {/* Decorative scanning line across header */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute -bottom-4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent origin-left"
          />
        </header>

        <main className="relative">
          <AnimatePresence mode="wait">
            {view === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-6 shadow-2xl"
              >
                <div className="text-center mb-8">
                  <p className="text-slate-300 font-medium">Upload PDF Scan, Dashboard Image, or Paste Text</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-blue-500/30 rounded-2xl cursor-pointer hover:bg-blue-500/5 hover:border-blue-500/50 transition-all group">
                    <FileText className="w-10 h-10 mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Report PDF</p>
                    <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                  </label>

                  <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-blue-500/30 rounded-2xl cursor-pointer hover:bg-blue-500/5 hover:border-blue-500/50 transition-all group">
                    <Camera className="w-10 h-10 mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dashboard Photo</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>

                <div className="h-6 mb-4 text-center">
                  <p id="selection-status" className="text-xs font-medium text-blue-400 truncate">
                    {pdfFile ? `📄 PDF Selected: ${pdfFile.name}` : imageFile ? `🖼️ Image Selected: ${imageFile.name}` : ''}
                  </p>
                </div>

                <div className="relative group">
                  <textarea 
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Paste scan text manually..." 
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-sm focus:border-blue-500/50 focus:outline-none h-28 text-slate-300 transition-all resize-none"
                  />
                  <div className="absolute top-4 right-4 text-slate-600">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                
                <button 
                  onClick={handleAnalyze}
                  className="w-full mt-8 py-4 rounded-2xl font-bold bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
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
                className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-12 shadow-2xl text-center"
              >
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-t-blue-500 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Car className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
                <p className="text-blue-400 font-bold text-lg mb-2 animate-pulse">{loadingMsg}</p>
                <p className="text-slate-500 text-sm">Accessing neural diagnostic database...</p>
              </motion.div>
            )}

            {view === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                      <RefreshCw className="w-5 h-5" />
                      Scan Results
                    </h2>
                    <button 
                      onClick={resetScan}
                      className="text-[10px] font-bold text-slate-400 hover:text-white uppercase px-3 py-1.5 bg-slate-800 rounded-lg transition-colors"
                    >
                      New Scan
                    </button>
                  </div>
                  
                  {imagePreview && (
                    <div className="mb-6 rounded-2xl overflow-hidden border border-blue-500/20 shadow-lg">
                      <img src={imagePreview} className="w-full h-48 object-cover" alt="Analyzed car part" />
                    </div>
                  )}

                  <div className="prose prose-invert prose-sm max-w-none bg-slate-950/40 p-5 rounded-2xl border-l-4 border-blue-500 mb-6 shadow-inner">
                    <ReactMarkdown>{diagnosis}</ReactMarkdown>
                  </div>

                  <button 
                    onClick={handleTts}
                    disabled={isTtsLoading}
                    className="w-full py-3 rounded-xl bg-blue-600/10 border border-blue-500/30 text-xs font-bold hover:bg-blue-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isTtsLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    )}
                    LISTEN TO JARVIS
                  </button>

                  <div className="mt-8 pt-6 border-t border-slate-800">
                    <p className="text-[10px] text-slate-500 mb-4 uppercase font-black tracking-[0.2em]">✨ Neural Chat Interface</p>
                    
                    <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {chatHistory.map((msg, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={idx} 
                          className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-800 border border-blue-500/30'}`}>
                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-400" />}
                          </div>
                          <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800/50 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                            {msg.text}
                          </div>
                        </motion.div>
                      ))}
                      {isChatLoading && (
                        <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-800 border border-blue-500/30 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="bg-slate-800/50 p-3 rounded-2xl rounded-tl-none border border-slate-700">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="flex gap-2">
                      <input 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                        type="text" 
                        placeholder="e.g. Can I fix this myself?" 
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-all" 
                      />
                      <button 
                        onClick={handleChatSend}
                        disabled={isChatLoading}
                        className="bg-blue-600 p-3 rounded-xl hover:bg-blue-500 transition-all active:scale-90 disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-12 text-center">
          <p className="text-slate-600 text-[10px] uppercase font-bold tracking-[0.3em]">Shazeb Labs • Neural Edition</p>
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
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3b82f6;
        }
      `}</style>
    </div>
  );
}
