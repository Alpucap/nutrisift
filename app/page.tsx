import Link from "next/link";
import Image from "next/image"; // Import Image component
import { 
  Camera, Zap, ScanBarcode, 
  ArrowRight, Activity, CheckCircle2, Search,
  ShieldCheck, AlertTriangle, Sprout 
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-forest-50 text-forest-900 font-sans selection:bg-forest-200 selection:text-forest-900 overflow-x-hidden w-full">
      
      <div className="fixed top-0 right-0 w-200 h-200 bg-forest-200 rounded-full blur-[120px] -mr-40 -mt-40 -z-10 opacity-60 mix-blend-multiply animate-pulse"></div>
      <div className="fixed bottom-0 left-0 w-150 h-150 bg-forest-300 rounded-full blur-[120px] -ml-20 -mb-20 -z-10 opacity-40 mix-blend-multiply"></div>

      <nav className="fixed top-0 left-0 right-0 z-50 w-full px-6 md:px-12 lg:px-20 h-24 flex items-center justify-between backdrop-blur-md bg-forest-50/80 border-b border-forest-100/50">
        <div className="flex items-center gap-3">
          <Image 
            src="/nutrisift.svg" 
            alt="NutriSift Logo" 
            width={36} 
            height={36} 
            className="w-6 h-6 object-contain"
          />
          <span className="font-bold text-2xl tracking-tight text-forest-900">NutriSift</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <span className="text-sm font-semibold text-forest-600 flex items-center gap-2">
              <Sprout size={16} fill="currentColor"/> 
              Powered by Gemini 2.5
          </span>
          <Link href="/scan" className="bg-forest-900 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-forest-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            Scan Now
          </Link>
        </div>
      </nav>

      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-32 lg:pt-48 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          <div className="space-y-10 py-4 lg:sticky lg:top-40">
            
            <div className="inline-flex items-center gap-3 bg-white text-forest-700 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border border-forest-200 shadow-sm">
              <ShieldCheck size={16} />
              <span>AI Food Safety Assistant</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-black leading-[1.05] tracking-tight text-forest-900">
              Eat Clean.<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-forest-600 to-forest-400">
                Live Green.
              </span>
            </h1>
            
            <p className="text-xl text-forest-700/80 leading-relaxed font-medium max-w-xl">
              Decode nutrition labels instantly. We use advanced AI to detect hidden allergens, verify Halal status, and visualize sugar impact naturally.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <Link href="/scan" className="group bg-forest-600 text-white font-bold py-5 px-10 rounded-2xl shadow-xl shadow-forest-200 hover:bg-forest-700 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-4 text-xl">
                  <Camera size={26} />
                  Start Scanning
                  <ArrowRight size={22} className="opacity-70 group-hover:translate-x-2 transition-transform duration-300"/>
              </Link>
              
              <a href="#how-it-works" className="group px-8 py-5 rounded-2xl font-bold text-forest-700 hover:bg-white hover:shadow-lg border border-transparent hover:border-forest-100 transition-all duration-300 flex items-center justify-center gap-2">
                  How it works
              </a>
            </div>

            <div className="pt-10 border-t border-forest-200/60 flex flex-wrap gap-x-8 gap-y-4 text-sm font-bold text-forest-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-forest-600"/> No Sign-up Required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-forest-600"/> Instant AI Results
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-forest-600"/> 100% Free
                </div>
            </div>
          </div>

          <div className="relative w-full aspect-square lg:aspect-auto lg:h-200 flex items-start justify-center pt-10 lg:pt-0">
              
              <div className="relative z-10 bg-white/40 backdrop-blur-2xl border border-white/60 p-8 md:p-12 rounded-4xl shadow-[0_30px_80px_-20px_rgba(47,79,47,0.15)] flex items-center justify-center w-full max-w-lg aspect-4/5">
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                    
                    <div className="bg-white p-10 rounded-4xl shadow-2xl shadow-forest-100 mb-12 transform hover:scale-105 transition-transform duration-700">
                        <ScanBarcode size={140} className="text-forest-600" strokeWidth={1.2}/>
                    </div>
                    
                    <div className="absolute top-12 right-0 lg:-right-8 bg-white p-5 rounded-3xl shadow-xl shadow-forest-200/50 border border-forest-50 animate-bounce duration-3000">
                      <div className="flex items-center gap-4 mb-3">
                          <div className="p-3 bg-forest-100 text-forest-700 rounded-2xl">
                            <ShieldCheck size={24}/>
                          </div>
                          <div>
                            <p className="text-[10px] text-forest-400 font-bold uppercase tracking-wider">Analysis</p>
                            <p className="text-base font-bold text-forest-900">Halal Safe</p>
                          </div>
                      </div>
                      <div className="w-32 h-2 bg-forest-50 rounded-full overflow-hidden">
                          <div className="w-full h-full bg-forest-500 rounded-full"></div>
                      </div>
                    </div>

                    <div className="absolute bottom-24 left-0 lg:-left-8 bg-white p-5 rounded-3xl shadow-xl shadow-forest-200/50 border border-forest-50 animate-bounce duration-4000 delay-500">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                            <Activity size={24}/>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sugar Level</p>
                            <p className="text-base font-bold text-gray-900">High (24g)</p>
                          </div>
                      </div>
                    </div>

                    <div className="absolute top-1/2 -right-4 lg:-right-16 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-forest-100 flex items-center gap-3 animate-pulse">
                      <Search size={18} className="text-forest-500"/>
                      <span className="text-xs font-bold text-forest-700">Scanning Ingredients...</span>
                    </div>

                </div>
              </div>
          </div>
        </div>
      </div>

      <section id="how-it-works" className="w-full bg-white py-24 relative z-10 rounded-t-4xl shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.05)]">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
            
            <div className="text-center mb-20 max-w-2xl mx-auto">
                <span className="text-forest-600 font-bold text-sm uppercase tracking-widest bg-forest-50 px-4 py-2 rounded-full">Simple Process</span>
                <h2 className="text-4xl md:text-5xl font-black text-forest-900 mt-6 mb-6">How NutriSift Works</h2>
                <p className="text-forest-700/70 text-lg">Three simple steps to understand what&apos;s really inside your packaged food.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="bg-forest-50 p-8 rounded-4xl flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-500 border border-transparent hover:border-forest-200">
                  <div className="w-24 h-24 bg-white text-forest-600 rounded-3xl flex items-center justify-center mb-8 shadow-sm group-hover:shadow-md transition-shadow duration-500">
                      <Camera size={48} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-forest-900 mb-4">1. Snap a Photo</h3>
                  <p className="text-forest-700/80 leading-relaxed">Take a clear picture of the ingredients list or nutrition facts label on the packaging.</p>
                </div>

                <div className="bg-forest-50 p-8 rounded-4xl flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-500 border border-transparent hover:border-forest-200 relative">
                  <div className="hidden md:block absolute top-1/2 -left-6 lg:-left-9 transform -translate-y-1/2 text-forest-200 z-10">
                      <ArrowRight size={40} />
                  </div>
                  <div className="w-24 h-24 bg-white text-forest-600 rounded-3xl flex items-center justify-center mb-8 shadow-sm group-hover:shadow-md transition-shadow duration-500">
                      <Zap size={48} strokeWidth={1.5} fill="currentColor"/>
                  </div>
                  <h3 className="text-2xl font-bold text-forest-900 mb-4">2. AI Analysis</h3>
                  <p className="text-forest-700/80 leading-relaxed">Gemini AI reads the text, cross-references additives, and calculates safety scores instantly.</p>
                </div>

                <div className="bg-forest-50 p-8 rounded-4xl flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-500 border border-transparent hover:border-forest-200 relative">
                  <div className="hidden md:block absolute top-1/2 -left-6 lg:-left-9 transform -translate-y-1/2 text-forest-200 z-10">
                      <ArrowRight size={40} />
                  </div>
                  <div className="w-24 h-24 bg-white text-forest-600 rounded-3xl flex items-center justify-center mb-8 shadow-sm group-hover:shadow-md transition-shadow duration-500">
                      <ShieldCheck size={48} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-forest-900 mb-4">3. Get Insights</h3>
                  <p className="text-forest-700/80 leading-relaxed">See Halal status, allergen alerts, and visualize sugar content in a clear dashboard.</p>
                </div>
            </div>

            <div className="mt-20 bg-yellow-50 border border-yellow-100 rounded-4xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6 max-w-4xl mx-auto shadow-sm">
                <div className="p-4 bg-yellow-100 text-yellow-700 rounded-full shrink-0">
                    <AlertTriangle size={32} />
                </div>
                <div>
                    <h4 className="font-bold text-yellow-900 text-xl mb-2">Important Disclaimer</h4>
                    <p className="text-yellow-800/80 leading-relaxed">
                        NutriSift AI is an assistive tool powered by artificial intelligence. While highly accurate, <strong>AI models can occasionally misinterpret text</strong> due to blur or lighting. 
                        Always verify critical information (especially for severe allergies) with the physical product label.
                    </p>
                </div>
            </div>

          </div>
      </section>

    </main>
  );
}