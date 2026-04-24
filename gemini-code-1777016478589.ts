import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// ... your other imports (Figtree font, Canvas, Case Studies, etc.)

export default function App() {
  // 1. Legend State
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // 2. OS Detection (For the Cmd/Ctrl key)
  const isMac = typeof window !== 'undefined' 
    ? navigator.userAgent.toUpperCase().indexOf('MAC') >= 0 
    : false;
  const modifierKey = isMac ? '⌘' : 'Ctrl';

  // 3. Global Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on '?' (Shift + /)
      if (e.key === '?') {
        setIsLegendOpen((prev) => !prev);
      }
      // Close on 'Escape'
      if (e.key === 'Escape') {
        setIsLegendOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 4. Passive Close (Clicking the canvas)
  const handleCanvasClick = () => {
    if (isLegendOpen) setIsLegendOpen(false);
  };

  return (
    // Your main wrapper. Add onClick here to close the legend when clicking the void.
    <div 
      className="relative w-screen h-screen overflow-hidden bg-pearl-base"
      onClick={handleCanvasClick}
    >
      
      {/* ... Your Existing Canvas & Case Studies Go Here ... */}


      {/* --- START LEGEND UI --- */}
      {/* The Wrapper is pinned to the bottom right, hidden on mobile */}
      <div className="fixed bottom-6 right-6 z-50 hidden md:flex flex-col items-end gap-3">
        
        {/* The Animated Legend Card */}
        <AnimatePresence>
          {isLegendOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-2xl p-5 w-72 origin-bottom-right"
              onClick={(e) => e.stopPropagation()} // Prevents canvas click from closing it when clicking inside the card
            >
              <h3 className="text-sm font-semibold text-gray-900 mb-4 font-figtree">
                Canvas Controls
              </h3>
              
              <div className="space-y-4 text-xs text-gray-600 font-figtree">
                {/* Navigation Group */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="flex gap-1">
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-md shadow-sm">Click</kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-md shadow-sm">Drag</kbd>
                    </span>
                    <span>Pan Canvas</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="flex gap-1">
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-md shadow-sm">←</kbd>
                      <span>/</span>
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-md shadow-sm">→</kbd>
                    </span>
                    <span>Switch Section</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-md shadow-sm [font-feature-settings:'tnum']">1 - 5</kbd>
                    <span>Jump to Section</span>
                  </div>
                </div>

                <div className="h-px bg-gray-200/60 w-full" />

                {/* View Group */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="flex gap-1">
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-md shadow-sm">{modifierKey}</kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-md shadow-sm">Scroll</kbd>
                    </span>
                    <span>Smooth Zoom</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="flex gap-1">
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-md shadow-sm">{modifierKey}</kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-md shadow-sm">0</kbd>
                    </span>
                    <span>Reset Zoom</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Trigger Button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents canvas click from instantly closing it
            setIsLegendOpen(!isLegendOpen);
          }}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-md transition-all font-figtree font-medium"
        >
          ?
        </button>
      </div>
      {/* --- END LEGEND UI --- */}

    </div>
  );
}