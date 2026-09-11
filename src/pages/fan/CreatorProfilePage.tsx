import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { featuredCreators } from '../../data/creatorsData';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';
import { Lock, Sparkles, Check, ShieldCheck, X } from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import { motion, AnimatePresence } from 'framer-motion';

export const CreatorProfilePage: React.FC = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { coinsBalance, deductCoins } = useWalletStore();
  const [activeTab, setActiveTab] = useState<'free' | 'subscribers'>('free');
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Find creator by handle or fallback to first creator
  const cleanHandle = handle?.replace('@', '') || 'lunarose';
  const creator = featuredCreators.find(
    (c) => c.handle.replace('@', '') === cleanHandle
  ) || featuredCreators[0];

  const tiers = [
    {
      id: 'tier_1',
      name: 'Tier 1 — Enthusiast',
      price: '$9.99/mo',
      priceCoins: 100,
      benefits: [
        'Full access to all subscriber feed posts',
        'Direct messaging thread & priority replies',
        'Subscriber badge on live streams',
      ],
      recommended: false,
    },
    {
      id: 'tier_2',
      name: 'Tier 2 — VIP Patron',
      price: '$24.99/mo',
      priceCoins: 250,
      benefits: [
        'Everything in Tier 1',
        'Exclusive 4K monthly digital masterclasses',
        '1-on-1 monthly live stream audio party room',
        'Custom archived photo & video vaults',
      ],
      recommended: true,
    },
  ];

  const handleConfirmSubscribe = (tierName: string, priceCoins: number) => {
    const success = deductCoins(priceCoins, `Subscribed to ${creator.name} (${tierName})`);
    if (success) {
      setIsSubscribed(true);
      setSubscribeModalOpen(false);
      setActiveTab('subscribers');
    } else {
      alert(`You have ${coinsBalance} Coins. You need ${priceCoins} Coins for this tier. Please top up your wallet.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Creator Profile Hero Banner */}
      <div className="bg-white rounded-3xl border border-[#E8E5E0] shadow-luxury overflow-hidden">
        
        {/* Banner Image */}
        <div className="h-48 sm:h-64 bg-[#E8E4DC] relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1400"
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Info Header */}
        <div className="px-6 sm:px-8 pb-8 relative">
          
          {/* Avatar & Subscribe CTA */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-6">
            <div className="flex items-end gap-4">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-md bg-white"
              />
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111]">{creator.name}</h1>
                  <VerifiedBadge size={18} />
                </div>
                <p className="text-xs text-[#7A7772] font-medium">{creator.handle}</p>
              </div>
            </div>

            {/* Subscribe / Message Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/app/messages')}
                className="px-4 py-2.5 bg-[#F5F2EB] hover:bg-[#EAE5DC] text-[#111111] text-xs font-medium rounded-xl border border-[#E0DCD3] transition-colors"
              >
                Message
              </button>
              
              {isSubscribed ? (
                <div className="px-5 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Subscribed</span>
                </div>
              ) : (
                <button
                  onClick={() => setSubscribeModalOpen(true)}
                  className="px-6 py-2.5 bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-98"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Subscribe • From {creator.monthlyPrice}</span>
                </button>
              )}
            </div>
          </div>

          {/* Bio & Categories */}
          <p className="text-xs sm:text-sm text-[#444444] max-w-2xl leading-relaxed mb-4">
            {creator.bio}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {creator.subcategories.map((cat, i) => (
              <span key={i} className="px-3 py-1 bg-[#F5F2EB] text-[#6E6E6E] text-[11px] font-medium rounded-full">
                {cat}
              </span>
            ))}
            <span className="text-xs text-[#8C8C8C] ml-2">
              ❤️ {creator.likes} likes • 54 posts
            </span>
          </div>

        </div>

        {/* Profile Tabs: Free Content vs Subscribers Only */}
        <div className="flex border-t border-[#E8E5E0] bg-[#FAF8F5]">
          <button
            onClick={() => setActiveTab('free')}
            className={`flex-1 py-3 text-xs font-semibold transition-all border-b-2 ${
              activeTab === 'free'
                ? 'border-[#111111] text-[#111111] bg-white'
                : 'border-transparent text-[#7A7772] hover:text-[#111111]'
            }`}
          >
            Public Feed (12)
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`flex-1 py-3 text-xs font-semibold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'subscribers'
                ? 'border-[#111111] text-[#111111] bg-white'
                : 'border-transparent text-[#7A7772] hover:text-[#111111]'
            }`}
          >
            <Lock className="w-3 h-3 text-amber-600" />
            <span>Subscribers Vault (42)</span>
          </button>
        </div>

      </div>

      {/* Grid Content */}
      {activeTab === 'free' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600',
            'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600',
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600',
          ].map((img, idx) => (
            <div key={idx} className="aspect-square bg-white rounded-2xl overflow-hidden border border-[#E8E5E0] shadow-xs group relative">
              <img src={img} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-4 text-xs font-semibold">
                <span>❤️ 240</span>
                <span>💬 18</span>
              </div>
            </div>
          ))}
        </div>
      ) : isSubscribed ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600',
            'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600',
            'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=600',
          ].map((img, idx) => (
            <div key={idx} className="aspect-square bg-white rounded-2xl overflow-hidden border border-[#E8E5E0] shadow-xs group relative">
              <img src={img} alt="Subscribed Post" className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#111111]/80 text-white rounded-md text-[10px] font-mono">
                VIP Post
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Subscribers Paywall Notice */
        <div className="bg-white rounded-3xl p-10 border border-[#E8E5E0] text-center shadow-luxury">
          <div className="w-14 h-14 rounded-2xl bg-[#F5F2EB] flex items-center justify-center mx-auto mb-4 border border-[#E8E5E0]">
            <Lock className="w-6 h-6 text-[#111111]" />
          </div>
          <h3 className="font-serif text-2xl text-[#111111] mb-2">Subscribe to Unlock VIP Vault</h3>
          <p className="text-xs text-[#6E6E6E] max-w-sm mx-auto mb-6">
            Join {creator.name}'s patron circle to unlock 42 exclusive masterclass videos, backstage diaries, and private Q&As.
          </p>
          <button
            onClick={() => setSubscribeModalOpen(true)}
            className="px-8 py-3 bg-[#111111] text-white text-xs font-semibold rounded-xl shadow-md hover:bg-[#2A2A2A] transition-all"
          >
            View Subscription Tiers
          </button>
        </div>
      )}

      {/* Subscription Tier Comparison Modal */}
      <AnimatePresence>
        {subscribeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSubscribeModalOpen(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5E0] shadow-2xl z-10 text-left"
            >
              <button
                onClick={() => setSubscribeModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-[#F5F2EB] text-[#111111] hover:bg-[#EAE5DC]"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8C8C8C] font-mono">
                MEMBERSHIP TIERS
              </span>
              <h3 className="font-serif text-3xl text-[#111111] mt-1 mb-2">
                Join {creator.name}'s Community
              </h3>
              <p className="text-xs text-[#6E6E6E] mb-6">
                Choose a monthly patronage tier. Cancel anytime with no questions asked.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`p-6 rounded-2xl border flex flex-col justify-between ${
                      tier.recommended
                        ? 'bg-[#F9F7F2] border-[#111111] shadow-md relative'
                        : 'bg-white border-[#E8E5E0]'
                    }`}
                  >
                    {tier.recommended && (
                      <span className="absolute -top-3 right-4 px-2.5 py-0.5 bg-[#111111] text-white rounded-full text-[9px] font-bold uppercase">
                        Recommended
                      </span>
                    )}

                    <div>
                      <h4 className="font-serif text-xl text-[#111111] mb-1">{tier.name}</h4>
                      <p className="font-mono text-xl font-bold text-[#111111] mb-4">{tier.price} <span className="text-xs font-normal text-[#8C8C8C]">({tier.priceCoins} 🪙/mo)</span></p>

                      <ul className="space-y-2 mb-6 text-xs text-[#555555]">
                        {tier.benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleConfirmSubscribe(tier.name, tier.priceCoins)}
                      className={`w-full py-2.5 text-xs font-semibold rounded-xl transition-all ${
                        tier.recommended
                          ? 'bg-[#111111] text-white hover:bg-[#2A2A2A]'
                          : 'bg-[#F2EFE9] text-[#111111] hover:bg-[#E8E4DA]'
                      }`}
                    >
                      Subscribe with {tier.priceCoins} Coins
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#8C8C8C]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Renews monthly on your Coin balance. Discreet generic billing descriptors.</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
