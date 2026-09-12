import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Lock, Heart } from 'lucide-react';

interface HeroSectionProps {
  onJoinClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onJoinClick }) => {
  return (
    <section className="relative pt-28 pb-14 md:pt-36 md:pb-18 overflow-hidden bg-[#F8F6F2]">
      
      {/* Subtle Warm Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#EAE6DD]/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center"
          >
            {/* Category Tag */}
            <div className="inline-flex items-center gap-2 mb-4 md:mb-5">
              <span className="text-[11px] font-medium tracking-[0.25em] text-[#85827D] uppercase font-sans">
                CREATORS • FANS • REAL CONNECTIONS
              </span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-normal leading-[1.05] tracking-[-0.02em] text-[#111111] mb-5">
              More Than <br className="hidden sm:inline" />
              <span className="italic font-normal">Content.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#6E6E6E] font-normal max-w-lg leading-relaxed mb-6 md:mb-8">
              A private space for creators and fans to connect, support and be part of something real.
            </p>

            {/* CTA Button */}
            <div className="flex items-center gap-4 mb-10 md:mb-12">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onJoinClick}
                className="px-8 py-3.5 bg-[#111111] hover:bg-[#262626] text-white text-sm font-medium rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center gap-3 group"
              >
                <span>Join Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>

            {/* 3 Credibility Pillars (Row below CTA) */}
            <div className="pt-6 border-t border-[#E8E5E0] grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#EDE9E1] text-[#111111] flex-shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#111111] leading-tight">500K+</h4>
                  <p className="text-[11px] text-[#7A7772] mt-0.5 leading-snug">Creators worldwide</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#EDE9E1] text-[#111111] flex-shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#111111] leading-tight">Private & Secure</h4>
                  <p className="text-[11px] text-[#7A7772] mt-0.5 leading-snug">Your privacy matters</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#EDE9E1] text-[#111111] flex-shrink-0 mt-0.5">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#111111] leading-tight">Real Connections</h4>
                  <p className="text-[11px] text-[#7A7772] mt-0.5 leading-snug">Fans. Creators. Community.</p>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Right Column: Editorial Portrait & Floating Social Proof */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-5 relative flex justify-center"
          >
            <div className="relative w-full max-w-md lg:max-w-none">
              
              {/* Main Portrait Card */}
              <div className="relative aspect-[4/5] rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/60 bg-[#E8E4DC]">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop"
                  alt="Featured Creator"
                  className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-103"
                />

                {/* Subtle Image Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

                {/* Handwritten Script Overlay */}
                <div className="absolute bottom-20 left-6 sm:left-8 select-none pointer-events-none">
                  <p className="font-handwriting text-white/95 text-3xl sm:text-4xl leading-tight drop-shadow-md">
                    Real People <br />
                    Real Stories <br />
                    <span className="text-2xl">♡</span>
                  </p>
                </div>

                {/* Floating Social Proof Pill (Bottom-Right of Image) */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 bg-white/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/80 shadow-lg flex items-center gap-2.5"
                >
                  {/* Avatar Stack */}
                  <div className="flex -space-x-2">
                    <img
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=120&auto=format&fit=crop"
                      alt="Creator Avatar"
                      className="w-7 h-7 rounded-full object-cover border-2 border-white"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=120&auto=format&fit=crop"
                      alt="Creator Avatar"
                      className="w-7 h-7 rounded-full object-cover border-2 border-white"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=120&auto=format&fit=crop"
                      alt="Creator Avatar"
                      className="w-7 h-7 rounded-full object-cover border-2 border-white"
                    />
                  </div>
                  <div className="text-left pr-1">
                    <p className="text-[11px] font-bold text-[#111111] leading-none">500K+</p>
                    <p className="text-[9px] text-[#6E6E6E] leading-tight mt-0.5">Creators worldwide</p>
                  </div>
                </motion.div>

              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
