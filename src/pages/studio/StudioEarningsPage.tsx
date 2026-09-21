import { useCallback, useRef, useState } from 'react';
import { Heart, Crown, Lock, MessageCircle, ArrowRight } from 'lucide-react';
import { EARNINGS_BALANCE, EARNINGS_BREAKDOWN, EARNINGS_TRANSACTIONS } from '../../data/studioData';
import { Toast } from '../../components/Toast';
import { cn } from '../../utils/cn';

const CATEGORY_ICON = {
  tip: Heart,
  subscription: Crown,
  paid_content: Lock,
  message: MessageCircle,
} as const;

const CATEGORY_STYLE = {
  tip: 'bg-rose/10 text-rose',
  subscription: 'bg-brand/10 text-brand',
  paid_content: 'bg-amber-50 text-gold',
  message: 'bg-emerald-50 text-emerald-600',
} as const;

export function StudioEarningsPage() {
  const [visibleCount, setVisibleCount] = useState(4);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Earnings</h1>
        <button
          type="button"
          onClick={() => notify('Payout requested — funds arrive in 2-3 business days 💸')}
          className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-brand transition-colors cursor-pointer"
        >
          Withdraw
        </button>
      </div>

      {/* Balance hero */}
      <section className="rounded-[24px] bg-ink p-6 sm:p-7 text-white shadow-card">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-white/55">Total balance</p>
        <p className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-[-0.02em]">
          ${EARNINGS_BALANCE.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
        <p className="mt-1.5 text-xs font-semibold text-emerald-300">{EARNINGS_BALANCE.totalDelta}</p>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/12 pt-4">
          <div>
            <p className="text-[11px] text-white/55">Available</p>
            <p className="text-lg font-bold">${EARNINGS_BALANCE.available.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/55">Processing</p>
            <p className="text-lg font-bold">${EARNINGS_BALANCE.processing.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </section>

      {/* Breakdown */}
      <section className="rounded-[24px] border border-line bg-surface p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-[15px] font-bold text-ink">Earnings breakdown</h2>
          <span className="text-xs text-muted font-medium">Last 30 days</span>
        </div>
        <div className="divide-y divide-line/70">
          {EARNINGS_BREAKDOWN.map((row) => (
            <div key={row.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <span className="text-sm text-ink font-medium">{row.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-ink">${row.amount.toLocaleString()}</span>
                <span className="text-[11px] font-semibold text-emerald-600">{row.delta}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Transactions */}
      <section className="rounded-[24px] border border-line bg-surface p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-[15px] font-bold text-ink">Recent transactions</h2>
          <button
            type="button"
            onClick={() => notify('Full transaction history — coming soon')}
            className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer"
          >
            See all <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="divide-y divide-line/70">
          {EARNINGS_TRANSACTIONS.slice(0, visibleCount).map((tx) => {
            const Icon = CATEGORY_ICON[tx.category];
            return (
              <div key={tx.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', CATEGORY_STYLE[tx.category])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink truncate">{tx.fanName}</p>
                  <p className="text-xs text-muted truncate">{tx.label}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-emerald-600">+${tx.amount.toFixed(2)}</p>
                  <p className="text-[11px] text-muted">{tx.date}</p>
                </div>
              </div>
            );
          })}
        </div>
        {visibleCount < EARNINGS_TRANSACTIONS.length && (
          <div className="text-center mt-3 pt-3 border-t border-line/70">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + 4)}
              className="text-xs font-semibold text-brand hover:underline cursor-pointer"
            >
              Load more
            </button>
          </div>
        )}
      </section>

      <Toast message={toast} />
    </div>
  );
}
