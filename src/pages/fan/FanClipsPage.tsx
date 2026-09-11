import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, Volume2, VolumeX, Coins } from 'lucide-react';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';
import { useWalletStore } from '../../store/walletStore';

export const FanClipsPage: React.FC = () => {
  const { deductCoins } = useWalletStore();
  const [activeClipIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  const clips = [
    {
      id: 'clip_1',
      creator: 'Luna Rose',
      handle: 'lunarose',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120',
      caption: 'Morning meditation & sound bath in the hills ✨ Full 30-min version in subscriber vault.',
      videoUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000',
      likes: '14.2K',
      comments: '340',
      category: 'Mindfulness',
    },
    {
      id: 'clip_2',
      creator: 'Marcus Vance',
      handle: 'marcusvance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120',
      caption: '3 exercises to fix shoulder mobility and posture after long desk hours 🏋️‍♂️',
      videoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000',
      likes: '8.9K',
      comments: '128',
      category: 'Fitness',
    },
  ];

  const currentClip = clips[activeClipIndex];

  return (
    <div className="max-w-md mx-auto h-[calc(100vh-140px)] max-h-[780px] bg-black rounded-3xl overflow-hidden relative shadow-2xl border border-[#333333] select-none">
      
      {/* Background Media Visual */}
      <img
        src={currentClip.videoUrl}
        alt={currentClip.caption}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />

      {/* Top Bar: Mute & Category */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white rounded-full text-xs font-medium">
          {currentClip.category}
        </span>
        <button
          onClick={() => setMuted(!muted)}
          className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Right Side Thumb-Zone Action Stack */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-4 z-10 text-white">
        
        <div className="relative mb-2">
          <img
            src={currentClip.avatar}
            alt={currentClip.creator}
            className="w-11 h-11 rounded-full object-cover border-2 border-white"
          />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
            +
          </div>
        </div>

        <button className="flex flex-col items-center gap-1 hover:scale-110 transition-transform">
          <div className="p-2.5 rounded-full bg-black/50 backdrop-blur-md text-rose-500 fill-rose-500">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
          <span className="text-[10px] font-semibold">{currentClip.likes}</span>
        </button>

        <button className="flex flex-col items-center gap-1 hover:scale-110 transition-transform">
          <div className="p-2.5 rounded-full bg-black/50 backdrop-blur-md">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold">{currentClip.comments}</span>
        </button>

        <button
          onClick={() => deductCoins(20, `Tipped ${currentClip.creator} on clip`)}
          className="flex flex-col items-center gap-1 hover:scale-110 transition-transform"
        >
          <div className="p-2.5 rounded-full bg-amber-500/80 backdrop-blur-md text-white">
            <Coins className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold">Tip 20🪙</span>
        </button>

        <button className="p-2.5 rounded-full bg-black/50 backdrop-blur-md hover:scale-110 transition-transform">
          <Share2 className="w-5 h-5" />
        </button>

      </div>

      {/* Bottom Creator Info & Caption */}
      <div className="absolute bottom-6 left-4 right-16 z-10 text-white text-left">
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="font-serif text-lg font-normal">{currentClip.creator}</h3>
          <VerifiedBadge size={14} />
        </div>
        <p className="text-xs text-white/90 line-clamp-2 leading-relaxed font-normal">
          {currentClip.caption}
        </p>
      </div>

    </div>
  );
};
