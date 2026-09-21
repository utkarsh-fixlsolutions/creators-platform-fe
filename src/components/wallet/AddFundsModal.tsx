import { useState, useEffect } from 'react';
import { X, Gem, Check, CreditCard, Sparkles, ShieldCheck } from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import { cn } from '../../utils/cn';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (coins: number, amount: number) => void;
}

interface CoinPack {
  id: string;
  coins: number;
  bonusCoins: number;
  price: number;
  badge?: string;
  popular?: boolean;
}

const COIN_PACKS: CoinPack[] = [
  { id: 'pack_10', coins: 100, bonusCoins: 0, price: 10.00 },
  { id: 'pack_25', coins: 250, bonusCoins: 25, price: 25.00, badge: '+10% Bonus' },
  { id: 'pack_50', coins: 500, bonusCoins: 100, price: 50.00, badge: '+20% Bonus', popular: true },
  { id: 'pack_100', coins: 1000, bonusCoins: 300, price: 100.00, badge: '+30% Bonus' },
];

export function AddFundsModal({ open, onClose, onSuccess }: Props) {
  const [selectedPackId, setSelectedPackId] = useState<string>('pack_50');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('visa_4242');
  const [isProcessing, setIsProcessing] = useState(false);
  const topUpCoins = useWalletStore((s) => s.topUpCoins);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const activePack = COIN_PACKS.find((p) => p.id === selectedPackId);
  const totalCoins = customAmount
    ? Math.floor(Number(customAmount) * 10)
    : (activePack ? activePack.coins + activePack.bonusCoins : 0);
  const totalPrice = customAmount ? Number(customAmount) : (activePack ? activePack.price : 0);

  const handleConfirm = () => {
    if (totalPrice <= 0 || totalCoins <= 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      topUpCoins(totalCoins);
      setIsProcessing(false);
      if (onSuccess) onSuccess(totalCoins, totalPrice);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-line bg-surface p-6 shadow-float transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Gem className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-ink">Add Funds to Wallet</h2>
              <p className="text-xs text-muted">Purchase coins to tip creators and unlock drops</p>
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

        {/* Coin Pack Tiers */}
        <div className="mt-5 space-y-2.5">
          <p className="text-[11.5px] font-semibold text-faint uppercase tracking-wider">
            Select a coin package
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {COIN_PACKS.map((pack) => {
              const isSelected = selectedPackId === pack.id && !customAmount;
              const coinsTotal = pack.coins + pack.bonusCoins;

              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => {
                    setSelectedPackId(pack.id);
                    setCustomAmount('');
                  }}
                  className={cn(
                    'relative flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all cursor-pointer',
                    isSelected
                      ? 'border-brand bg-brand/5 ring-2 ring-brand/20 shadow-xs'
                      : 'border-line bg-paper/60 hover:bg-paper hover:border-line-strong'
                  )}
                >
                  {pack.popular && (
                    <span className="absolute -top-2.5 right-3 flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[9.5px] font-bold text-white shadow-xs">
                      <Sparkles className="h-2.5 w-2.5" /> Popular
                    </span>
                  )}
                  {pack.badge && !pack.popular && (
                    <span className="absolute -top-2.5 right-3 rounded-full bg-gold-soft/30 px-2 py-0.5 text-[9.5px] font-bold text-gold ring-1 ring-gold/30">
                      {pack.badge}
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 text-ink font-bold text-base">
                    <Gem className="h-4 w-4 text-gold shrink-0" />
                    <span>{coinsTotal.toLocaleString()} Coins</span>
                  </div>
                  <span className="text-xs text-muted font-medium mt-0.5">
                    ${pack.price.toFixed(2)} USD
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="mt-5 space-y-2">
          <p className="text-[11.5px] font-semibold text-faint uppercase tracking-wider">
            Pay with
          </p>
          <div className="flex items-center justify-between rounded-2xl border border-line bg-paper/60 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-10 items-center justify-center rounded-md bg-ink text-white text-[9px] font-extrabold tracking-wider">
                VISA
              </div>
              <div>
                <p className="text-xs font-semibold text-ink">Visa ending in 4242</p>
                <p className="text-[11px] text-muted">Expires 09/28</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-brand">
              <Check className="h-3.5 w-3.5" /> Selected
            </span>
          </div>
        </div>

        {/* Total & Action */}
        <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted">Total payment</p>
            <p className="text-lg font-bold text-ink">${totalPrice.toFixed(2)} USD</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-muted hover:text-ink hover:bg-paper transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing || totalPrice <= 0}
              className={cn(
                'flex items-center gap-1.5 rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-brand-deep active:scale-95 cursor-pointer',
                isProcessing && 'opacity-70 cursor-wait'
              )}
            >
              {isProcessing ? 'Processing...' : `Add ${totalCoins.toLocaleString()} Coins`}
            </button>
          </div>
        </div>

        {/* Security notice */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>256-bit encrypted checkout. Instant delivery to your wallet.</span>
        </div>
      </div>
    </div>
  );
}
