import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { nichesData } from '../../data/nichesData';
import { Sparkles, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

export const NicheSection: React.FC = () => {
  const [activeNicheIndex, setActiveNicheIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalNiches = nichesData.length;

  // Optional subtle auto-rotation that pauses on user hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveNicheIndex((prev) => (prev + 1) % totalNiches);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, totalNiches]);

  const handlePrev = () => {
    setActiveNicheIndex((prev) => (prev === 0 ? totalNiches - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveNicheIndex((prev) => (prev + 1) % totalNiches);
  };

  const activeNiche = nichesData[activeNicheIndex];

  return (
    <section
      id="niches"
      className="relative bg-[#F8F6F2] py-14 md:py-20 flex flex-col justify-center overflow-hidden border-t border-[#E8E5E0]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 md:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EDE8DE] text-[#6E6E6E] text-xs font-medium mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
            <span>COMMUNITY ECOSYSTEM</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#111111] tracking-tight">
            Built For Every <span className="italic">Niche.</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6E6E6E] mt-2">
            Explore dedicated spaces and top creators crafted for every creative discipline.
          </p>
        </div>

        {/* Category Horizontal Pill Stream */}
        <div className="flex items-center justify-center gap-2 mb-8 md:mb-10 overflow-x-auto no-scrollbar py-1">
          {nichesData.map((niche, index) => {
            const isActive = index === activeNicheIndex;
            return (
              <button
                key={niche.id}
                onClick={() => setActiveNicheIndex(index)}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 flex-shrink-0 cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#111111] text-white shadow-md scale-105'
                    : 'bg-[#EDEAE3] text-[#7A7772] hover:text-[#111111] hover:bg-[#E2DFD8]'
                }`}
              >
                {niche.name}
              </button>
            );
          })}
        </div>

        {/* Synchronized Dual Image & Dynamic Editorial Display */}
        <div className="relative max-w-6xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Left Creator Image Card */}
            <div className="lg:col-span-4 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`left-${activeNiche.id}`}
                  initial={{ opacity: 0, y: 15, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative h-[300px] sm:h-[350px] lg:h-[380px] w-full rounded-3xl overflow-hidden shadow-luxury border border-[#E8E5E0] bg-white group"
                >
                  <img
                    src={activeNiche.leftImage}
                    alt={activeNiche.leftCreator}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-white/80 font-mono block">
                      {activeNiche.leftCategory}
                    </span>
                    <h4 className="font-serif text-lg sm:text-xl font-normal mt-0.5">{activeNiche.leftCreator}</h4>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Center Category Story */}
            <div className="lg:col-span-4 flex flex-col justify-center text-center px-4 py-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`text-${activeNiche.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                >
                  <span className="text-xs font-semibold tracking-[0.2em] text-[#8C8C8C] uppercase font-mono">
                    CATEGORY 0{activeNicheIndex + 1} / 0{totalNiches}
                  </span>

                  <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#111111] font-normal tracking-tight mt-2.5 mb-3 leading-tight">
                    {activeNiche.headline}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#6E6E6E] leading-relaxed mb-6 font-normal max-w-sm mx-auto">
                    {activeNiche.tagline}
                  </p>

                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111111] hover:underline cursor-pointer group mb-4">
                    <span>Explore {activeNiche.name} Creators</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>

                  {/* Navigation Arrow Controls */}
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <button
                      onClick={handlePrev}
                      aria-label="Previous niche"
                      className="w-9 h-9 rounded-full bg-white border border-[#E0DCD3] flex items-center justify-center text-[#111111] hover:bg-[#111111] hover:text-white transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {/* Progress Dots */}
                    <div className="flex items-center gap-1.5 px-2">
                      {nichesData.map((_, idx) => (
                        <span
                          key={idx}
                          onClick={() => setActiveNicheIndex(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            idx === activeNicheIndex
                              ? 'w-6 bg-[#111111]'
                              : 'w-1.5 bg-[#D5D0C6] hover:bg-[#8C8C8C]'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleNext}
                      aria-label="Next niche"
                      className="w-9 h-9 rounded-full bg-white border border-[#E0DCD3] flex items-center justify-center text-[#111111] hover:bg-[#111111] hover:text-white transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Creator Image Card */}
            <div className="lg:col-span-4 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`right-${activeNiche.id}`}
                  initial={{ opacity: 0, y: -15, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative h-[300px] sm:h-[350px] lg:h-[380px] w-full rounded-3xl overflow-hidden shadow-luxury border border-[#E8E5E0] bg-white group"
                >
                  <img
                    src={activeNiche.rightImage}
                    alt={activeNiche.rightCreator}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-white/80 font-mono block">
                      {activeNiche.rightCategory}
                    </span>
                    <h4 className="font-serif text-lg sm:text-xl font-normal mt-0.5">{activeNiche.rightCreator}</h4>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
