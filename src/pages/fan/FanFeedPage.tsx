import React, { useState } from 'react';
import { Heart, MessageSquare, Bookmark, Lock, Coins, Check } from 'lucide-react';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';
import { useWalletStore } from '../../store/walletStore';
import { NavLink } from 'react-router-dom';

export interface FeedPost {
  id: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  category: string;
  timestamp: string;
  caption: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  visibility: 'free' | 'ppv' | 'subscribers';
  priceCoins?: number;
  isUnlocked: boolean;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
}

export const FanFeedPage: React.FC = () => {
  const { coinsBalance, deductCoins } = useWalletStore();
  const [activeTab, setActiveTab] = useState<'for-you' | 'following' | 'exclusive'>('for-you');
  const [tipSuccessId, setTipSuccessId] = useState<string | null>(null);

  const [posts, setPosts] = useState<FeedPost[]>([
    {
      id: 'post_01',
      creatorName: 'Luna Rose',
      creatorHandle: 'lunarose',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
      category: 'Lifestyle & Travel',
      timestamp: '2 hours ago',
      caption: 'Sunset in Positano. Filming an exclusive travel itinerary video for subscribers tomorrow! ♡',
      mediaUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1000',
      mediaType: 'image',
      visibility: 'free',
      isUnlocked: true,
      likesCount: 1420,
      commentsCount: 88,
    },
    {
      id: 'post_02',
      creatorName: 'Marcus Vance',
      creatorHandle: 'marcusvance',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
      category: 'Athletic Conditioning',
      timestamp: '4 hours ago',
      caption: 'Full 45-minute HIIT & Core Masterclass (4K Video). Complete workout breakdown with posture cues.',
      mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000',
      mediaType: 'image',
      visibility: 'ppv',
      priceCoins: 50,
      isUnlocked: false,
      likesCount: 840,
      commentsCount: 42,
    },
    {
      id: 'post_03',
      creatorName: 'Aria Vance',
      creatorHandle: 'ariavance',
      creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
      category: 'Haute Couture',
      timestamp: '6 hours ago',
      caption: 'Paris Fashion Week backstage diary & lookbook fittings. VIP Patron access only.',
      mediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000',
      mediaType: 'image',
      visibility: 'subscribers',
      isUnlocked: true,
      likesCount: 2310,
      commentsCount: 156,
    },
  ]);

  const handleUnlock = (postId: string, price: number, creatorName: string) => {
    const success = deductCoins(price, `Unlocked ${creatorName}'s PPV post`);
    if (success) {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isUnlocked: true } : p))
      );
    } else {
      alert(`Insufficient coins! You have ${coinsBalance} Coins, but need ${price} Coins. Please top up in your wallet.`);
    }
  };

  const handleTip = (postId: string, creatorName: string) => {
    const success = deductCoins(20, `Tipped ${creatorName} 20 Coins`);
    if (success) {
      setTipSuccessId(postId);
      setTimeout(() => setTipSuccessId(null), 2000);
    } else {
      alert(`Insufficient coins to tip! You have ${coinsBalance} Coins. Top up in your wallet.`);
    }
  };

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1,
          };
        }
        return p;
      })
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Feed Tabs: For You / Following / Exclusive */}
      <div className="flex items-center justify-center gap-2 bg-[#EDE9E0]/80 p-1 rounded-full border border-[#E2DDD3] max-w-sm mx-auto mb-6">
        {(['for-you', 'following', 'exclusive'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-full capitalize transition-all ${
              activeTab === tab
                ? 'bg-white text-[#111111] shadow-xs'
                : 'text-[#6E6E6E] hover:text-[#111111]'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Stories Carousel Header */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E5E0] shadow-xs flex items-center gap-4 overflow-x-auto no-scrollbar">
        {[
          { name: 'Luna Rose', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120', live: false },
          { name: 'Marcus V.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120', live: true },
          { name: 'Mia Stone', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=120', live: true },
          { name: 'Aria Vance', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120', live: false },
          { name: 'Eva Lin', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=120', live: false },
        ].map((story, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
            <div className={`p-0.5 rounded-full ${story.live ? 'bg-gradient-to-tr from-rose-500 to-amber-500' : 'bg-gradient-to-tr from-[#4F46E5] to-[#E8E5E0]'}`}>
              <img
                src={story.avatar}
                alt={story.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="text-[11px] font-medium text-[#111111] max-w-[64px] truncate">{story.name}</span>
          </div>
        ))}
      </div>

      {/* Feed Posts Stream */}
      <div className="space-y-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-3xl border border-[#E8E5E0] shadow-luxury overflow-hidden transition-all"
          >
            {/* Post Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <NavLink to={`/app/@${post.creatorHandle}`} className="flex items-center gap-3 group">
                <img
                  src={post.creatorAvatar}
                  alt={post.creatorName}
                  className="w-10 h-10 rounded-full object-cover border border-[#E8E5E0]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#111111] group-hover:underline">{post.creatorName}</span>
                    <VerifiedBadge size={14} />
                  </div>
                  <p className="text-[11px] text-[#7A7772]">@{post.creatorHandle} • {post.timestamp}</p>
                </div>
              </NavLink>

              <span className="px-2.5 py-1 bg-[#F5F2EB] text-[#7A7772] text-[10px] font-mono uppercase tracking-wider rounded-full">
                {post.category}
              </span>
            </div>

            {/* Post Media / Paywall Card */}
            <div className="relative aspect-[4/3] bg-[#EFECE6] overflow-hidden">
              {post.visibility === 'ppv' && !post.isUnlocked ? (
                /* Blurred Locked PPV Gate */
                <div className="relative w-full h-full">
                  <img
                    src={post.mediaUrl}
                    alt="Locked PPV Content"
                    className="w-full h-full object-cover blur-2xl scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-serif text-2xl font-normal">Pay-Per-View Exclusive</h4>
                    <p className="text-xs text-white/80 max-w-xs mt-1 mb-5">
                      Unlock this 45-minute 4K workout masterclass to keep in your library forever.
                    </p>
                    <button
                      onClick={() => handleUnlock(post.id, post.priceCoins || 50, post.creatorName)}
                      className="px-6 py-2.5 bg-white text-[#111111] hover:bg-white/90 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg active:scale-98 transition-all"
                    >
                      <Coins className="w-4 h-4 text-amber-600" />
                      <span>Unlock for {post.priceCoins} Coins</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Unlocked Full Image */
                <img
                  src={post.mediaUrl}
                  alt={post.caption}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Post Caption & Actions */}
            <div className="p-4 sm:p-5">
              <p className="text-xs sm:text-sm text-[#333333] leading-relaxed mb-4">
                {post.caption}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-[#F0ECE4] text-xs text-[#6E6E6E]">
                <div className="flex items-center gap-4">
                  
                  {/* Like Button */}
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      post.isLiked ? 'text-rose-600 font-semibold' : 'hover:text-[#111111]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600' : ''}`} />
                    <span>{post.likesCount}</span>
                  </button>

                  {/* Comments Count */}
                  <button className="flex items-center gap-1.5 hover:text-[#111111] transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.commentsCount}</span>
                  </button>

                  {/* Micro Tip Button */}
                  <button
                    onClick={() => handleTip(post.id, post.creatorName)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors text-[11px] font-medium"
                  >
                    {tipSuccessId === post.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Tipped!</span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-3 h-3" />
                        <span>Tip 20🪙</span>
                      </>
                    )}
                  </button>

                </div>

                <button className="p-1.5 hover:text-[#111111] transition-colors">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>

          </article>
        ))}
      </div>

    </div>
  );
};
