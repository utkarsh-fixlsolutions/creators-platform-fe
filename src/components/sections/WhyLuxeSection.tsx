import React from 'react';
import { motion } from 'framer-motion';
import { storyCardsData } from '../../data/storyCardsData';
import { MessageSquare, Sparkles, Radio, Crown, ShieldCheck, ArrowRight } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare className="w-5 h-5 text-[#111111]" />,
  Sparkles: <Sparkles className="w-5 h-5 text-[#111111]" />,
  Radio: <Radio className="w-5 h-5 text-[#111111]" />,
  Crown: <Crown className="w-5 h-5 text-[#111111]" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-[#111111]" />,
};

export const WhyLuxeSection: React.FC = () => {
  return (
    <section id="why-luxe" className="relative py-14 md:py-20 bg-[#F8F6F2] overflow-hidden">
      
      {/* Background Subtle Accent */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[700px] h-[700px] bg-[#EDE9E0]/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="text-[11px] font-semibold tracking-[0.25em] text-[#8C8C8C] uppercase font-sans">
            CRAFTSMANSHIP & VALUES
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] tracking-tight mt-2">
            Why <span className="italic">LUXE</span>.
          </h2>
          <p className="text-base sm:text-lg text-[#6E6E6E] mt-4 font-normal">
            Designed from the ground up for intimacy, trust, and creative autonomy.
          </p>
        </div>

        {/* Floating Story Cards Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {storyCardsData.map((card, index) => {
            // Give each card a slight offset / float characteristic
            const isLarge = index === 0 || index === 3;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -8 }}
                className={`bg-white rounded-[32px] p-8 sm:p-10 border border-[#E8E5E0] shadow-luxury transition-all duration-300 hover:shadow-luxury-hover flex flex-col justify-between relative group ${
                  isLarge ? 'md:col-span-1 lg:col-span-1' : ''
                }`}
              >
                <div>
                  
                  {/* Top Row: Icon & Tag */}
                  <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5F2EC] flex items-center justify-center border border-[#EBE7DF] transition-transform group-hover:scale-105">
                      {iconMap[card.iconName]}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#F3EFE9] text-[#7A7772] text-[11px] font-mono uppercase tracking-wider">
                      {card.tag}
                    </span>
                  </div>

                  {/* Subtitle & Title */}
                  <p className="text-xs font-semibold text-[#8C8C8C] uppercase tracking-wider font-mono mb-1">
                    {card.subtitle}
                  </p>
                  <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] tracking-tight mb-4">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-normal">
                    {card.description}
                  </p>

                </div>

                {/* Subtle Interactive Footer */}
                <div className="pt-8 mt-6 border-t border-[#F0ECE4] flex items-center justify-between text-xs font-medium text-[#111111] opacity-75 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
