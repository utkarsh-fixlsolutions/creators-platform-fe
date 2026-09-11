import React, { useState } from 'react';
import { Send, Lock, Coins } from 'lucide-react';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';
import { useWalletStore } from '../../store/walletStore';

export const FanMessagesPage: React.FC = () => {
  const { coinsBalance, deductCoins } = useWalletStore();
  const [activeThread, setActiveThread] = useState('lunarose');
  const [messageText, setMessageText] = useState('');
  const [unlockedMsg, setUnlockedMsg] = useState(false);

  const threads = [
    {
      id: 'lunarose',
      name: 'Luna Rose',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120',
      lastMessage: 'Here is the private photo from today’s shoot!',
      time: '2m ago',
      unread: true,
    },
    {
      id: 'marcusvance',
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120',
      lastMessage: 'Thanks for the tip on the workout!',
      time: '1h ago',
      unread: false,
    },
    {
      id: 'ariavance',
      name: 'Aria Vance',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120',
      lastMessage: 'Lookbook preview drops tomorrow ✨',
      time: 'Yesterday',
      unread: false,
    },
  ];

  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'lunarose',
      text: 'Hey! Thanks so much for being a subscriber ♡',
      time: '2:15 PM',
      isPPV: false,
    },
    {
      id: 'm2',
      sender: 'me',
      text: 'Loved your recent travel video!',
      time: '2:18 PM',
      isPPV: false,
    },
    {
      id: 'm3',
      sender: 'lunarose',
      text: 'Here is the unreleased sunset set from the rooftop (Full Resolution):',
      time: '2:20 PM',
      isPPV: true,
      priceCoins: 40,
      mediaUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800',
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}`,
        sender: 'me',
        text: messageText,
        time: 'Just now',
        isPPV: false,
      },
    ]);
    setMessageText('');
  };

  const handleUnlockDM = (price: number) => {
    const success = deductCoins(price, "Unlocked Luna Rose's DM PPV");
    if (success) {
      setUnlockedMsg(true);
    } else {
      alert(`You have ${coinsBalance} Coins. You need ${price} Coins. Please top up your wallet.`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] bg-white rounded-3xl border border-[#E8E5E0] shadow-luxury overflow-hidden grid grid-cols-1 md:grid-cols-12">
      
      {/* Left Column: Thread List */}
      <div className="md:col-span-4 border-r border-[#E8E5E0] flex flex-col h-full bg-[#FAF8F5]">
        <div className="p-4 border-b border-[#E8E5E0]">
          <h2 className="font-serif text-xl text-[#111111]">Direct Messages</h2>
          <p className="text-[11px] text-[#7A7772]">Encrypted 1-on-1 patron conversations</p>
        </div>

        <div className="divide-y divide-[#EFECE6] overflow-y-auto flex-1">
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveThread(t.id)}
              className={`w-full p-4 text-left transition-colors flex items-center gap-3 ${
                activeThread === t.id ? 'bg-white border-l-4 border-l-[#111111]' : 'hover:bg-white/60'
              }`}
            >
              <img
                src={t.avatar}
                alt={t.name}
                className="w-11 h-11 rounded-full object-cover border border-[#E0DCD3]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#111111] truncate">{t.name}</span>
                  <span className="text-[10px] text-[#8C8C8C]">{t.time}</span>
                </div>
                <p className="text-[11px] text-[#6E6E6E] truncate mt-0.5">{t.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Chat Viewport */}
      <div className="md:col-span-8 flex flex-col h-full bg-white">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-[#E8E5E0] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120"
              alt="Luna Rose"
              className="w-9 h-9 rounded-full object-cover border border-[#E8E5E0]"
            />
            <div>
              <div className="flex items-center gap-1">
                <h3 className="text-xs font-semibold text-[#111111]">Luna Rose</h3>
                <VerifiedBadge size={14} />
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">● Online now</span>
            </div>
          </div>
          <button
            onClick={() => deductCoins(20, 'Tipped Luna Rose in DM')}
            className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold flex items-center gap-1"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Send Tip 20🪙</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#FAF8F5]">
          {messages.map((m) => {
            const isMe = m.sender === 'me';
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                
                {m.isPPV ? (
                  /* Price-Locked Message Bubble */
                  <div className="max-w-sm rounded-2xl overflow-hidden border border-[#E8E5E0] shadow-sm bg-white p-3 space-y-2.5">
                    <p className="text-xs text-[#111111]">{m.text}</p>
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#EFECE6]">
                      {unlockedMsg ? (
                        <img src={m.mediaUrl} alt="Unlocked" className="w-full h-full object-cover" />
                      ) : (
                        <div className="relative w-full h-full">
                          <img src={m.mediaUrl} alt="Locked PPV" className="w-full h-full object-cover blur-xl scale-105" />
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center text-white">
                            <Lock className="w-6 h-6 text-white mb-2" />
                            <h5 className="text-xs font-semibold">Price-Locked Media</h5>
                            <button
                              onClick={() => handleUnlockDM(m.priceCoins || 40)}
                              className="mt-3 px-4 py-2 bg-white text-[#111111] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md active:scale-95"
                            >
                              <Coins className="w-3.5 h-3.5 text-amber-600" />
                              <span>Unlock for {m.priceCoins} Coins</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] text-[#8C8C8C] text-right">{m.time}</div>
                  </div>
                ) : (
                  /* Standard Message Bubble */
                  <div
                    className={`max-w-sm p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#111111] text-white rounded-br-none'
                        : 'bg-white text-[#111111] border border-[#E8E5E0] shadow-2xs rounded-bl-none'
                    }`}
                  >
                    <p>{m.text}</p>
                    <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-white/70' : 'text-[#8C8C8C]'}`}>
                      {m.time}
                    </span>
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Message Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3.5 border-t border-[#E8E5E0] bg-white flex items-center gap-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a private message..."
            className="flex-1 px-4 py-2.5 text-xs bg-[#F8F6F2] border border-[#E0DCD3] rounded-full text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111]"
          />
          <button
            type="submit"
            className="p-2.5 rounded-full bg-[#111111] text-white hover:bg-[#2A2A2A] transition-colors"
            aria-label="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
