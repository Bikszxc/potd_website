'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function JoinSection() {
  const [copied, setCopied] = useState(false);
  const IP = "66.118.234.45";
  const PORT = "16261";

  const handleCopy = () => {
    navigator.clipboard.writeText(IP);
    setCopied(true);
    toast.success("Server IP copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="join" className="py-24 bg-[#191A30] relative overflow-hidden border-t border-white/5">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#131426] via-transparent to-[#191A30] pointer-events-none"></div>
      
      {/* Yellow Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FED405] rounded-full opacity-5 blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          
          {/* Logo Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative group"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
               {/* Rotating Ring */}
               <div className="absolute inset-0 border-2 border-dashed border-[#FED405]/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
               <div className="absolute inset-4 border border-[#FED405]/10 rounded-full"></div>
               
               {/* Logo */}
               <div className="absolute inset-0 flex items-center justify-center drop-shadow-[0_0_30px_rgba(254,212,5,0.3)]">
                 <Image 
                   src="/potdlogo.png" 
                   alt="Pinya of The Dead Logo" 
                   width={300} 
                   height={300}
                   className="object-contain group-hover:scale-110 transition-transform duration-500"
                 />
               </div>
            </div>
          </motion.div>

          {/* Content Column */}
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-green-400 font-mono text-sm font-bold tracking-widest">SYSTEM ONLINE</span>
              </div>

              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6 leading-none">
                Join The <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FED405] to-yellow-600">Resistance</span>
              </h2>

              <p className="text-gray-400 text-lg mb-10 max-w-xl leading-relaxed">
                The signal is strong. The safezone is waiting. 
                Connect now to establish your foothold in the exclusion zone.
              </p>

              {/* Server Details Card */}
              <div className="bg-[#131426] border border-white/10 p-2 rounded-sm max-w-md mx-auto md:mx-0 relative group hover:border-[#FED405]/50 transition-colors">
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FED405] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#FED405] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="grid grid-cols-[1fr_auto] gap-2">
                   {/* IP Box */}
                   <div className="bg-[#191A30] p-4 flex flex-col justify-center border border-white/5">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Server IP</span>
                      <code className="text-white font-mono text-xl tracking-wide">{IP}</code>
                   </div>

                   {/* Port Box */}
                   <div className="bg-[#191A30] p-4 flex flex-col justify-center border border-white/5 min-w-[100px]">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Port</span>
                      <code className="text-[#FED405] font-mono text-xl tracking-wide">{PORT}</code>
                   </div>
                </div>

                {/* Copy Button */}
                <button 
                  onClick={handleCopy}
                  className="w-full mt-2 bg-[#FED405] hover:bg-white text-[#191A30] font-bold uppercase py-4 tracking-widest transition-all flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                >
                  <div className="relative z-10 flex items-center gap-2">
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                    <span>{copied ? 'Address Copied' : 'Copy Connection Data'}</span>
                  </div>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 z-0"></div>
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
