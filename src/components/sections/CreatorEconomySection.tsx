import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { metricsData } from '../../data/storyCardsData';

interface CounterProps {
  target: number;
  prefix?: string;
  suffix: string;
}

const AnimatedNumber: React.FC<CounterProps> = ({ target, prefix = '', suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = target / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-[#111111] tracking-tight">
      {prefix}{count}{suffix}
    </span>
  );
};

export const CreatorEconomySection: React.FC = () => {
  return (
    <section className="relative py-14 md:py-20 bg-[#F8F6F2] border-t border-[#E8E5E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <span className="text-[11px] font-semibold tracking-[0.25em] text-[#8C8C8C] uppercase font-sans">
            THE SCALE OF LUXE
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] tracking-tight mt-2">
            A Global Creator <br />
            <span className="italic">Economy.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#6E6E6E] mt-3 font-normal">
            Empowering creative entrepreneurs with direct, transparent, and sustainable revenue.
          </p>
        </div>

        {/* 4 Large Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {metricsData.map((metric, idx) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8E5E0] shadow-luxury text-center flex flex-col justify-center items-center"
            >
              <div className="mb-2">
                <AnimatedNumber
                  target={metric.targetValue}
                  prefix={metric.prefix}
                  suffix={metric.suffix}
                />
              </div>

              <h4 className="text-sm sm:text-base font-semibold text-[#111111] tracking-tight mt-1">
                {metric.label}
              </h4>

              <p className="text-xs text-[#7A7772] mt-1.5 font-normal max-w-[200px]">
                {metric.sublabel}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
