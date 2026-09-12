import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Globe, Share2, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { Creator } from '../../types';

interface CreatorPreviewModalProps {
  creator: Creator | null;
  onClose: () => void;
  onViewFullProfile?: (creator: Creator) => void;
}

export const CreatorPreviewModal: React.FC<CreatorPreviewModalProps> = ({
  creator,
  onClose,
  onViewFullProfile,
}) => {
  if (!creator) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
        
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#111111]/40 backdrop-blur-md transition-all"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-3xl bg-[#FFFFFF] rounded-3xl sm:rounded-[36px] p-6 sm:p-8 shadow-2xl border border-[#E8E5E0] z-10 overflow-hidden"
        >
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-[#F5F2EC] hover:bg-[#EBE7DF] text-[#111111] transition-colors z-20"
            aria-label="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
            
            {/* Left: Creator Image with Status & Likes */}
            <div className="md:col-span-6 relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F0EDE6] border border-[#E8E5E0]">
              <img
                src={creator.coverImage}
                alt={creator.name}
                className="w-full h-full object-cover object-top"
              />

              {/* Status Badge */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-[#111111] flex items-center gap-1.5 shadow-sm">
                <span
                  className={`w-2 h-2 rounded-full ${
                    creator.status === 'online'
                      ? 'bg-emerald-500'
                      : creator.status === 'live'
                      ? 'bg-rose-500 animate-pulse'
                      : 'bg-zinc-400'
                  }`}
                />
                <span className="capitalize">{creator.status}</span>
              </div>

              {/* Likes Badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-[#111111] flex items-center gap-1 shadow-sm">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>{creator.likes}</span>
              </div>
            </div>

            {/* Right: Info, Bio & Action Buttons */}
            <div className="md:col-span-6 flex flex-col justify-center text-left">
              
              <div className="mb-1">
                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#8C8C8C] uppercase font-sans">
                  CREATOR
                </span>
              </div>

              {/* Name & Categories */}
              <h3 className="font-serif text-3xl sm:text-4xl text-[#111111] font-normal tracking-tight mb-1">
                {creator.name}
              </h3>

              <p className="text-xs sm:text-sm font-medium text-[#7A7772] mb-4">
                {creator.subcategories.join(' • ')}
              </p>

              {/* Authentic Bio */}
              <p className="text-xs sm:text-sm text-[#525252] leading-relaxed mb-6 font-normal">
                {creator.bio}
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-2.5 mb-8">
                <a
                  href={creator.socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-[#F5F2EC] hover:bg-[#EDE8DE] flex items-center justify-center text-[#111111] transition-colors"
                  title="Social Link"
                >
                  <Globe className="w-4 h-4" />
                </a>
                <a
                  href={creator.socials.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-[#F5F2EC] hover:bg-[#EDE8DE] flex items-center justify-center text-[#111111] transition-colors"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </a>
                <a
                  href={creator.socials.website}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-[#F5F2EC] hover:bg-[#EDE8DE] flex items-center justify-center text-[#111111] transition-colors"
                  title="Website Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </a>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={() => onViewFullProfile?.(creator)}
                className="w-full py-3.5 px-6 bg-[#111111] hover:bg-[#2B2B2B] text-white text-sm font-medium rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-98"
              >
                <span>View Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
};
