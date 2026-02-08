"use client";

import { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";
import { useRouter } from "next/navigation";
import { 
    ImageIcon, ChevronLeft, ZapOff
} from "lucide-react";
import Link from "next/link";

export default function ScanPage() {
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const videoConstraints = { 
        facingMode: "environment",
        width: { ideal: 1920 },
        height: { ideal: 1080 }
    };

    const processImage = useCallback((imgSrc: string) => {
        try {
        localStorage.setItem("scanImage", imgSrc);
        router.push("/result");
        } catch (e) {
        console.error(e);
        }
    }, [router]);

    const capture = useCallback(() => {
        if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) processImage(imageSrc);
        }
    }, [webcamRef, processImage]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) processImage(reader.result as string);
        };
        reader.readAsDataURL(file);
        }
    };

    const handleUserMedia = () => setHasPermission(true);
    const handleUserMediaError = () => setHasPermission(false);

    return (
        <div className="fixed inset-0 bg-black flex flex-col font-sans">
        
        {/* === WEBCAM FULL SCREEN === */}
        <div className="absolute inset-0 bg-black">
            {hasPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white z-20 bg-forest-950">
                    <ZapOff size={48} className="mb-4 text-forest-400"/>
                    <h3 className="text-xl font-bold mb-2">Camera Access Denied</h3>
                    <p className="text-sm text-forest-200 mb-8 text-center">Please enable camera access or upload a file manually.</p>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-forest-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-forest-500 transition-all"
                    >
                        Upload File
                    </button>
                </div>
            )}

            <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Overlay Gradient untuk Text readability */}
            <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/60 pointer-events-none"></div>
        </div>

        {/* === HEADER === */}
        <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center">
            <Link href="/" className="text-white p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all">
            <ChevronLeft size={24} />
            </Link>
            <span className="text-white font-bold text-sm tracking-widest uppercase drop-shadow-md bg-black/20 px-4 py-1 rounded-full backdrop-blur-sm">
                Scan Ingredients
            </span>
            <div className="w-12"></div> {/* Spacer agar judul di tengah */}
        </div>

        {/* === FOOTER CONTROLS === */}
        <div className="absolute bottom-0 left-0 right-0 p-10 pb-12 flex items-center justify-between z-20">
            
            {/* Gallery Button */}
            <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all active:scale-95"
            aria-label="Upload Image"
            >
            <ImageIcon size={28} />
            </button>
            
            {/* SHUTTER BUTTON (Center) */}
            <button 
            onClick={capture}
            className="relative group transform transition-all active:scale-95"
            aria-label="Capture Photo"
            >
            <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-sm">
                <div className="w-16 h-16 bg-white rounded-full shadow-lg group-hover:bg-forest-50 transition-colors"></div>
            </div>
            </button>
            
            {/* Placeholder Kanan (Bisa buat Flash nanti) */}
            <div className="w-14 h-14 flex items-center justify-center opacity-0 pointer-events-none">
                {/* Kosong agar layout seimbang */}
            </div>
        </div>

        {/* Hidden Input */}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
    );
}