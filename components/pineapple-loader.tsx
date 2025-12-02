'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function PineappleLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Force a minimum loading time of 2 seconds to show the animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, backdropFilter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-[#131426] flex flex-col items-center justify-center"
        >
          <div className="relative w-40 h-40 md:w-52 md:h-52">
            {/* 1. Base Layer: Grayscale/Dimmed Logo */}
            <div className="absolute inset-0 opacity-20 grayscale contrast-150">
               <Image 
                  src="/potdlogo.png" 
                  alt="Loading Base" 
                  fill 
                  className="object-contain"
                  priority
               />
            </div>

            {/* 2. Filling Layer: Full Color, clipped from bottom */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  initial={{ height: "0%" }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="absolute bottom-0 left-0 w-full overflow-hidden"
                  style={{ display: 'flex', alignItems: 'flex-end' }} // Align content to bottom
                >
                   {/* Inner container to hold the image at full size, anchored bottom */}
                   <div className="relative w-full h-40 md:h-52"> 
                       <Image 
                          src="/potdlogo.png" 
                          alt="Loading Fill" 
                          fill 
                          className="object-contain object-bottom" 
                          priority
                       />
                   </div>
                </motion.div>
            </div>

            {/* 3. Scanline Effect Overlay - Masked to Logo Shape */}
            <div 
                className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[size:100%_4px] pointer-events-none opacity-30 z-20"
                style={{
                    maskImage: "url('/potdlogo.png')",
                    WebkitMaskImage: "url('/potdlogo.png')",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center"
                }}
            ></div>
          </div>

          {/* Loading Text */}
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5 }}
             className="mt-8 text-[#FED405] font-mono font-bold tracking-[0.5em] text-xs animate-pulse"
          >
             INITIALIZING SYSTEM...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}