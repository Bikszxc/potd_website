'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function ScrollIndicator() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hide on admin pages immediately
    if (pathname?.startsWith('/admin')) {
      setIsVisible(false);
      return;
    }

    const checkVisibility = () => {
      // 1. Check if page is scrollable
      const isScrollable = document.documentElement.scrollHeight > window.innerHeight;
      
      // 2. Check if user is near the top (threshold 100px)
      const isAtTop = window.scrollY < 100;

      // 3. Check if a modal is open (body locked)
      const isModalOpen = document.body.style.overflow === 'hidden';

      setIsVisible(isScrollable && isAtTop && !isModalOpen);
    };

    // Run initial check after a small delay to allow content layout
    const timeout = setTimeout(checkVisibility, 100);

    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);
    
    // Listen for mutations on body style to detect modal open/close immediately
    const observer = new MutationObserver(checkVisibility);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
      observer.disconnect();
    };
  }, [pathname]);

  const handleScroll = () => {
    // Attempt to find the next semantic section or just scroll down a viewport
    // For the Home page, Hero is 100vh, so scrolling window.innerHeight works perfect.
    // For other pages, scrolling ~80vh usually brings the content into view nicely.
    const scrollAmount = window.innerHeight * 0.9;
    
    window.scrollBy({
      top: scrollAmount,
      behavior: 'smooth'
    });
  };

  if (pathname?.startsWith('/admin')) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 cursor-pointer group"
          onClick={handleScroll}
        >
          <div className="flex flex-col items-center gap-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ 
                repeat: Infinity, 
                duration: 2, 
                ease: "easeInOut" 
              }}
              className="p-2 rounded-full border border-white/10 bg-[#191A30]/50 backdrop-blur-sm group-hover:border-[#FED405]/50 group-hover:bg-[#FED405]/10 transition-colors"
            >
              <ChevronDown className="text-[#FED405]" size={24} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
