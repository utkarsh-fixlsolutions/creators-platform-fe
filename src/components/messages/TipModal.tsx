import { useState } from 'react';
import { X, Gem, Sparkles, Coins } from 'lucide-react';
import type { Creator } from '../../data/messagesData';
import { cn } from '../../utils/cn';

interface Props {
  creator: Creator;
  balance: number;
  onClose: () => void;
  onSendTip: (amount: number, note: string) => void;
}

const PRESETS = [50, 100, 250, 500, 1000];

export default function TipModal({ creator, balance, onClose, onSendTip }: Props) {
  const [amount, setAmount] = useState<number>(100);
  const [custom, setCustom] = useState('');
  const [note, setNote] = useState('');

  const currentAmount = custom ? Number(custom) || 0 : amount;
  const canAfford = currentAmount > 0 && currentAmount <= balance;

  const submit = () => {
    if (!canAfford) return;
    onSendTip(currentAmount, note.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-float">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted hover:bg-paper hover:text-ink transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Creator Info Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="rounded-full p-[2px] bg-gradient-to-tr from-gold to-gold-soft">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-surface"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white shadow-sm">
              <Sparkles className="h-3 w-3" />
            </div>
          </div>

          <h3 className="font-display text-xl font-bold text-ink">
            Send a Tip to {creator.name}
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Support {creator.handle} directly with platform coins
          </p>

          {/* Balance Pill */}
          <div className="mt-3 flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink">
            <Coins className="h-3.5 w-3.5 text-gold" />
            <span>Your Balance:</span>
            <span className="text-gold font-bold">💎 {balance} coins</span>
          </div>
        </div>

        {/* Amount Selector */}
        <div className="mt-6">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">
            Select Tip Amount
          </label>

          <div className="mt-2 grid grid-cols-5 gap-1.5 sm:gap-2">
            {PRESETS.map((p) => {
              const active = !custom && amount === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setAmount(p);
                    setCustom('');
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-2xl py-2.5 transition-all text-center',
                    active
                      ? 'bg-ink text-white shadow-sm'
                      : 'bg-paper text-ink hover:bg-paper-warm'
                  )}
                >
                  <Gem className={cn('h-3.5 w-3.5 mb-1', active ? 'text-amber-300' : 'text-gold')} />
                  <span className="text-xs font-bold">{p}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Amount */}
          <div className="mt-3">
            <input
              type="number"
              min="1"
              max={balance}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Or enter custom coin amount..."
              className="w-full rounded-2xl border border-line bg-paper/60 px-4 py-2 text-xs text-ink outline-none transition placeholder:text-muted focus:border-brand/50 focus:bg-surface focus:ring-2 focus:ring-brand/10"
            />
          </div>
        </div>

        {/* Note input */}
        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">
            Personal Note (Optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Say something nice..."
            maxLength={120}
            className="mt-1.5 w-full rounded-2xl border border-line bg-paper/60 px-4 py-2 text-xs text-ink outline-none transition placeholder:text-muted focus:border-brand/50 focus:bg-surface focus:ring-2 focus:ring-brand/10"
          />
        </div>

        {/* Send Action */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-line py-2.5 text-xs font-semibold text-muted hover:bg-paper hover:text-ink transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={!canAfford}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-bold text-white transition-all shadow-sm',
              canAfford
                ? 'bg-brand hover:bg-brand-deep active:scale-95'
                : 'bg-muted/40 cursor-not-allowed'
            )}
          >
            <Gem className="h-3.5 w-3.5 text-amber-300" />
            <span>Send 💎 {currentAmount}</span>
          </button>
        </div>

        {!canAfford && currentAmount > 0 && (
          <p className="mt-2 text-center text-[11px] font-semibold text-rose">
            Insufficient coin balance ({balance} available)
          </p>
        )}
      </div>
    </div>
  );
}
