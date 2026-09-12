import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { nichesData } from '../../data/nichesData';
import { Sparkles, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const NicheSection: React.FC = () => {
  const [activeNicheIndex, setActiveNicheIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Pin the visual container and update category index as user scrolls through the section height
    const totalNiches = nichesData.length;
    
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=${totalNiches * 320}`,
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        const progress = self.progress;
        const index = Math.min(
          Math.floor(progress * totalNiches),
          totalNiches - 1
        );
        setActiveNicheIndex(index);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const activeNiche = nichesData[activeNicheIndex];

  return (
    <section
      id="niches"
      ref={sectionRef}
      className="relative min-h-[90vh] bg-[#F8F6F2] py-12 md:py-16 flex flex-col justify-center overflow-hidden border-t border-[#E8E5E0]"
    >
      <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
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
            Scroll to explore dedicated spaces crafted for every creative discipline.
          </p>
        </div>

        {/* Category Horizontal Pill Stream (Scroll Indicator) */}
        <div className="flex items-center justify-center gap-2 mb-6 md:mb-8 overflow-x-auto no-scrollbar py-1">
          {nichesData.map((niche, index) => {
            const isActive = index === activeNicheIndex;
            return (
              <button
                key={niche.id}
                onClick={() => setActiveNicheIndex(index)}
                className={`px-4 py-2 text-xs font-medium rounded-full transition-all duration-300 flex-shrink-0 ${
                  isActive
                    ? 'bg-[#111111] text-white shadow-sm scale-105'
                    : 'bg-[#EDEAE3] text-[#7A7772] hover:text-[#111111] hover:bg-[#E2DFD8]'
                }`}
              >
                {niche.name}
              </button>
            );
          })}
        </div>

        {/* Synchronized Dual Image & Dynamic Editorial Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          
          {/* Left Creator Image Card */}
          <div className="lg:col-span-4 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={`left-${activeNiche.id}`}
                initial={{ opacity: 0, y: 25, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -25, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-luxury border border-[#E8E5E0] bg-white group"
              >
                <img
                  src={activeNiche.leftImage}
                  alt={activeNiche.leftCreator}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-white/80 font-mono">
                    {activeNiche.leftCategory}
                  </span>
                  <h4 className="font-serif text-xl font-normal mt-0.5">{activeNiche.leftCreator}</h4>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Center Category Story */}
          <div className="lg:col-span-4 flex flex-col justify-center text-center px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${activeNiche.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.45 }}
              >
                <span className="text-xs font-semibold tracking-[0.2em] text-[#8C8C8C] uppercase font-mono">
                  CATEGORY 0{activeNicheIndex + 1} / 0{nichesData.length}
                </span>

                <h3 className="font-serif text-3xl sm:text-4xl text-[#111111] font-normal tracking-tight mt-3 mb-4 leading-tight">
                  {activeNiche.headline}
                </h3>

                <p className="text-xs sm:text-sm text-[#6E6E6E] leading-relaxed mb-6 font-normal max-w-sm mx-auto">
                  {activeNiche.tagline}
                </p>

                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111111] hover:underline cursor-pointer group">
                  <span>Explore {activeNiche.name} Creators</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Creator Image Card */}
          <div className="lg:col-span-4 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={`right-${activeNiche.id}`}
                initial={{ opacity: 0, y: -25, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 25, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-luxury border border-[#E8E5E0] bg-white group"
              >
                <img
                  src={activeNiche.rightImage}
                  alt={activeNiche.rightCreator}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-white/80 font-mono">
                    {activeNiche.rightCategory}
                  </span>
                  <h4 className="font-serif text-xl font-normal mt-0.5">{activeNiche.rightCreator}</h4>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
};
