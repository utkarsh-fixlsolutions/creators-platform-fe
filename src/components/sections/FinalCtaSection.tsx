import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';

interface FinalCtaSectionProps {
  onCreatorClick?: () => void;
  onFanClick?: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({
  onCreatorClick,
  onFanClick,
}) => {
  return (
    <section className="relative py-14 md:py-20 bg-[#F8F6F2] border-t border-[#E8E5E0] overflow-hidden">
      
      {/* Subtle Warm Glow Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#EAE5DA]/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-[32px] sm:rounded-[36px] p-8 sm:p-12 md:p-14 border border-[#E8E5E0] shadow-luxury relative overflow-hidden"
        >
          
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5F2EB] text-[#7A7772] text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
            <span>MORE THAN CONTENT</span>
          </div>

          <h2 className="font-serif text-5xl sm:text-6xl md:text-7xl font-normal text-[#111111] tracking-tight mb-6">
            Ready to <span className="italic">Join?</span>
          </h2>

          <p className="text-sm sm:text-base text-[#6E6E6E] max-w-md mx-auto mb-10 font-normal leading-relaxed">
            Whether sharing your life's work or supporting creators you admire, your space is waiting.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            
            <button
              onClick={onCreatorClick}
              className="w-full sm:w-auto px-8 py-4 bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs sm:text-sm font-medium rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-98"
            >
              <span>Become a Creator</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onFanClick}
              className="w-full sm:w-auto px-8 py-4 bg-[#F5F2EB] hover:bg-[#EAE5DC] text-[#111111] text-xs sm:text-sm font-medium rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98 border border-[#E0DCD3]"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Creators</span>
            </button>

          </div>

        </motion.div>

      </div>
    </section>
  );
};
