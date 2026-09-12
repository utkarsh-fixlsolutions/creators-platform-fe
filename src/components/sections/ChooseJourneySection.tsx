import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, ArrowRight, Video, MessageSquare, Heart, Upload, Radio, TrendingUp, DollarSign } from 'lucide-react';

interface ChooseJourneySectionProps {
  onSelectRole?: (role: 'fan' | 'creator') => void;
}

export const ChooseJourneySection: React.FC<ChooseJourneySectionProps> = ({ onSelectRole }) => {
  return (
    <section className="relative py-14 md:py-20 bg-[#F8F6F2] border-t border-[#E8E5E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <span className="text-[11px] font-semibold tracking-[0.25em] text-[#8C8C8C] uppercase font-sans">
            CHOOSE YOUR JOURNEY
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] tracking-tight mt-2">
            How do you want to <br />
            <span className="italic">experience LUXE?</span>
          </h2>
        </div>

        {/* Dual Master Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Card 1: The Fan Journey */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-[36px] p-8 sm:p-12 border border-[#E8E5E0] shadow-luxury transition-all duration-300 hover:shadow-luxury-hover flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#EDE9E1] flex items-center justify-center text-[#111111]">
                  <Compass className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#8C8C8C] font-mono">
                  THE FAN EXPERIENCE
                </span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl text-[#111111] font-normal tracking-tight mb-4">
                Discover & Connect
              </h3>

              <p className="text-xs sm:text-sm text-[#6E6E6E] font-normal leading-relaxed mb-8">
                Step into a quiet sanctuary of exclusive posts, high-fidelity livestreams, and private one-on-one creator interactions.
              </p>

              {/* 4 Action Pillars */}
              <div className="space-y-3.5 mb-10">
                <div className="flex items-center gap-3 text-xs font-medium text-[#111111]">
                  <div className="w-7 h-7 rounded-full bg-[#F5F2EC] flex items-center justify-center text-[#111111] flex-shrink-0">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <span><strong className="font-semibold">Discover</strong> curated creators across every craft</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-medium text-[#111111]">
                  <div className="w-7 h-7 rounded-full bg-[#F5F2EC] flex items-center justify-center text-[#111111] flex-shrink-0">
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <span><strong className="font-semibold">Watch</strong> exclusive 4K stories, clips, and live rooms</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-medium text-[#111111]">
                  <div className="w-7 h-7 rounded-full bg-[#F5F2EC] flex items-center justify-center text-[#111111] flex-shrink-0">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <span><strong className="font-semibold">Chat</strong> in private encrypted conversation threads</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-medium text-[#111111]">
                  <div className="w-7 h-7 rounded-full bg-[#F5F2EC] flex items-center justify-center text-[#111111] flex-shrink-0">
                    <Heart className="w-3.5 h-3.5" />
                  </div>
                  <span><strong className="font-semibold">Support</strong> with custom subscriptions & micro-tips</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectRole?.('fan')}
              className="w-full py-4 px-6 bg-[#111111] hover:bg-[#2A2A2A] text-white text-sm font-medium rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg active:scale-98"
            >
              <span>Explore as Fan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Card 2: The Creator Journey */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-[36px] p-8 sm:p-12 border border-[#E8E5E0] shadow-luxury transition-all duration-300 hover:shadow-luxury-hover flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#EDE9E1] flex items-center justify-center text-[#111111]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#8C8C8C] font-mono">
                  THE CREATOR STUDIO
                </span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl text-[#111111] font-normal tracking-tight mb-4">
                Create & Monetize
              </h3>

              <p className="text-xs sm:text-sm text-[#6E6E6E] font-normal leading-relaxed mb-8">
                Build a sustainable creative business with custom tier pricing, direct patron access, and bank-grade weekly payouts.
              </p>

              {/* 4 Action Pillars */}
              <div className="space-y-3.5 mb-10">
                <div className="flex items-center gap-3 text-xs font-medium text-[#111111]">
                  <div className="w-7 h-7 rounded-full bg-[#F5F2EC] flex items-center justify-center text-[#111111] flex-shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                  </div>
                  <span><strong className="font-semibold">Upload</strong> vaulted photos, masterclasses, and PPVs</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-medium text-[#111111]">
                  <div className="w-7 h-7 rounded-full bg-[#F5F2EC] flex items-center justify-center text-[#111111] flex-shrink-0">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <span><strong className="font-semibold">Go Live</strong> with zero latency and interactive gifts</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-medium text-[#111111]">
                  <div className="w-7 h-7 rounded-full bg-[#F5F2EC] flex items-center justify-center text-[#111111] flex-shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span><strong className="font-semibold">Grow</strong> with mass messaging & audience CRM</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-medium text-[#111111]">
                  <div className="w-7 h-7 rounded-full bg-[#F5F2EC] flex items-center justify-center text-[#111111] flex-shrink-0">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <span><strong className="font-semibold">Earn</strong> with multi-tiers & automated payouts</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectRole?.('creator')}
              className="w-full py-4 px-6 bg-[#111111] hover:bg-[#2A2A2A] text-white text-sm font-medium rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg active:scale-98"
            >
              <span>Become a Creator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
