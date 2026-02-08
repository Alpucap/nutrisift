"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
    ShieldCheck, Biohazard, 
    RefreshCw, ArrowLeft, Info, MessageCircle, AlertTriangle, 
    CheckCircle2, Search, ChevronDown, ChevronUp, Send, Leaf, Sprout
} from "lucide-react";

interface AnalysisResult {
    product_name: string;
    detected_ingredients_text: string;
    health_score: number;
    halal_analysis: { status: string; reason: string; };
    allergen_list: string[];
    nutrition_summary: { sugar_g: number; sugar_teaspoons: number; };
    alerts: { name: string; category: string; risk: string; severity: string; }[];
    brief_conclusion: string;
}

interface ChatMessage { role: "user" | "assistant"; content: string; }

export default function ResultPage() {
    const router = useRouter();
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const [showOCR, setShowOCR] = useState(false);
    const [showWarnings, setShowWarnings] = useState(true);

    useEffect(() => {
        const savedImage = localStorage.getItem("scanImage");
        if (!savedImage) {
            router.push("/scan");
            return;
        }
        setImage(savedImage);
        
        const analyzeImage = async (imgData: string) => {
            try {
                const response = await fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: imgData }),
                });
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                setResult(data);
            } catch (error) {
                console.error(error);
                alert("Analysis failed. Please try scanning again.");
            } finally {
                setLoading(false);
            }
        };

        analyzeImage(savedImage);
    }, [router]);

    const handleSendChat = async () => {
        if (!chatInput.trim() || !result) return;
        const userMsg = chatInput;
        setChatInput(""); 
        setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setChatLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg, productContext: result }),
            });
            const data = await response.json();
            setChatMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
        } catch (error) {
            console.error(error);
            setChatMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
        } finally {
            setChatLoading(false);
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
    };

    return (
        <main className="min-h-screen bg-forest-50 pb-20 font-sans text-forest-900">
        
        <nav className="bg-forest-50/80 border-b border-forest-200 sticky top-0 z-30 px-4 h-16 flex items-center justify-between shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => router.push("/scan")} 
                    className="p-2 hover:bg-forest-100 rounded-full transition-colors active:scale-95 text-forest-700"
                    aria-label="Back to scan"
                >
                    <ArrowLeft size={22} />
                </button>
                <h1 className="font-bold text-lg text-forest-800 tracking-tight">Analysis Report</h1>
            </div>
            <div className="text-forest-600 font-bold flex items-center gap-1.5 bg-forest-100 px-3 py-1.5 rounded-full border border-forest-200">
                <Leaf size={16} fill="currentColor"/>
                <span className="text-xs uppercase tracking-wide">Gemini 2.5</span>
            </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
            
            {loading && (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-8 animate-pulse">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-forest-200 border-t-forest-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Leaf size={32} className="text-forest-600" fill="currentColor"/>
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-forest-900">Analyzing Product...</h2>
                    <p className="text-forest-500 text-sm mt-2">Reading label, checking safety, and calculating nutrition.</p>
                </div>
            </div>
            )}

            {!loading && result && (
            <>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    
                    <div className="lg:col-span-5 flex flex-col gap-6 h-fit">
                        
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-forest-200 relative overflow-hidden transition-all hover:shadow-md">
                            <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -mr-10 -mt-10 opacity-30 ${
                                    result.health_score > 70 ? "bg-emerald-400" :
                                    result.health_score > 40 ? "bg-orange-400" : "bg-red-400"
                            }`}></div>
                            
                            <div className="flex justify-between items-start z-10 relative">
                                    <div className="w-2/3 pr-2 space-y-2">
                                    <h2 className="text-2xl font-black text-forest-900 leading-tight">
                                        {result.product_name || "Product Detected"}
                                    </h2>
                                    <p className="text-xs text-forest-600/80 leading-relaxed font-medium">
                                        {result.brief_conclusion}
                                    </p>
                                    </div>
                                    
                                    <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-4 shadow-sm ${
                                    result.health_score > 70 ? "border-emerald-100 bg-emerald-50 text-emerald-700" :
                                    result.health_score > 40 ? "border-orange-100 bg-orange-50 text-orange-700" :
                                    "border-red-100 bg-red-50 text-red-700"
                                    }`}>
                                    <span className="text-3xl font-black">{result.health_score}</span>
                                    <span className="text-[9px] font-bold uppercase tracking-wider">Score</span>
                                    </div>
                            </div>
                        </div>

                        {image && (
                            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-forest-200 relative group aspect-square lg:aspect-auto lg:h-80">
                                    <Image 
                                    src={image} 
                                    alt="Original Scan" 
                                    fill
                                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-500 ease-out"
                                    unoptimized
                                    />
                                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-forest-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-forest-100 flex items-center gap-2">
                                    <Search size={14} /> Original Scan
                                    </div>
                            </div>
                        )}

                        <button 
                            onClick={() => router.push('/scan')} 
                            className="w-full bg-forest-900 text-forest-50 font-bold py-5 rounded-3xl hover:bg-forest-800 shadow-lg shadow-forest-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <RefreshCw size={20}/> Scan Another Product
                        </button>
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            <div className={`p-5 rounded-3xl border flex flex-col justify-between h-full transition-all hover:scale-[1.02] duration-300 ${
                                result.halal_analysis.status === "Halal Safe" ? "bg-emerald-50 border-emerald-100 text-emerald-900" :
                                result.halal_analysis.status.includes("Syubhat") ? "bg-amber-50 border-amber-100 text-amber-900" : "bg-rose-50 border-rose-100 text-rose-900"
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck size={22} />
                                    <span className="font-bold text-sm uppercase tracking-wider">Halal Status</span>
                                </div>
                                <div>
                                    <p className="text-xl font-black leading-tight">
                                        {result.halal_analysis.status === "Halal Safe" ? "Safe / Halal" : 
                                        result.halal_analysis.status.includes("Syubhat") ? "Doubtful" : "Non-Halal"}
                                    </p>
                                    {result.halal_analysis.status !== "Halal Safe" && (
                                        <div className="mt-2 text-xs bg-white/60 p-2 rounded-lg font-medium leading-snug border border-black/5">
                                            ⚠️ {result.halal_analysis.reason}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={`p-5 rounded-3xl border flex flex-col justify-between h-full transition-all hover:scale-[1.02] duration-300 ${
                                result.allergen_list.length === 0 ? "bg-forest-50 border-forest-100 text-forest-900" : "bg-orange-50 border-orange-100 text-orange-900"
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Biohazard size={22} />
                                    <span className="font-bold text-sm uppercase tracking-wider">Allergens</span>
                                </div>
                                <div>
                                    {result.allergen_list.length === 0 ? (
                                        <p className="text-xl font-black">None Detected</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {result.allergen_list.map((allergen, i) => (
                                                <span key={i} className="text-xs font-bold px-2.5 py-1 bg-white/80 rounded-lg border border-black/5 shadow-sm">
                                                    {allergen}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 rounded-3xl border bg-white border-forest-200 text-forest-900 flex flex-col justify-between h-full transition-all hover:scale-[1.02] duration-300">
                                <div className="flex items-center gap-2 mb-2 text-forest-500">
                                    <div className="w-5 h-5 border-2 border-forest-500 rounded-md"></div>
                                    <span className="font-bold text-sm uppercase tracking-wider">Sugar</span>
                                </div>
                                <div>
                                    <span className="text-xl font-black text-forest-600">{result.nutrition_summary.sugar_g}g</span>
                                    <p className="text-xs text-forest-500 font-medium">≈ {result.nutrition_summary.sugar_teaspoons} Teaspoons</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-forest-200 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-forest-800 text-sm uppercase tracking-wide flex items-center gap-2">
                                    <div className="w-2 h-2 bg-forest-500 rounded-full"></div> Sugar Visualization
                                </h3>
                                <span className="text-[10px] text-forest-500 bg-forest-50 px-2 py-1 rounded-full border border-forest-100">1 Cube ≈ 4g</span>
                                </div>
                                
                                <div className="flex flex-wrap gap-3 mb-5">
                                {Math.ceil(result.nutrition_summary.sugar_g / 4) > 0 ? (
                                    Array.from({ length: Math.ceil(result.nutrition_summary.sugar_g / 4) }).map((_, i) => (
                                    <div key={i} className="w-10 h-10 bg-forest-50 border border-forest-200 rounded-xl flex items-center justify-center shadow-sm animate-in zoom-in duration-300" style={{ animationDelay: `${i*50}ms`}}>
                                        <div className="w-6 h-6 bg-white rounded-md border border-forest-100"></div>
                                    </div>
                                    ))
                                ) : (
                                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl w-full">
                                        <CheckCircle2 size={18}/>
                                        <span className="text-sm font-bold">Great! Low sugar product.</span>
                                    </div>
                                )}
                                </div>
                                
                                {Math.ceil(result.nutrition_summary.sugar_g / 4) > 0 && (
                                    <div className="p-4 bg-forest-50 rounded-2xl border border-forest-100 flex gap-3 items-start">
                                        <Info size={18} className="text-forest-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-forest-800 leading-relaxed font-medium">
                                        Consuming this product is equivalent to eating <strong>{Math.ceil(result.nutrition_summary.sugar_g / 4)} sugar cubes</strong> directly.
                                        </p>
                                    </div>
                                )}
                        </div>

                    </div>
                </div>

                {result.alerts.length > 0 && (
                    <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            <button 
                            onClick={() => setShowWarnings(!showWarnings)}
                            className="w-full flex justify-between items-center p-6 hover:bg-rose-50/50 transition-colors group"
                            >
                            <div className="flex items-center gap-2 text-rose-600">
                                <AlertTriangle size={20}/> 
                                <h3 className="font-bold text-sm uppercase tracking-wide">Safety Warnings ({result.alerts.length})</h3>
                            </div>
                            {showWarnings ? <ChevronUp size={20} className="text-rose-400" /> : <ChevronDown size={20} className="text-rose-400" />}
                            </button>
                            
                            {showWarnings && (
                                <div className="px-6 pb-6 pt-0 space-y-3 bg-white">
                                {result.alerts.map((alert, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-gray-900 text-sm">{alert.name}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide border ${
                                                alert.category === "Halal" ? "bg-purple-100 text-purple-700 border-purple-200" :
                                                alert.category === "Allergy" ? "bg-orange-100 text-orange-700 border-orange-200" :
                                                "bg-blue-100 text-blue-700 border-blue-200"
                                            }`}>
                                                {alert.category}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed">{alert.risk}</p>
                                    </div>
                                ))}
                                </div>
                            )}
                    </div>
                )}

                <div className="bg-white rounded-3xl border border-forest-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <button 
                        onClick={() => setShowOCR(!showOCR)}
                        className="w-full flex justify-between items-center p-6 hover:bg-forest-50 transition-colors group"
                    >
                        <div className="flex items-center gap-3 text-forest-700">
                            <div className="p-2 bg-forest-50 rounded-full group-hover:bg-white transition-colors border border-forest-100">
                                <Search size={18} />
                            </div>
                            <span className="font-bold text-sm">Verify Scanned Ingredients</span>
                        </div>
                        {showOCR ? <ChevronUp size={18} className="text-forest-400" /> : <ChevronDown size={18} className="text-forest-400" />}
                    </button>
                    
                    {showOCR && (
                        <div className="px-6 pb-6 pt-0 bg-forest-50/50 border-t border-forest-100">
                            <p className="text-[10px] text-forest-400 my-3 font-bold uppercase tracking-wide pl-1">
                                Raw Text Detected by AI:
                            </p>
                            <div className="p-4 bg-white rounded-2xl border border-forest-200 text-xs font-mono text-forest-600 whitespace-pre-wrap wrap-break-word leading-relaxed max-h-60 overflow-y-auto shadow-inner">
                                {result.detected_ingredients_text || "No legible text detected."}
                            </div>
                            <div className="mt-3 flex items-start gap-2 text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                                <AlertTriangle size={12} className="shrink-0 mt-0.5 text-amber-600"/>
                                <span>Disclaimer: AI accuracy depends on image clarity. Always double-check the physical label for critical allergies.</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-3xl border border-forest-200 shadow-lg overflow-hidden flex flex-col min-h-100 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    <div className="px-6 py-4 border-b border-forest-100 flex justify-between items-center bg-forest-50/50">
                        <div className="flex items-center gap-2">
                            <div className="bg-forest-600 text-white p-1.5 rounded-lg shadow-sm">
                                <Sprout size={14} fill="currentColor"/>
                            </div>
                            <div>
                                <h3 className="font-bold text-forest-900 text-sm">Ask NutriSift</h3>
                                <p className="text-[10px] text-forest-400">Context-aware AI Assistant</p>
                            </div>
                        </div>
                        <MessageCircle size={18} className="text-forest-300"/>
                    </div>
                    
                    <div className="flex-1 bg-white p-5 overflow-y-auto space-y-4 max-h-87.5">
                        {chatMessages.length === 0 && (
                            <div className="text-center mt-12">
                                <div className="w-12 h-12 bg-forest-50 text-forest-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-forest-100">
                                    <MessageCircle size={24}/>
                                </div>
                                <p className="text-forest-500 text-xs mb-4 font-medium">Have questions about this product?</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <button onClick={() => setChatInput("Is this safe for toddlers?")} className="text-[11px] bg-white border border-forest-200 text-forest-600 px-3 py-1.5 rounded-full hover:bg-forest-50 hover:border-forest-300 transition-all shadow-sm">👶 Safe for kids?</button>
                                    <button onClick={() => setChatInput("Is it keto friendly?")} className="text-[11px] bg-white border border-forest-200 text-forest-600 px-3 py-1.5 rounded-full hover:bg-forest-50 hover:border-forest-300 transition-all shadow-sm">🥗 Keto?</button>
                                    <button onClick={() => setChatInput("Why is the score low?")} className="text-[11px] bg-white border border-forest-200 text-forest-600 px-3 py-1.5 rounded-full hover:bg-forest-50 hover:border-forest-300 transition-all shadow-sm">📊 Explain score?</button>
                                </div>
                            </div>
                        )}
                        {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2`}>
                                <div className={`max-w-[85%] text-sm px-4 py-3 rounded-2xl shadow-sm leading-relaxed ${
                                    msg.role === "user" 
                                        ? "bg-forest-600 text-white rounded-br-sm" 
                                        : "bg-forest-50 text-forest-800 rounded-bl-sm border border-forest-100"
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-forest-50 border border-forest-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                                    <div className="w-1.5 h-1.5 bg-forest-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-forest-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1.5 h-1.5 bg-forest-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef}></div>
                    </div>

                    <div className="p-4 bg-forest-50 border-t border-forest-100 flex gap-2">
                        <input 
                            className="flex-1 bg-white border border-forest-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-200 focus:border-forest-400 placeholder:text-forest-300 transition-all shadow-sm text-forest-800"
                            placeholder="Type your question here..."
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSendChat()}
                        />
                        <button 
                            onClick={handleSendChat} 
                            disabled={chatLoading || !chatInput.trim()} 
                            className="bg-forest-600 text-white p-3 rounded-xl hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md active:scale-95"
                        >
                            <Send size={20}/>
                        </button>
                    </div>
                </div>
            </>
            )}
        </div>
        </main>
    );
}