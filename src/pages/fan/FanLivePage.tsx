import React, { useState } from 'react';
import { Radio, Users, Heart, MessageSquare, Send } from 'lucide-react';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';
import { useWalletStore } from '../../store/walletStore';
import { motion, AnimatePresence } from 'framer-motion';

export const FanLivePage: React.FC = () => {
  const { coinsBalance, deductCoins } = useWalletStore();
  const [chatMessage, setChatMessage] = useState('');
  const [giftEffect, setGiftEffect] = useState<string | null>(null);

  const [chatList, setChatList] = useState([
    { user: 'Maya', text: 'Amazing sound quality today! 🎸' },
    { user: 'David K', text: 'Loved the Positano lookbook!' },
    { user: 'Elena R', text: 'Can you play the acoustic chorus again? ✨' },
  ]);

  const giftCatalog = [
    { id: 'rose', name: 'Rose 🌹', coins: 10 },
    { id: 'heart', name: 'Heart Rocket 🚀', coins: 50 },
    { id: 'crown', name: 'Diamond Crown 👑', coins: 250 },
    { id: 'galaxy', name: 'LUXE Nebula 🌌', coins: 1000 },
  ];

  const handleSendGift = (gift: { name: string; coins: number }) => {
    const success = deductCoins(gift.coins, `Sent ${gift.name} in Live Room`);
    if (success) {
      setGiftEffect(gift.name);
      setChatList((prev) => [
        ...prev,
        { user: 'You', text: `Sent a ${gift.name}! 🎉` },
      ]);
      setTimeout(() => setGiftEffect(null), 3000);
    } else {
      alert(`You have ${coinsBalance} Coins. You need ${gift.coins} Coins. Please top up your wallet.`);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatList((prev) => [...prev, { user: 'You', text: chatMessage }]);
    setChatMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Full Live Video Player with Overlay */}
        <div className="lg:col-span-8 bg-black rounded-3xl overflow-hidden aspect-[16/10] relative flex flex-col justify-between p-6 shadow-2xl border border-[#333333]">
          
          {/* Background Live Stream Feed */}
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200"
            alt="Live Stream"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

          {/* Top Live Indicators */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-rose-600 text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                <Radio className="w-3.5 h-3.5" />
                <span>LIVE</span>
              </span>
              <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-300" />
                <span>342 Watching</span>
              </div>
            </div>

            <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-mono">
              WebRTC Low Latency
            </div>
          </div>

          {/* Center Gift Animation Overlay (Part E2) */}
          <AnimatePresence>
            {giftEffect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1.2, y: 0 }}
                exit={{ opacity: 0, scale: 1.5, y: -50 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              >
                <div className="p-6 rounded-3xl bg-black/80 backdrop-blur-xl border border-amber-400/60 text-center shadow-2xl">
                  <span className="text-5xl block mb-2">{giftEffect.split(' ')[1]}</span>
                  <h4 className="font-serif text-2xl text-amber-300 font-bold">You sent a {giftEffect}!</h4>
                  <p className="text-xs text-white/80 mt-1">Creator received credits in live ledger</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Stream Info & Creator Details */}
          <div className="z-10 text-white flex items-end justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120"
                alt="Luna Rose"
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif text-xl font-normal">Luna Rose</h3>
                  <VerifiedBadge size={16} />
                </div>
                <p className="text-xs text-white/80">Acoustic Session & Live Q&A ✨</p>
              </div>
            </div>

            <button
              onClick={() => handleSendGift(giftCatalog[0])}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Send Rose 10🪙</span>
            </button>
          </div>

        </div>

        {/* Right 4 Cols: Live Chat Stream & Gifting Drawer */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-[#E8E5E0] shadow-luxury flex flex-col justify-between h-[460px]">
          
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0ECE4]">
              <span className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>Live Chat</span>
              </span>
              <span className="text-[10px] text-[#8C8C8C] font-mono">Stream ID: #live_42</span>
            </div>

            {/* Chat List */}
            <div className="space-y-2.5 overflow-y-auto max-h-48 pr-1 text-xs">
              {chatList.map((c, i) => (
                <div key={i} className="p-2 rounded-xl bg-[#FAF8F5]">
                  <strong className="font-semibold text-[#111111]">{c.user}: </strong>
                  <span className="text-[#555555]">{c.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Gift Drawer & Chat Bar */}
          <div className="space-y-3 pt-3 border-t border-[#F0ECE4]">
            
            {/* 4 Tappable Gift Chips */}
            <div className="grid grid-cols-2 gap-2">
              {giftCatalog.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleSendGift(g)}
                  className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F0ECE4] border border-[#E8E5E0] text-left text-[11px] font-medium flex items-center justify-between transition-colors"
                >
                  <span>{g.name}</span>
                  <span className="font-mono text-[10px] text-[#7A7772]">{g.coins}🪙</span>
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex items-center gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Chat with Luna..."
                className="flex-1 px-3.5 py-2 text-xs bg-[#F8F6F2] border border-[#E0DCD3] rounded-full text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111]"
              />
              <button
                type="submit"
                className="p-2 rounded-full bg-[#111111] text-white hover:bg-[#2A2A2A]"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

        </div>

      </div>

    </div>
  );
};
