import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export const StudioBroadcastPage: React.FC = () => {
  const [segment, setSegment] = useState<'all' | 'tier2' | 'lapsed'>('all');
  const [message, setMessage] = useState('');
  const [isPPV, setIsPPV] = useState(true);
  const [priceCoins, setPriceCoins] = useState(30);
  const [sent, setSent] = useState(false);

  const getRecipientCount = () => {
    if (segment === 'all') return 284;
    if (segment === 'tier2') return 88;
    return 64;
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMessage('');
    }, 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5E0] shadow-luxury">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8C8C8C] font-mono">
          AUDIENCE CRM & BROADCASTS (PART D2)
        </span>
        <h2 className="font-serif text-3xl text-[#111111] mt-1 mb-2">Mass Direct Broadcast</h2>
        <p className="text-xs text-[#6E6E6E] mb-6">
          Compose once and fan out directly into individual fan conversation threads.
        </p>

        {sent ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl text-[#111111]">Broadcast Dispatched</h3>
            <p className="text-xs text-[#7A7772] mt-1">
              Fanned out to {getRecipientCount()} individual fan message threads in background queue.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendBroadcast} className="space-y-6">
            
            {/* Segment Selector Chips */}
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-2">
                Target Audience Segment
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'all', label: 'All Subscribers', count: '284 fans' },
                  { id: 'tier2', label: 'VIP Tier Patrons', count: '88 fans' },
                  { id: 'lapsed', label: '30-Day Lapsed', count: '64 fans' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSegment(s.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      segment === s.id
                        ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                        : 'bg-[#F8F6F2] text-[#111111] border-[#E8E5E0] hover:bg-[#EFECE6]'
                    }`}
                  >
                    <h4 className="text-xs font-semibold">{s.label}</h4>
                    <p className={`text-[10px] mt-0.5 ${segment === s.id ? 'text-white/80' : 'text-[#7A7772]'}`}>
                      {s.count}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-2">
                Message Content
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hey everyone! Dropping an unreleased voice note and lookbook sneak peek..."
                rows={4}
                className="w-full p-3.5 text-xs bg-[#F8F6F2] border border-[#E0DCD3] rounded-2xl text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111]"
                required
              />
            </div>

            {/* PPV Lock Option */}
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="ppv-toggle"
                  checked={isPPV}
                  onChange={(e) => setIsPPV(e.target.checked)}
                  className="w-4 h-4 rounded text-[#111111] focus:ring-0"
                />
                <label htmlFor="ppv-toggle" className="cursor-pointer text-xs font-semibold text-[#111111]">
                  Price-lock media attachment inside DMs (PPV Unlock)
                </label>
              </div>

              {isPPV && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={500}
                    value={priceCoins}
                    onChange={(e) => setPriceCoins(Number(e.target.value))}
                    className="w-20 px-3 py-1 text-xs font-mono font-bold bg-white border border-[#DDD8CE] rounded-xl text-center"
                  />
                  <span className="text-xs font-semibold">Coins 🪙</span>
                </div>
              )}
            </div>

            {/* Dispatch Button */}
            <div className="pt-4 border-t border-[#F0ECE4] flex items-center justify-between">
              <span className="text-xs font-medium text-[#7A7772]">
                Estimated reach: <strong className="text-[#111111]">{getRecipientCount()} recipients</strong>
              </span>
              <button
                type="submit"
                className="px-8 py-3 bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Broadcast</span>
              </button>
            </div>

          </form>
        )}

      </div>

    </div>
  );
};
