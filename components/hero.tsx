'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Post, Event } from '@/types';
import { Radio, FileText, Calendar, ArrowRight } from 'lucide-react';
import { ServerStatus } from '@/utils/server-query';

const DEFAULT_IMAGES = {
  announcement: 'https://www.transparenttextures.com/patterns/dark-matter.png',
  patch_notes: 'https://www.transparenttextures.com/patterns/carbon-fibre.png',
  event: 'https://www.transparenttextures.com/patterns/cubes.png',
};

export default function Hero({ 
  latestAnnouncement, 
  latestPatchNote, 
  latestEvent,
  serverStatus
}: { 
  latestAnnouncement?: Post | null, 
  latestPatchNote?: Post | null, 
  latestEvent?: Event | null,
  serverStatus?: ServerStatus | null
}) {
  const ref = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const billboardY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const [mounted, setMounted] = useState(false);

  // Mouse movement effect & Mount check
  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={ref} className="relative min-h-screen w-full overflow-hidden flex items-center pt-20 pb-10">
      {/* Animated Background */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        {/* Dark textured base */}
        <div className="absolute inset-0 bg-[#191A30] bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-80"></div>
        
        {/* Moving Gradient Fog */}
        <motion.div 
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2a2d45] via-[#191A30] to-black opacity-60 bg-[length:200%_200%]"
        ></motion.div>

        {/* Digital Rain / Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        {/* Spotlight Effect following mouse */}
        {mounted && (
          <div 
            className="absolute inset-0 bg-[radial-gradient(600px_circle_at_var(--x)_var(--y),rgba(254,212,5,0.06),transparent_40%)]"
            style={{ '--x': `${mousePosition.x * 100}%`, '--y': `${mousePosition.y * 100}%` } as any}
          ></div>
        )}
      </motion.div>

      {/* Floating Particles */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: '100vh', x: Math.random() * 100 + 'vw' }}
              animate={{ opacity: [0, 0.5, 0], y: '-10vh' }}
              transition={{ 
                duration: Math.random() * 10 + 10, 
                repeat: Infinity, 
                delay: Math.random() * 5,
                ease: "linear"
              }}
              className="absolute w-1 h-1 bg-[#FED405] rounded-full blur-[1px]"
            />
          ))}
        </div>
      )}

      {/* Bottom Fade Gradient for blending */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#191A30] via-[#191A30]/80 to-transparent z-20 pointer-events-none"></div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Main Hero Text */}
        <motion.div 
          style={{ opacity, y: billboardY }}
          className="text-left relative"
        >
          {/* Decorative HUD elements */}
          <div className="absolute -left-8 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-[#FED405]/30 to-transparent hidden md:block"></div>
          <div className="absolute -left-8 top-10 w-2 h-2 bg-[#FED405] hidden md:block"></div>
          
          <h4 className="text-[#FED405] font-mono text-xs font-bold tracking-[0.3em] mb-4 uppercase flex items-center gap-2">
            <span className="w-8 h-[1px] bg-[#FED405]"></span>
            Welcome to the Exclusion Zone
          </h4>

          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 drop-shadow-2xl leading-[0.9] relative">
            <span className="relative inline-block">
              NOT
              <span className="absolute -inset-1 bg-[#FED405] opacity-20 blur-lg"></span>
            </span> JUST ANOTHER <span className="text-[#FED405] glitch-text" data-text="APOCALYPSE">APOCALYPSE</span><br />
          </h1>
          
          <p className="text-lg text-gray-400 max-w-xl mb-8 leading-relaxed border-l-2 border-white/10 pl-6">
              Step into <span className="text-[#FEA405] glitch-text" data-text="DEAD">Pinya Of The Dead</span>, where your character’s story matters.
              Featuring a massive curated modpack and dedicated roleplay features,
              we offer the perfect blend of cooperative survival and competitive PVP zones.
          </p>
            <p className="text-lg text-gray-400 max-w-xl mb-8">
            How will you be remembered when the end comes?
            </p>
          
          <div className="flex flex-col sm:flex-row items-start gap-4">
             <Link 
               href="#join"
               className="px-8 py-4 bg-[#FED405] text-[#191A30] text-sm font-bold uppercase tracking-widest hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(254,212,5,0.3)] clip-path-slant text-center flex items-center justify-center"
             >
               Begin Survival
             </Link>
             <a 
               href="https://steamcommunity.com/sharedfiles/filedetails/?id=3578732340" 
               target="_blank" 
               rel="noopener noreferrer"
               className="px-8 py-4 bg-[#191A30]/50 backdrop-blur-sm text-white text-sm font-bold uppercase tracking-widest border border-white/20 hover:border-[#FED405] hover:text-[#FED405] transition-all flex items-center gap-2 group clip-path-slant"
             >
               View Mod List <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
             </a>
          </div>
        </motion.div>

        {/* Right Side: 3D Billboard (Retained & Enhanced) */}
        <motion.div 
          style={{ opacity, y: billboardY }}
          initial={{ opacity: 0, x: 50, rotateY: -20 }}
          animate={{ opacity: 1, x: 0, rotateY: -12 }}
          whileHover={{ rotateY: 0, rotateX: 0, scale: 1.02 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="self-center perspective-[1500px] group hidden lg:block"
        >
           {/* Billboard Frame */}
           <div className="relative transform transition-transform duration-500 bg-[#1a1c23] p-3 border-4 border-[#2a2c35] shadow-2xl rounded-sm">
              {/* Blinking Light */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-black border border-white/20 rounded-full flex justify-center items-center">
                 <div className="w-8 h-0.5 bg-[#FED405] animate-pulse shadow-[0_0_5px_#FED405]"></div>
              </div>

              {/* Bolts */}
              <div className="absolute -top-2 -left-2 w-3 h-3 bg-[#4a4d5a] rounded-full shadow-inner border border-black"></div>
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-[#4a4d5a] rounded-full shadow-inner border border-black"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-[#4a4d5a] rounded-full shadow-inner border border-black"></div>
              <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-[#4a4d5a] rounded-full shadow-inner border border-black"></div>

              {/* Screen Container */}
              <div className="bg-black relative overflow-hidden border border-white/10 h-[350px] flex flex-col">
                  {/* CRT Screen Effects */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-30 pointer-events-none z-30 animate-pulse"></div>

                  <div className="flex-1 grid grid-cols-1 divide-y divide-white/10 bg-[#191A30]">
                     {/* Latest Announcement */}
                     {latestAnnouncement ? (
                       <Link href={`/news/${latestAnnouncement.id}`} className="relative flex-1 overflow-hidden group/item border-l-4 border-transparent hover:border-[#FED405] transition-all">
                          <div className="absolute inset-0 bg-cover bg-center opacity-20 group-hover/item:opacity-50 transition-opacity grayscale group-hover/item:grayscale-0" style={{ backgroundImage: `url(${latestAnnouncement.image_url || DEFAULT_IMAGES.announcement})` }}></div>
                          <div className="relative z-10 p-4 h-full flex flex-col justify-center">
                             <div className="flex items-center gap-2 text-[#FED405] mb-1 text-[10px] font-bold uppercase tracking-widest">
                                <Radio size={12} /> LATEST BROADCAST
                             </div>
                             <h4 className="text-sm font-bold text-white line-clamp-2 group-hover/item:text-[#FED405] transition-colors uppercase font-mono">
                               {latestAnnouncement.title}
                             </h4>
                          </div>
                       </Link>
                     ) : (
                       <div className="relative flex-1 overflow-hidden border-l-4 border-[#FED405]/20 bg-[#1a1805]">
                          <div className="relative z-10 p-4 h-full flex flex-col justify-center opacity-50">
                             <div className="flex items-center gap-2 text-[#FED405]/50 mb-1 text-[10px] font-bold uppercase tracking-widest">
                                <Radio size={12} /> LATEST BROADCAST
                             </div>
                             <h4 className="text-sm font-bold text-[#FED405]/40 uppercase font-mono">
                               NO SIGNAL DETECTED
                             </h4>
                          </div>
                       </div>
                     )}

                     {/* Latest Event */}
                     {latestEvent ? (
                       <Link href={`/news/event/${latestEvent.id}`} className="relative flex-1 overflow-hidden group/item border-l-4 border-transparent hover:border-red-500 transition-all">
                          <div className="absolute inset-0 bg-cover bg-center opacity-20 group-hover/item:opacity-50 transition-opacity grayscale group-hover/item:grayscale-0" style={{ backgroundImage: `url(${latestEvent.image_url || DEFAULT_IMAGES.event})` }}></div>
                          <div className="relative z-10 p-4 h-full flex flex-col justify-center">
                             <div className="flex items-center gap-2 text-red-500 mb-1 text-[10px] font-bold uppercase tracking-widest">
                                <Calendar size={12} /> NEXT OPERATION
                             </div>
                             <h4 className="text-sm font-bold text-white line-clamp-2 group-hover/item:text-red-500 transition-colors uppercase font-mono">
                               {latestEvent.title}
                             </h4>
                          </div>
                       </Link>
                     ) : (
                       <div className="relative flex-1 overflow-hidden border-l-4 border-red-900/20 bg-[#1a1212]">
                          <div className="relative z-10 p-4 h-full flex flex-col justify-center opacity-50">
                             <div className="flex items-center gap-2 text-red-900/50 mb-1 text-[10px] font-bold uppercase tracking-widest">
                                <Calendar size={12} /> NEXT OPERATION
                             </div>
                             <h4 className="text-sm font-bold text-red-900/40 uppercase font-mono">
                               NO ACTIVE OPERATIONS
                             </h4>
                          </div>
                       </div>
                     )}
                  </div>
                  
                  {/* Footer Status */}
                  <div className="bg-[#0a0a0a] p-3 border-t border-white/10">
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-[10px] text-gray-500 font-bold tracking-widest">SERVER STATUS</span>
                       <span className={`text-[10px] font-bold tracking-widest animate-pulse ${serverStatus?.online ? 'text-green-500' : 'text-red-500'}`}>
                         {serverStatus?.online ? 'ONLINE' : 'OFFLINE'}
                       </span>
                     </div>
                     <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-green-500 transition-all duration-1000" 
                         style={{ width: serverStatus?.online ? `${(serverStatus.players / serverStatus.maxPlayers) * 100}%` : '0%' }}
                       ></div>
                     </div>
                     <div className="flex justify-between mt-1 text-[9px] text-gray-600 font-mono">
                        <span>POPULATION: {serverStatus?.players || 0}/{serverStatus?.maxPlayers || 64}</span>
                        <span>PING: 42ms</span>
                     </div>
                  </div>
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
}