import React, { useState } from 'react';
import { Radio, Users, MessageSquare, Video, Mic } from 'lucide-react';

export const StudioLivePage: React.FC = () => {
  const [isLive, setIsLive] = useState(false);
  const [activeGifts] = useState([
    { user: '@samuel', gift: 'Rose Bouquet 🌹', coins: 50, time: '1m ago' },
    { user: '@alex_m', gift: 'Diamond Crown 👑', coins: 500, time: '3m ago' },
    { user: '@clara', gift: 'Heart Rocket 🚀', coins: 100, time: '5m ago' },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Live Broadcast Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Video Camera Feed & Stream Controls */}
        <div className="lg:col-span-8 bg-black rounded-3xl overflow-hidden aspect-[16/10] relative flex flex-col justify-between p-6 shadow-2xl border border-[#333333]">
          
          {/* Top Bar inside Video Viewport */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isLive ? 'bg-rose-600 text-white animate-pulse' : 'bg-zinc-800 text-zinc-400'
              }`}>
                <Radio className="w-3.5 h-3.5" />
                <span>{isLive ? 'LIVE' : 'OFFLINE'}</span>
              </span>

              {isLive && (
                <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-zinc-300" />
                  <span>342 Viewers</span>
                </div>
              )}
            </div>

            <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-mono">
              WebRTC Low Latency (48ms)
            </div>
          </div>

          {/* Center Simulated Broadcaster Preview */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200"
              alt="Live Stream Feed"
              className="w-full h-full object-cover opacity-80"
            />
            {!isLive && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <Video className="w-12 h-12 text-zinc-400 mb-3" />
                <h3 className="font-serif text-2xl">Studio Camera Ready</h3>
                <p className="text-xs text-zinc-400 mt-1">Configure room title and start broadcast</p>
              </div>
            )}
          </div>

          {/* Bottom Stream Controls inside Viewport */}
          <div className="flex items-center justify-between z-10 pt-4">
            <div className="flex items-center gap-2">
              <button className="p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors">
                <Mic className="w-4 h-4" />
              </button>
              <button className="p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors">
                <Video className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-8 py-3 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-98 ${
                isLive
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {isLive ? 'End Broadcast' : 'Go Live Now'}
            </button>
          </div>

        </div>

        {/* Right 4 Cols: Live Chat & Real-Time Gifting Stream */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-[#E8E5E0] shadow-luxury flex flex-col justify-between h-[460px]">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0ECE4]">
              <span className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>Live Chat Room</span>
              </span>
              <span className="text-[10px] font-mono text-[#8C8C8C]">Moderated</span>
            </div>

            {/* Chat Stream */}
            <div className="space-y-2.5 overflow-y-auto max-h-56 pr-1 text-xs">
              <div className="p-2 rounded-xl bg-[#FAF8F5]">
                <strong className="font-semibold text-[#111111]">@maya: </strong>
                <span className="text-[#555555]">Sound is crystal clear! Excited for the acoustic track 🎸</span>
              </div>
              <div className="p-2 rounded-xl bg-[#FAF8F5]">
                <strong className="font-semibold text-[#111111]">@david_k: </strong>
                <span className="text-[#555555]">Hello from London! Loved your Positano vlog!</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                <strong className="font-bold text-amber-900">@alex_m sent a Diamond Crown 👑 (500🪙)</strong>
              </div>
            </div>
          </div>

          {/* Gifting Alert Box */}
          <div className="pt-3 border-t border-[#F0ECE4]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C8C8C] block mb-2 font-mono">
              REAL-TIME GIFTS
            </span>
            <div className="space-y-1.5">
              {activeGifts.map((g, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-[#FAF8F5]">
                  <span className="font-medium text-[#111111]">{g.user}</span>
                  <span className="font-semibold text-rose-600">{g.gift}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
