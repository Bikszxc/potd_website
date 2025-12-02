import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#191A30] flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-50 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent z-0 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">
        
        {/* 404 Image */}
        <div className="relative mb-8 animate-pulse-slow">
            <Image 
                src="/404.png" 
                alt="404 Page Not Found" 
                width={500} 
                height={500}
                className="w-full h-auto object-contain drop-shadow-2xl"
                priority
            />
        </div>

        {/* Error Message */}
        <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-[#FED405] font-bold uppercase tracking-widest text-sm mb-2">
                <AlertTriangle size={16} />
                <span>Signal Lost</span>
                <AlertTriangle size={16} />
            </div>
            
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
                Sector Not Found
            </h2>
            
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                The requested coordinates do not exist or have been overrun by the infected. Return to base immediately.
            </p>
        </div>

        {/* Action Button */}
        <Link 
            href="/" 
            className="mt-8 flex items-center gap-2 px-8 py-3 bg-[#FED405] text-[#191A30] font-bold uppercase tracking-widest hover:bg-white transition-all rounded-sm shadow-[0_0_20px_rgba(254,212,5,0.2)] hover:shadow-[0_0_30px_rgba(254,212,5,0.4)]"
        >
            <ArrowLeft size={18} /> Return Home
        </Link>

      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FED405]/20 to-transparent"></div>
    </div>
  );
}
