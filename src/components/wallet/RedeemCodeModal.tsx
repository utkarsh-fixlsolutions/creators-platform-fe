import { useState, useEffect } from 'react';
import { X, Gift, Check, Sparkles, AlertCircle } from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import { cn } from '../../utils/cn';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (coins: number, code: string) => void;
}

const PROMO_CODES: Record<string, number> = {
  VIP50: 500,
  CREATOR10: 100,
  WELCOME2026: 250,
  GOLDENPASS: 1000,
};

export function RedeemCodeModal({ open, onClose, onSuccess }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState<number | null>(null);
  const topUpCoins = useWalletStore((s) => s.topUpCoins);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setError('Please enter a voucher or gift code.');
      return;
    }

    const coinsReward = PROMO_CODES[clean] ?? (clean.startsWith('GIFT') ? 300 : null);

    if (coinsReward) {
      topUpCoins(coinsReward);
      setRedeemed(coinsReward);
      setError(null);
      if (onSuccess) onSuccess(coinsReward, clean);
      setTimeout(() => {
        onClose();
        setRedeemed(null);
        setCode('');
      }, 1400);
    } else {
      setError('Invalid or expired promo code. Try codes like VIP50 or WELCOME2026.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-float transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <Gift className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-ink">Redeem a Gift Code</h2>
              <p className="text-xs text-muted">Enter a voucher to receive bonus coins</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-paper hover:text-ink transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {redeemed ? (
          <div className="py-8 flex flex-col items-center text-center space-y-2 animate-scale-in">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Check className="h-7 w-7 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-ink">Code Redeemed Successfully!</h3>
            <p className="text-xs text-muted">
              +{redeemed} Coins have been added to your Available Balance.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRedeem} className="mt-5 space-y-4">
            <div>
              <label className="block text-[11.5px] font-semibold text-faint uppercase tracking-wider mb-1.5">
                Voucher / Promo Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="e.g. VIP50 or WELCOME2026"
                className="w-full rounded-2xl border border-line bg-paper/60 px-4 py-3 text-sm font-semibold tracking-wider text-ink uppercase placeholder:normal-case placeholder:font-normal placeholder:text-muted outline-none transition focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/10"
              />
              {error && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-rose font-medium">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Quick Demo Codes Pill */}
            <div className="rounded-2xl border border-line/70 bg-paper/40 p-3">
              <p className="text-[11px] font-semibold text-muted flex items-center gap-1 mb-1.5">
                <Sparkles className="h-3 w-3 text-gold" /> Active Preview Vouchers:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(PROMO_CODES).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCode(c);
                      setError(null);
                    }}
                    className="rounded-lg border border-line bg-surface px-2 py-1 text-[11px] font-bold text-brand hover:bg-brand hover:text-white transition-all cursor-pointer"
                  >
                    {c} (+{PROMO_CODES[c]} coins)
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-muted hover:text-ink hover:bg-paper transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-deep active:scale-95 transition-all cursor-pointer"
              >
                Redeem Code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
