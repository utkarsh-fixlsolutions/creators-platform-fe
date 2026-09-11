import React, { useState } from 'react';
import { Upload, Lock, Check, Globe, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudioCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<'free' | 'ppv' | 'subscribers'>('ppv');
  const [priceCoins, setPriceCoins] = useState(50);
  const mediaSelected = true;
  const [published, setPublished] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setPublished(true);
    setTimeout(() => {
      navigate('/app');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5E0] shadow-luxury">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8C8C8C] font-mono">
          CONTENT STUDIO CMS
        </span>
        <h2 className="font-serif text-3xl text-[#111111] mt-1 mb-2">Publish New Media</h2>
        <p className="text-xs text-[#6E6E6E] mb-6">
          Upload 4K photos, masterclasses, or audio diaries. Set paywall gates or share publicly.
        </p>

        {published ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl text-[#111111]">Content Published Live</h3>
            <p className="text-xs text-[#7A7772] mt-1">Passing pre-publish hash moderation and routing to discovery feed...</p>
          </div>
        ) : (
          <form onSubmit={handlePublish} className="space-y-6">
            
            {/* Media Upload Box */}
            <div className="border-2 border-dashed border-[#DDD8CE] rounded-2xl p-8 text-center bg-[#FAF8F5] hover:bg-[#F5F2EB] transition-colors cursor-pointer">
              {mediaSelected ? (
                <div className="relative aspect-[16/9] max-w-md mx-auto rounded-xl overflow-hidden border border-[#E0DCD3] shadow-xs">
                  <img
                    src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800"
                    alt="Uploaded media preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2.5 py-1 bg-black/75 text-white rounded-md text-[10px] font-mono">
                    4K Ultra HD
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-[#8C8C8C] mb-2" />
                  <p className="text-xs font-semibold text-[#111111]">Drag & drop 4K photos or video</p>
                  <p className="text-[11px] text-[#8C8C8C] mt-0.5">Supports MP4, MOV, RAW, JPEG up to 4GB</p>
                </div>
              )}
            </div>

            {/* Caption Textarea */}
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-2">
                Caption & Description
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Share the story behind this shoot, workout routines, or exclusive notes..."
                rows={4}
                className="w-full p-3.5 text-xs bg-[#F8F6F2] border border-[#E0DCD3] rounded-2xl text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111] transition-all"
                required
              />
            </div>

            {/* Paywall & Visibility Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-3">
                Monetization & Access Gate (Part C)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <button
                  type="button"
                  onClick={() => setVisibility('free')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    visibility === 'free'
                      ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                      : 'bg-[#F8F6F2] text-[#111111] border-[#E8E5E0] hover:bg-[#EFECE6]'
                  }`}
                >
                  <Globe className="w-4 h-4 mb-2" />
                  <h4 className="text-xs font-semibold">Public Free</h4>
                  <p className={`text-[10px] mt-0.5 ${visibility === 'free' ? 'text-white/80' : 'text-[#7A7772]'}`}>
                    Visible to all visitors
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility('ppv')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    visibility === 'ppv'
                      ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                      : 'bg-[#F8F6F2] text-[#111111] border-[#E8E5E0] hover:bg-[#EFECE6]'
                  }`}
                >
                  <Lock className="w-4 h-4 mb-2 text-amber-400" />
                  <h4 className="text-xs font-semibold">Pay-Per-View (PPV)</h4>
                  <p className={`text-[10px] mt-0.5 ${visibility === 'ppv' ? 'text-white/80' : 'text-[#7A7772]'}`}>
                    One-time unlock fee
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility('subscribers')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    visibility === 'subscribers'
                      ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                      : 'bg-[#F8F6F2] text-[#111111] border-[#E8E5E0] hover:bg-[#EFECE6]'
                  }`}
                >
                  <Users className="w-4 h-4 mb-2 text-[#4F46E5]" />
                  <h4 className="text-xs font-semibold">Subscribers Only</h4>
                  <p className={`text-[10px] mt-0.5 ${visibility === 'subscribers' ? 'text-white/80' : 'text-[#7A7772]'}`}>
                    Requires active tier
                  </p>
                </button>

              </div>
            </div>

            {/* PPV Pricing Input */}
            {visibility === 'ppv' && (
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E5E0] flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-[#111111]">Set PPV Unlock Price</h4>
                  <p className="text-[11px] text-[#7A7772]">Fans pay in Coins to unlock full-resolution media</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    max={2000}
                    value={priceCoins}
                    onChange={(e) => setPriceCoins(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 text-xs font-mono font-bold bg-white border border-[#DDD8CE] rounded-xl text-center focus:outline-none focus:border-[#111111]"
                  />
                  <span className="text-xs font-semibold text-[#111111]">Coins 🪙</span>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-4 border-t border-[#F0ECE4] flex items-center justify-between">
              <span className="text-[11px] text-[#8C8C8C]">
                Automated PhotoDNA & CSAM hash checking active.
              </span>
              <button
                type="submit"
                className="px-8 py-3 bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-98"
              >
                Publish Content Live
              </button>
            </div>

          </form>
        )}

      </div>

    </div>
  );
};
