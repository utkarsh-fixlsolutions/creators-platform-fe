import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Bookmark, ArrowRight, Mouse } from 'lucide-react';
import { featuredCreators } from '../../data/creatorsData';
import { Creator } from '../../types';
import { VerifiedBadge } from '../ui/VerifiedBadge';

interface FeaturedCreatorsSectionProps {
  onSelectCreator: (creator: Creator) => void;
}

export const FeaturedCreatorsSection: React.FC<FeaturedCreatorsSectionProps> = ({
  onSelectCreator,
}) => {
  const [activeIndex, setActiveIndex] = useState(2); // Luna Rose default center
  const [activeFilter, setActiveFilter] = useState('All');
  const [savedCreators, setSavedCreators] = useState<string[]>([]);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedCreators((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % featuredCreators.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + featuredCreators.length) % featuredCreators.length);
  };

  return (
    <section id="creators" className="relative py-14 md:py-20 bg-[#F8F6F2] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Category Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-12">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.25em] text-[#8C8C8C] uppercase font-sans">
              DISCOVER
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-normal text-[#111111] tracking-tight mt-1">
              Featured <span className="italic">Creators</span>
            </h2>
            <p className="text-sm text-[#6E6E6E] mt-2 font-normal">
              Explore unique creators, stories and experiences.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['All', 'Trending', 'New', 'Top Rated'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                  activeFilter === filter
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'bg-[#EDEAE3] text-[#555555] hover:bg-[#E2DFD8] hover:text-[#111111]'
                }`}
              >
                {filter}
              </button>
            ))}

            <button className="px-3.5 py-1.5 text-xs font-medium text-[#111111] hover:text-[#555555] flex items-center gap-1 transition-colors ml-2 whitespace-nowrap">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ReactBits Card Spread Carousel Container */}
        <div className="relative min-h-[520px] flex items-center justify-center py-6 perspective-1000">
          
          {/* Left / Right Arrow Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 md:left-8 z-40 w-11 h-11 rounded-full bg-white/95 border border-[#E8E5E0] shadow-md flex items-center justify-center text-[#111111] hover:bg-white hover:scale-105 active:scale-95 transition-all"
            aria-label="Previous Creator"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-6 md:right-8 z-40 w-11 h-11 rounded-full bg-white/95 border border-[#E8E5E0] shadow-md flex items-center justify-center text-[#111111] hover:bg-white hover:scale-105 active:scale-95 transition-all"
            aria-label="Next Creator"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Cards Spread Viewport */}
          <div className="relative w-full max-w-5xl h-[460px] flex items-center justify-center">
            {featuredCreators.map((creator, index) => {
              // Calculate offset relative to active index
              const offset = (index - activeIndex + featuredCreators.length) % featuredCreators.length;
              // Normalize offset so it centers around 0: -2, -1, 0, 1, 2
              let normalizedOffset = offset;
              if (normalizedOffset > featuredCreators.length / 2) {
                normalizedOffset -= featuredCreators.length;
              }

              const isCenter = normalizedOffset === 0;
              const isVisible = Math.abs(normalizedOffset) <= 2;

              if (!isVisible) return null;

              // Spread positioning logic
              const xPos = normalizedOffset * 220; // horizontal separation
              const rotY = normalizedOffset * -8; // slight 3D angle
              const scale = isCenter ? 1.04 : 1 - Math.abs(normalizedOffset) * 0.08;
              const opacity = isCenter ? 1 : 1 - Math.abs(normalizedOffset) * 0.25;

              return (
                <motion.div
                  key={creator.id}
                  onClick={() => {
                    if (isCenter) {
                      onSelectCreator(creator);
                    } else {
                      setActiveIndex(index);
                    }
                  }}
                  animate={{
                    x: xPos,
                    scale,
                    opacity,
                    rotateY: rotY,
                    zIndex: isCenter ? 30 : 20 - Math.abs(normalizedOffset),
                  }}
                  transition={{ type: 'spring', damping: 25, stiffness: 260 }}
                  style={{ transformPerspective: 1200 }}
                  className={`absolute w-[280px] sm:w-[310px] bg-white rounded-3xl p-4 border border-[#E8E5E0] shadow-luxury cursor-pointer select-none transition-shadow duration-300 hover:shadow-luxury-hover`}
                >
                  
                  {/* Card Media Preview */}
                  <div className="relative aspect-[4/3.8] rounded-2xl overflow-hidden bg-[#EFECE6] mb-3.5 border border-[#EAE7DF]">
                    <img
                      src={creator.coverImage}
                      alt={creator.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Online / Status Pill */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-medium text-[#111111] flex items-center gap-1.5 shadow-xs">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          creator.status === 'online'
                            ? 'bg-emerald-500'
                            : creator.status === 'live'
                            ? 'bg-rose-500 animate-pulse'
                            : 'bg-zinc-400'
                        }`}
                      />
                      <span className="capitalize">{creator.status}</span>
                    </div>

                    {/* Like Count */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-medium text-[#111111] flex items-center gap-1 shadow-xs">
                      <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                      <span>{creator.likes}</span>
                    </div>

                    {/* Price Tag (if center) */}
                    {isCenter && (
                      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[#111111] shadow-xs">
                        {creator.monthlyPrice}
                      </div>
                    )}
                  </div>

                  {/* Creator Info */}
                  <div className="text-left px-1">
                    
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#111111] tracking-tight">
                        {creator.name}
                      </h3>
                      {creator.isVerified && <VerifiedBadge size={16} />}
                    </div>

                    <p className="text-[11px] text-[#7A7772] font-medium mb-2 truncate">
                      {creator.subcategories.join(' • ')}
                    </p>

                    {/* Center Card Extra Details */}
                    {isCenter && (
                      <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed mb-4">
                        {creator.bio}
                      </p>
                    )}

                    {/* Actions Row */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCreator(creator);
                        }}
                        className={`flex-1 py-2.5 px-4 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                          isCenter
                            ? 'bg-[#111111] text-white hover:bg-[#2B2B2B] shadow-sm'
                            : 'bg-[#F2EFE9] text-[#111111] hover:bg-[#E6E2D8]'
                        }`}
                      >
                        <span>View Profile</span>
                        {isCenter && <ArrowRight className="w-3.5 h-3.5" />}
                      </button>

                      {isCenter && (
                        <button
                          onClick={(e) => toggleSave(creator.id, e)}
                          className={`p-2.5 rounded-xl border transition-colors ${
                            savedCreators.includes(creator.id)
                              ? 'bg-[#111111] text-white border-[#111111]'
                              : 'bg-[#F8F6F2] text-[#111111] border-[#E8E5E0] hover:bg-[#ECE8DF]'
                          }`}
                          aria-label="Save Creator"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                  </div>

                </motion.div>
              );
            })}
          </div>

        </div>

        {/* Carousel Footer: Mouse Gesture Helper & Segment Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-[#E8E5E0]/70 max-w-4xl mx-auto">
          
          <div className="flex items-center gap-2 text-xs text-[#8C8C8C]">
            <Mouse className="w-4 h-4" />
            <span>Scroll or drag to explore</span>
          </div>

          {/* Segment Progress Bars */}
          <div className="flex items-center gap-1.5">
            {featuredCreators.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? 'w-7 bg-[#111111]'
                    : 'w-2 bg-[#DED9CF] hover:bg-[#8C8C8C]'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Slide Counter */}
          <div className="text-xs font-mono text-[#8C8C8C]">
            {String(activeIndex + 1).padStart(2, '0')} / {String(featuredCreators.length).padStart(2, '0')}
          </div>

        </div>

      </div>
    </section>
  );
};
