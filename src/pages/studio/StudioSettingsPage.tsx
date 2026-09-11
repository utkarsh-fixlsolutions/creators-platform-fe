import React, { useState } from 'react';
import { Globe, Save, Check } from 'lucide-react';

export const StudioSettingsPage: React.FC = () => {
  const [blockedCountries, setBlockedCountries] = useState(['RU', 'BY']);
  const [screenshotWarning, setScreenshotWarning] = useState(true);
  const [watermarking, setWatermarking] = useState(true);
  const [saved, setSaved] = useState(false);

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'RU', name: 'Russian Federation' },
    { code: 'BY', name: 'Belarus' },
  ];

  const toggleCountry = (code: string) => {
    setBlockedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5E0] shadow-luxury">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8C8C8C] font-mono">
          PRIVACY & SAFETY CONTROLS (PART J1)
        </span>
        <h2 className="font-serif text-3xl text-[#111111] mt-1 mb-2">Studio Privacy Settings</h2>
        <p className="text-xs text-[#6E6E6E] mb-6">
          Control country geo-blocking, dynamic media watermarking, and subscriber privacy.
        </p>

        <div className="space-y-6">
          
          {/* Geo-Blocking Section */}
          <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#EDE8DE]">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-[#111111]" />
              <h3 className="text-xs font-semibold text-[#111111]">Country Geo-Blocking (IP Filter)</h3>
            </div>
            <p className="text-[11px] text-[#7A7772] mb-4">
              Block visitors from selected countries from seeing your profile, posts, or live streams.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {countries.map((c) => {
                const isBlocked = blockedCountries.includes(c.code);
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => toggleCountry(c.code)}
                    className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all flex items-center justify-between ${
                      isBlocked
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-white border-[#E0DCD3] text-[#111111] hover:bg-[#F2EFE9]'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] font-bold font-mono">{isBlocked ? 'Blocked' : 'Allowed'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Watermarking Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-2xl border border-[#EDE8DE]">
            <div>
              <h4 className="text-xs font-semibold text-[#111111]">Dynamic Patron Watermarking</h4>
              <p className="text-[11px] text-[#7A7772]">Embed invisible viewer identifiers to prevent content leakage</p>
            </div>
            <input
              type="checkbox"
              checked={watermarking}
              onChange={(e) => setWatermarking(e.target.checked)}
              className="w-4 h-4 rounded text-[#111111]"
            />
          </div>

          {/* Screenshot Warning Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-2xl border border-[#EDE8DE]">
            <div>
              <h4 className="text-xs font-semibold text-[#111111]">In-App Screenshot Warnings</h4>
              <p className="text-[11px] text-[#7A7772]">Display anti-capture notice on mobile browsers</p>
            </div>
            <input
              type="checkbox"
              checked={screenshotWarning}
              onChange={(e) => setScreenshotWarning(e.target.checked)}
              className="w-4 h-4 rounded text-[#111111]"
            />
          </div>

          {/* Save Action */}
          <div className="pt-4 border-t border-[#F0ECE4] flex items-center justify-between">
            {saved ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Settings saved to server</span>
              </div>
            ) : (
              <span className="text-[11px] text-[#8C8C8C]">Changes take effect immediately across all edge CDNs.</span>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
