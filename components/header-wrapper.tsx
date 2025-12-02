'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ServerStatus } from '@/utils/server-query';

export default function HeaderWrapper({ status, isSaleActive }: { status: ServerStatus, isSaleActive: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when path changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#191A30]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex-shrink-0 flex items-center gap-3 z-10 relative">
          <Image 
            src="/potd-header2.png" 
            alt="POTD Logo" 
            width={200} 
            height={64} 
            className="h-12 w-auto object-contain"
          />
        </div>
        
        {/* Desktop Nav - Centered */}
        <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="/" className="hover:text-[#FED405] transition-colors">HOME</Link>
          <Link href="/news" className="hover:text-[#FED405] transition-colors">NEWS</Link>
          <Link href="/leaderboards" className="hover:text-[#FED405] transition-colors">RANKINGS</Link>
          <Link href="/search" className="hover:text-[#FED405] transition-colors">SEARCH</Link>
          <Link href="/donate" className="hover:text-[#FED405] transition-colors flex items-center gap-2">
            DONATE
            {isSaleActive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </Link>
        </nav>

        <div className="flex items-center gap-4 z-10">
          <div className={`hidden sm:flex items-center gap-2 text-xs ${status.online ? 'text-green-400' : 'text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${status.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span>{status.online ? `ONLINE: ${status.players}/${status.maxPlayers}` : 'OFFLINE'}</span>
          </div>
          
          {/* Desktop Button */}
          <a 
            href="#" 
            className="hidden md:block bg-[#FED405] text-[#191A30] px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-[#e5c004] transition-colors clip-path-slant"
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 80%, 90% 100%, 0 100%, 0 20%)' }}
          >
            Join Discord
          </a>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-[#FED405] transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#191A30] border-b border-white/10 shadow-2xl animate-in slide-in-from-top-5 duration-200">
           <nav className="flex flex-col p-4 space-y-4">
              <Link href="/" className="text-white hover:text-[#FED405] font-bold uppercase tracking-widest py-2 border-b border-white/5">Home</Link>
              <Link href="/news" className="text-white hover:text-[#FED405] font-bold uppercase tracking-widest py-2 border-b border-white/5">News</Link>
              <Link href="/leaderboards" className="text-white hover:text-[#FED405] font-bold uppercase tracking-widest py-2 border-b border-white/5">Rankings</Link>
              <Link href="/search" className="text-white hover:text-[#FED405] font-bold uppercase tracking-widest py-2 border-b border-white/5">Search</Link>
              <Link href="/donate" className="text-white hover:text-[#FED405] font-bold uppercase tracking-widest py-2 border-b border-white/5 flex items-center gap-2">
                  Donate
                  {isSaleActive && (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold animate-pulse">SALE</span>
                  )}
              </Link>
              
              <div className="pt-2">
                 <a 
                    href="#" 
                    className="block w-full bg-[#FED405] text-[#191A30] px-4 py-3 text-center text-sm font-bold uppercase tracking-wide hover:bg-[#e5c004] transition-colors"
                  >
                    Join Discord
                  </a>
              </div>
           </nav>
        </div>
      )}
    </header>
  );
}
