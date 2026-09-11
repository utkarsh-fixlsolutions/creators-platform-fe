import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCheck, CreditCard, HeartHandshake } from 'lucide-react';

export const TrustSafetySection: React.FC = () => {
  const trustCards = [
    {
      id: 'privacy',
      title: 'Complete Privacy',
      description: 'Your personal identity, phone, and card details are encrypted and never disclosed to third parties.',
      icon: <ShieldCheck className="w-5 h-5 text-[#111111]" />,
    },
    {
      id: 'verification',
      title: 'Verified Authenticity',
      description: 'Every verified creator passes 100% automated KYC & liveness identity assurance before publishing.',
      icon: <UserCheck className="w-5 h-5 text-[#111111]" />,
    },
    {
      id: 'payments',
      title: 'Discreet Billing',
      description: 'Bank-grade 256-bit encryption with confidential, generic card statement descriptors.',
      icon: <CreditCard className="w-5 h-5 text-[#111111]" />,
    },
    {
      id: 'moderation',
      title: '24/7 Community Care',
      description: 'Proactive content integrity monitoring and responsive creator support teams on standby.',
      icon: <HeartHandshake className="w-5 h-5 text-[#111111]" />,
    },
  ];

  return (
    <section className="relative py-14 md:py-18 bg-[#F8F6F2] border-t border-[#E8E5E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <span className="text-[11px] font-semibold tracking-[0.25em] text-[#8C8C8C] uppercase font-sans">
            SECURITY & STANDARDS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#111111] tracking-tight mt-1">
            Trust & <span className="italic">Integrity</span> First.
          </h2>
          <p className="text-xs sm:text-sm text-[#6E6E6E] mt-2.5 font-normal">
            A safe, compliant, and respectful ecosystem for all members.
          </p>
        </div>

        {/* 4 Small Elegant Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {trustCards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E8E5E0] shadow-xs hover:shadow-luxury transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#F5F2EC] flex items-center justify-center mb-5 border border-[#EBE7DF]">
                  {card.icon}
                </div>
                <h4 className="text-sm font-semibold text-[#111111] mb-2">{card.title}</h4>
                <p className="text-xs text-[#6E6E6E] leading-relaxed font-normal">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
