import { useState, useEffect } from 'react';
import { X, CreditCard, ShieldCheck, Lock } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SavedPaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'amex';
  label: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (method: SavedPaymentMethod) => void;
}

export function AddPaymentMethodModal({ open, onClose, onAdd }: Props) {
  const [cardNumber, setCardNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  // Format card number with spaces
  const handleCardChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    const parts = clean.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : clean);
    setError(null);
  };

  // Format expiry MM/YY
  const handleExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      setExpiry(`${clean.slice(0, 2)}/${clean.slice(2, 4)}`);
    } else {
      setExpiry(clean);
    }
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawNum = cardNumber.replace(/\s/g, '');
    if (rawNum.length < 15) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter the name on the card.');
      return;
    }
    if (expiry.length < 5) {
      setError('Please enter a valid expiration date (MM/YY).');
      return;
    }
    if (cvc.length < 3) {
      setError('Please enter a 3 or 4 digit security code.');
      return;
    }

    const isMc = rawNum.startsWith('5');
    const newMethod: SavedPaymentMethod = {
      id: `pm_${Date.now()}`,
      type: isMc ? 'mastercard' : 'visa',
      label: isMc ? 'Mastercard' : 'Visa',
      last4: rawNum.slice(-4),
      expiry,
      isDefault,
    };

    onAdd(newMethod);
    onClose();
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-ink">Add Payment Method</h2>
              <p className="text-xs text-muted">Save a credit or debit card for fast top-ups</p>
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-[11.5px] font-semibold text-faint uppercase tracking-wider mb-1.5">
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => handleCardChange(e.target.value)}
                placeholder="4242 4242 4242 4242"
                className="w-full rounded-2xl border border-line bg-paper/60 px-4 py-2.5 text-sm font-medium text-ink placeholder:text-muted outline-none transition focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/10 tabular-nums"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
                <Lock className="h-4 w-4 text-muted" />
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] font-semibold text-faint uppercase tracking-wider mb-1.5">
              Name on Card
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Maya Chen"
              className="w-full rounded-2xl border border-line bg-paper/60 px-4 py-2.5 text-sm font-medium text-ink placeholder:text-muted outline-none transition focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11.5px] font-semibold text-faint uppercase tracking-wider mb-1.5">
                Expires (MM/YY)
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => handleExpiryChange(e.target.value)}
                placeholder="09/28"
                className="w-full rounded-2xl border border-line bg-paper/60 px-4 py-2.5 text-sm font-medium text-ink placeholder:text-muted outline-none transition focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/10 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11.5px] font-semibold text-faint uppercase tracking-wider mb-1.5">
                CVC / CVV
              </label>
              <input
                type="password"
                maxLength={4}
                value={cvc}
                onChange={(e) => {
                  setCvc(e.target.value.replace(/\D/g, ''));
                  setError(null);
                }}
                placeholder="123"
                className="w-full rounded-2xl border border-line bg-paper/60 px-4 py-2.5 text-sm font-medium text-ink placeholder:text-muted outline-none transition focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/10 tabular-nums"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose font-medium mt-1">{error}</p>
          )}

          <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded-md border-line text-brand focus:ring-brand accent-brand"
            />
            <span className="text-xs font-semibold text-ink">Set as default payment method</span>
          </label>

          <div className="pt-3 border-t border-line flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Encrypted via Stripe</span>
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
                type="submit"
                className="rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-deep active:scale-95 transition-all cursor-pointer"
              >
                Save Card
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
