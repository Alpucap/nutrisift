/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { 
  Camera, X, Zap, Image as ImageIcon, Loader2, 
  AlertTriangle, RefreshCw, ShieldCheck, Biohazard, 
  ChevronDown, ChevronUp, Search, Monitor, Smartphone, 
  ScanBarcode
} from "lucide-react";
import Image from "next/image";

// --- INTERFACES ---
interface AnalysisResult {
  product_name: string;
  detected_ingredients_text: string;
  health_score: number;
  halal_analysis: {
    status: string;
    reason: string;
  };
  allergen_list: string[];
  nutrition_summary: {
    sugar_g: number;
    sugar_teaspoons: number;
  };
  alerts: {
    name: string;
    category: string;
    risk: string;
    severity: string;
  }[];
  brief_conclusion: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ApiError {
  error?: string;
}

export default function Home() {
    // State: Scanner & Analysis
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [showIngredients, setShowIngredients] = useState(false);

    // State: Chat
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);

    // Refs
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const videoConstraints = { facingMode: "environment" };

    // --- HANDLERS ---

    const capture = useCallback(() => {
      if (webcamRef.current) {
        setImage(webcamRef.current.getScreenshot());
        setIsCameraOpen(false);
      }
    }, [webcamRef]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result as string);
          setResult(null);
        };
        reader.readAsDataURL(file);
      }
    };

    const analyzeImage = async () => {
      if (!image) return;
      setLoading(true);
      setResult(null);
      setChatMessages([]); // Reset chat on new analysis
      
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image }),
        });
        const data = await response.json() as AnalysisResult & ApiError;
        if (data.error) throw new Error(data.error);
        setResult(data);
      } catch (error) {
        console.error(error);
        alert("Analysis failed. Ensure text is clearly visible.");
      } finally {
        setLoading(false);
      }
    };

    const handleSendChat = async () => {
      if (!chatInput.trim() || !result) return;

      const userMsg = chatInput;
      setChatInput(""); // Clear input
      setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
      setChatLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            message: userMsg, 
            productContext: result 
          }),
        });

        const data = await response.json();
        
        setChatMessages(prev => [...prev, { 
          role: "assistant", 
          content: data.reply || "Connection error. Please try again." 
        }]);
      } catch (error) {
        console.error(error);
        setChatMessages(prev => [...prev, { 
          role: "assistant", 
          content: "Sorry, I encountered an error answering that." 
        }]);
      } finally {
        setChatLoading(false);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    };

    const handleReset = () => {
      setImage(null);
      setResult(null);
      setShowIngredients(false);
      setChatMessages([]);
      setChatInput("");
    };

    return (
      <main className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-10">
        
        {/* === HEADER === */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                <Zap size={22} fill="currentColor" />
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight leading-none text-gray-900">NutriSift AI</h1>
                <p className="text-[10px] text-blue-600 font-bold tracking-wider uppercase">Multi-Platform Scanner</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4 text-xs font-medium text-gray-400 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
              <span className="flex items-center gap-1"><Monitor size={14}/> Desktop Ready</span>
              <div className="w-px h-3 bg-gray-300"></div>
              <span className="flex items-center gap-1"><Smartphone size={14}/> Mobile Optimized</span>
            </div>
          </div>
        </nav>

        {/* === CAMERA MODAL === */}
        {isCameraOpen && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800 aspect-[3/4] md:aspect-video">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Overlay Guide */}
              <div className="absolute inset-0 border-[40px] border-black/40 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-white/50 w-3/4 h-1/2 rounded-xl"></div>
              </div>
              {/* Close Button */}
              <button onClick={() => setIsCameraOpen(false)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 backdrop-blur-md z-10">
                <X size={24} />
              </button>
            </div>
            
            <div className="mt-8 flex items-center gap-8">
              <button onClick={capture} className="w-20 h-20 bg-white rounded-full border-4 border-gray-400 flex items-center justify-center active:scale-95 transition-transform hover:border-white shadow-xl shadow-white/10">
                <div className="w-16 h-16 rounded-full bg-blue-600"></div>
              </button>
            </div>
            <p className="text-white mt-4 font-medium">Take a photo of the nutrition label</p>
          </div>
        )}

        {/* === MAIN CONTENT === */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

          {/* --- HERO SECTION --- */}
          {!image && !result && (
            <div className="flex flex-col md:flex-row items-center justify-center min-h-[60vh] gap-12 animate-in slide-in-from-bottom-5 duration-500">
              
              <div className="flex-1 text-center md:text-left space-y-6 max-w-lg">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-2">
                  <ShieldCheck size={16} />
                  AI Food Safety Assistant
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                  Scan Once,<br/>
                  <span className="text-blue-600">Know Everything.</span>
                </h2>
                <p className="text-lg text-gray-500 leading-relaxed">
                  Check Halal status, detect hidden Allergens, and calculate sugar in seconds using Gemini AI.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button 
                      onClick={() => setIsCameraOpen(true)}
                      className="flex-1 bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                    >
                      <Camera size={24} /> Open Camera
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 bg-white text-gray-700 font-bold py-4 px-8 rounded-2xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3"
                    >
                      <ImageIcon size={24} /> Upload File
                    </button>
                </div>
              </div>

              {/* Illustration */}
              <div className="flex-1 flex justify-center md:justify-end opacity-80 md:opacity-100">
                <div className="relative w-64 h-64 md:w-80 md:h-80 bg-gradient-to-tr from-blue-100 to-purple-50 rounded-full flex items-center justify-center animate-pulse-slow shadow-2xl shadow-blue-100">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
                      <ScanBarcode 
                        size={140} 
                        className="text-blue-600 relative z-10 drop-shadow-sm" 
                        strokeWidth={1.5}
                      />
                    </div>
                    
                    <div className="absolute top-10 right-10 bg-white p-3 rounded-2xl shadow-lg animate-bounce duration-1000">
                      <ShieldCheck size={24} className="text-emerald-500" />
                    </div>
                    <div className="absolute bottom-10 left-10 bg-white p-3 rounded-2xl shadow-lg animate-bounce duration-1000 delay-500">
                      <Zap size={24} className="text-orange-500" />
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* --- ANALYSIS DASHBOARD --- */}
          {(image || result) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in duration-500">
              
              {/* Left Column: Image Preview */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="lg:sticky lg:top-28 space-y-4">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-100 group">
                    <Image 
                      src={image!} 
                      alt="Preview" 
                      width={0}
                      height={0}
                      sizes="100vw"
                      className="w-full h-auto object-contain max-h-[500px]"
                      unoptimized
                    />
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                      <button onClick={() => setImage(null)} className="p-3 bg-white/20 text-white rounded-full hover:bg-white/40 backdrop-blur-md border border-white/50">
                          <X size={24} />
                      </button>
                    </div>
                  </div>

                  {!result && (
                    <button 
                      onClick={analyzeImage} 
                      disabled={loading} 
                      className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-3 text-lg"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <Zap size={24} fill="currentColor" />}
                      {loading ? "Analyzing..." : "Start Analysis"}
                    </button>
                  )}

                  {result && (
                    <button 
                      onClick={handleReset}
                      className="w-full bg-white text-gray-900 font-bold py-4 rounded-xl shadow-sm border border-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2 mt-6 hover:bg-gray-50"
                    >
                      <RefreshCw size={20} />
                      Scan Another Product
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Results */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6 pb-20">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4">
                      <Loader2 size={48} className="animate-spin text-blue-600" />
                      <p className="font-medium animate-pulse">Reading nutrition label...</p>
                    </div>
                )}

                {result && (
                  <>
                    {/* Header Card */}
                    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl border border-blue-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
                        
                        <div className="relative z-10">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                              <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                                {result.product_name || "Product Detected"}
                              </h2>
                              <div className={`self-start px-4 py-2 rounded-xl text-sm font-bold border shadow-sm ${
                                  result.health_score > 70 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                  result.health_score > 40 ? "bg-orange-50 text-orange-700 border-orange-200" :
                                  "bg-red-50 text-red-700 border-red-200"
                              }`}>
                                  Health Score: <span className="text-lg">{result.health_score}</span>/100
                              </div>
                          </div>
                          <p className="text-gray-600 text-base md:text-lg leading-relaxed border-l-4 border-blue-200 pl-4">
                            {result.brief_conclusion}
                          </p>
                        </div>
                    </div>

                    {/* Three Pillars */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Halal */}
                        <div className={`p-5 rounded-2xl border flex flex-row md:flex-col items-center gap-4 md:gap-2 md:text-center shadow-sm transition-transform hover:scale-[1.02] ${
                            result.halal_analysis.status === "Halal Safe" ? "bg-emerald-50 border-emerald-100" :
                            result.halal_analysis.status.includes("Syubhat") ? "bg-yellow-50 border-yellow-100" : "bg-red-50 border-red-100"
                        }`}>
                            <div className="bg-white/50 p-3 rounded-full">
                              <ShieldCheck size={28} className={
                                  result.halal_analysis.status === "Halal Safe" ? "text-emerald-600" :
                                  result.halal_analysis.status.includes("Syubhat") ? "text-yellow-600" : "text-red-600"
                              } />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Halal Status</p>
                              <p className="font-bold text-lg text-gray-900">
                                  {result.halal_analysis.status === "Halal Safe" ? "Safe" : 
                                  result.halal_analysis.status.includes("Syubhat") ? "Syubhat" : "Non-Halal"}
                              </p>
                            </div>
                        </div>

                        {/* Allergen */}
                        <div className={`p-5 rounded-2xl border flex flex-row md:flex-col items-center gap-4 md:gap-2 md:text-center shadow-sm transition-transform hover:scale-[1.02] ${
                            result.allergen_list.length === 0 ? "bg-blue-50 border-blue-100" : "bg-red-50 border-red-100"
                        }`}>
                            <div className="bg-white/50 p-3 rounded-full">
                              <Biohazard size={28} className={result.allergen_list.length === 0 ? "text-blue-600" : "text-red-600"} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Allergens</p>
                              <p className="font-bold text-lg text-gray-900">
                                  {result.allergen_list.length === 0 ? "0 Found" : `${result.allergen_list.length} Items`}
                              </p>
                            </div>
                        </div>

                        {/* Sugar */}
                        <div className="p-5 rounded-2xl border bg-white border-gray-100 flex flex-row md:flex-col items-center gap-4 md:gap-2 md:text-center shadow-sm transition-transform hover:scale-[1.02]">
                            <div className="bg-blue-50 p-3 rounded-full text-blue-600 font-black text-lg">
                              {result.nutrition_summary.sugar_g}g
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sugar</p>
                              <p className="font-bold text-lg text-gray-900">≈ {result.nutrition_summary.sugar_teaspoons} tsp</p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Alerts */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                          <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-orange-500" /> 
                            Deep Analysis
                          </h3>
                        </div>
                        
                        <div className="divide-y divide-gray-100">
                          {result.halal_analysis.status !== "Halal Safe" && (
                              <div className="p-5 bg-red-50/30 flex gap-4">
                                <div className="shrink-0 mt-1"><ShieldCheck size={20} className="text-red-500"/></div>
                                <div>
                                    <h4 className="font-bold text-red-700 text-sm">Halal Issues</h4>
                                    <p className="text-sm text-gray-600 mt-1">{result.halal_analysis.reason}</p>
                                </div>
                              </div>
                          )}

                          {result.allergen_list.length > 0 && (
                              <div className="p-5 bg-orange-50/30 flex gap-4">
                                <div className="shrink-0 mt-1"><Biohazard size={20} className="text-orange-500"/></div>
                                <div>
                                    <h4 className="font-bold text-orange-700 text-sm">Allergens Detected</h4>
                                    <p className="text-sm text-gray-600 mt-1">Contains: <b>{result.allergen_list.join(", ")}</b></p>
                                </div>
                              </div>
                          )}

                          {result.alerts.map((item, idx) => (
                              <div key={idx} className="p-5 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-900">{item.name}</span>
                                    <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide border ${
                                        item.category === "Halal" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                        item.category === "Allergy" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                        "bg-blue-50 text-blue-700 border-blue-200"
                                    }`}>
                                        {item.category}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{item.risk}</p>
                              </div>
                          ))}

                          {result.alerts.length === 0 && result.halal_analysis.status === "Halal Safe" && (
                              <div className="p-10 text-center">
                                <ShieldCheck size={48} className="mx-auto text-emerald-200 mb-3" />
                                <p className="font-medium text-gray-400">No harmful ingredients found.</p>
                              </div>
                          )}
                        </div>
                    </div>

                    {/* Verification Accordion */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <button 
                          onClick={() => setShowIngredients(!showIngredients)}
                          className="w-full flex justify-between items-center px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 text-gray-700 font-semibold">
                              <Search size={18} />
                              <span>Verify Read Results (OCR)</span>
                          </div>
                          {showIngredients ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        
                        {showIngredients && (
                          <div className="p-6 bg-white border-t border-gray-200 animate-in slide-in-from-top-2">
                              <p className="text-xs text-gray-400 mb-3">
                                *Ensure the text below matches the physical label for accurate analysis.
                              </p>
                              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs font-mono text-gray-600 whitespace-pre-wrap break-words leading-relaxed">
                                {result.detected_ingredients_text || "No text detected."}
                              </div>
                          </div>
                        )}
                    </div>

                    {/* --- CHATBOT SECTION --- */}
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-lg overflow-hidden mt-6">
                      <div className="bg-blue-600 px-6 py-4 flex items-center gap-2">
                        <div className="bg-white/20 p-1.5 rounded-lg">
                            <Zap size={18} className="text-white" fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Ask NutriSift</h3>
                            <p className="text-[10px] text-blue-100">AI Consultant for this product</p>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50/50 min-h-[200px] max-h-[400px] overflow-y-auto space-y-4">
                        {/* Welcome Message */}
                        {chatMessages.length === 0 && (
                            <div className="text-center text-gray-400 text-xs py-4">
                              <p>Curious? Try asking:</p>
                              <div className="flex flex-wrap justify-center gap-2 mt-3">
                                  <button onClick={() => setChatInput("Safe for pregnancy?")} className="px-3 py-1 bg-white border border-gray-200 rounded-full hover:bg-blue-50 transition-colors">🤰 Pregnancy safe?</button>
                                  <button onClick={() => setChatInput("Is this keto friendly?")} className="px-3 py-1 bg-white border border-gray-200 rounded-full hover:bg-blue-50 transition-colors">🥑 Keto friendly?</button>
                                  <button onClick={() => setChatInput("Why is the score low?")} className="px-3 py-1 bg-white border border-gray-200 rounded-full hover:bg-blue-50 transition-colors">📉 Why low score?</button>
                              </div>
                            </div>
                        )}

                        {/* Chat List */}
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                  msg.role === "user" 
                                    ? "bg-blue-600 text-white rounded-br-none" 
                                    : "bg-white border border-gray-200 text-gray-700 rounded-bl-none shadow-sm"
                              }`}>
                                  {msg.content}
                              </div>
                            </div>
                        ))}
                        
                        {/* Loading Indicator */}
                        {chatLoading && (
                            <div className="flex justify-start">
                              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                              </div>
                            </div>
                        )}
                        <div ref={chatEndRef}></div>
                      </div>

                      {/* Input Area */}
                      <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                            placeholder="Type your question..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                        <button 
                            onClick={handleSendChat}
                            disabled={chatLoading || !chatInput.trim()}
                            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Zap size={20} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          )}

          {/* Hidden Input */}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

        </div>
      </main>
    );
}