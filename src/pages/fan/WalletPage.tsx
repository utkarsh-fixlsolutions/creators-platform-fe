import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Download,
  Gem,
  Plus,
  ArrowUpRight,
  Crown,
  Heart,
  Lock,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  CreditCard,
  Settings,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Sidebar, type NavItem } from '../../components/Sidebar';
import { MobileBottomNav, MobileTopBar } from '../../components/MobileChrome';
import { Toast } from '../../components/Toast';
import { AddFundsModal } from '../../components/wallet/AddFundsModal';
import { RedeemCodeModal } from '../../components/wallet/RedeemCodeModal';
import {
  AddPaymentMethodModal,
  type SavedPaymentMethod,
} from '../../components/wallet/AddPaymentMethodModal';
import { useWalletStore } from '../../store/walletStore';
import { useSidebarStore } from '../../store/sidebarStore';
import { cn } from '../../utils/cn';

interface SubscriptionItem {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  initial: string;
  bgGradient: string;
  textColor: string;
  renewsDate: string;
  monthlyPrice: number;
}

const INITIAL_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: 'sub_1',
    name: 'Noor Adeyemi',
    handle: '@noorsound',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    initial: 'N',
    bgGradient: 'bg-[#fbe4d8]',
    textColor: 'text-[#b8791c]',
    renewsDate: 'Oct 10',
    monthlyPrice: 12.00,
  },
  {
    id: 'sub_2',
    name: 'Marcus Bell',
    handle: '@marcusfit',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    initial: 'M',
    bgGradient: 'bg-[#e7e5de]',
    textColor: 'text-[#3b3b46]',
    renewsDate: 'Oct 5',
    monthlyPrice: 9.00,
  },
  {
    id: 'sub_3',
    name: 'Priya Nair',
    handle: '@priyastyle',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    initial: 'P',
    bgGradient: 'bg-[#fbf1dc]',
    textColor: 'text-[#b8791c]',
    renewsDate: 'Oct 26',
    monthlyPrice: 7.00,
  },
];

interface WalletTransaction {
  id: string;
  category: 'topup' | 'subscription' | 'tip' | 'unlock';
  title: string;
  description: string;
  date: string;
  amount: number;
  isCredit: boolean;
  status: 'completed' | 'pending';
}

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx_1',
    category: 'topup',
    title: 'Wallet top-up',
    description: 'Visa ···· 4242',
    date: 'Sep 12',
    amount: 50.00,
    isCredit: true,
    status: 'completed',
  },
  {
    id: 'tx_2',
    category: 'subscription',
    title: 'Subscription renewal',
    description: 'Noor Adeyemi',
    date: 'Sep 10',
    amount: 12.00,
    isCredit: false,
    status: 'completed',
  },
  {
    id: 'tx_3',
    category: 'tip',
    title: 'Tip sent',
    description: 'Valentina Ruiz',
    date: 'Sep 9',
    amount: 8.00,
    isCredit: false,
    status: 'completed',
  },
  {
    id: 'tx_4',
    category: 'unlock',
    title: 'Unlocked post',
    description: 'Jade Lin',
    date: 'Sep 7',
    amount: 15.00,
    isCredit: false,
    status: 'completed',
  },
  {
    id: 'tx_5',
    category: 'subscription',
    title: 'Subscription renewal',
    description: 'Marcus Bell',
    date: 'Sep 5',
    amount: 9.00,
    isCredit: false,
    status: 'completed',
  },
  {
    id: 'tx_6',
    category: 'topup',
    title: 'Wallet top-up',
    description: 'Visa ···· 4242',
    date: 'Aug 29',
    amount: 100.00,
    isCredit: true,
    status: 'completed',
  },
  {
    id: 'tx_7',
    category: 'tip',
    title: 'Tip sent',
    description: 'Priya Nair',
    date: 'Aug 26',
    amount: 5.00,
    isCredit: false,
    status: 'completed',
  },
  {
    id: 'tx_8',
    category: 'topup',
    title: 'Wallet top-up',
    description: 'Mastercard ···· 8891',
    date: 'Aug 20',
    amount: 25.00,
    isCredit: true,
    status: 'pending',
  },
];

const INITIAL_PAYMENT_METHODS: SavedPaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'visa',
    label: 'Visa',
    last4: '4242',
    expiry: '09/28',
    isDefault: true,
  },
  {
    id: 'pm_2',
    type: 'mastercard',
    label: 'Mastercard',
    last4: '8891',
    expiry: '03/27',
    isDefault: false,
  },
];

type FilterType = 'all' | 'topup' | 'subscription' | 'tip' | 'unlock';

export function WalletPage() {
  const navigate = useNavigate();
  const isSidebarCollapsed = useSidebarStore((s) => s.isCollapsed);
  const coinsBalance = useWalletStore((s) => s.coinsBalance);

  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>(INITIAL_PAYMENT_METHODS);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [autoReload, setAutoReload] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [visibleTxCount, setVisibleTxCount] = useState(5);

  // Modals
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [addMethodOpen, setAddMethodOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  const dollarEquivalent = useMemo(() => {
    // 10 coins = $1.00 USD
    return (coinsBalance / 10).toFixed(2);
  }, [coinsBalance]);

  const totalMonthlySubs = useMemo(() => {
    return INITIAL_SUBSCRIPTIONS.reduce((acc, sub) => acc + sub.monthlyPrice, 0).toFixed(2);
  }, []);

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'all') return transactions;
    return transactions.filter((t) => t.category === activeFilter);
  }, [transactions, activeFilter]);

  const displayedTransactions = useMemo(() => {
    return filteredTransactions.slice(0, visibleTxCount);
  }, [filteredTransactions, visibleTxCount]);

  const handleSidebarNavigate = (item: NavItem) => {
    if (item.id === 'home') {
      navigate('/app');
    } else if (item.id === 'messages') {
      navigate('/messages');
    } else if (item.id === 'notifications') {
      navigate('/notifications');
    } else if (item.id === 'live') {
      navigate('/live');
    } else if (item.id === 'subscriptions') {
      navigate('/subscriptions');
    } else if (item.id === 'explore' || item.id === 'creators') {
      navigate('/explore');
    } else if (item.id === 'settings' || item.id === 'profile') {
      navigate('/settings');
    } else if (item.id === 'wallet') {
      // Already on wallet
    } else {
      notify(`${item.label} coming soon`);
    }
  };

  const handleAddPaymentMethod = (newMethod: SavedPaymentMethod) => {
    setPaymentMethods((prev) => {
      if (newMethod.isDefault) {
        return [newMethod, ...prev.map((m) => ({ ...m, isDefault: false }))];
      }
      return [...prev, newMethod];
    });
    notify(`Saved ${newMethod.label} ···· ${newMethod.last4}`);
  };

  const handleExportStatement = () => {
    notify('Exporting monthly statement (PDF & CSV downloaded) 📄');
  };

  const handleAutoReloadToggle = () => {
    const nextState = !autoReload;
    setAutoReload(nextState);
    notify(
      nextState
        ? 'Auto-reload enabled: $50 top-up when balance drops below $10'
        : 'Auto-reload disabled'
    );
  };

  return (
    <div className="page-glow min-h-screen bg-paper text-ink">
      {/* Mobile Top Bar */}
      <MobileTopBar
        onNotify={notify}
        onLiveClick={() => navigate('/live')}
        isLiveActive={false}
        onNotificationsClick={() => navigate('/notifications')}
      />

      {/* Main Layout Grid */}
      <div
        className={cn(
          'w-full grid grid-cols-1 md:grid-cols-[80px_minmax(0,1fr)] transition-all duration-300 ease-in-out',
          isSidebarCollapsed
            ? 'lg:grid-cols-[80px_minmax(0,1fr)]'
            : 'lg:grid-cols-[272px_minmax(0,1fr)]'
        )}
      >
        {/* Left Sidebar */}
        <Sidebar
          activeTab="wallet"
          onNavigate={handleSidebarNavigate}
          onCreate={() => notify('Creator post composer')}
          onLogoClick={() => navigate('/')}
        />

        {/* Center Main Content */}
        <main className="min-w-0 px-4 pb-28 pt-4 sm:px-6 md:pb-16 md:pt-6 lg:px-8">
          <div className="mx-auto w-full max-w-[720px] space-y-4">
            
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                Wallet
              </h1>
              <button
                type="button"
                onClick={handleExportStatement}
                className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink shadow-2xs transition-all hover:bg-paper hover:border-line-strong active:scale-95 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-muted" />
                <span>Export statement</span>
              </button>
            </div>

            {/* 1. AVAILABLE BALANCE HERO (Luxury Dark Card #121218) */}
            <section className="relative overflow-hidden rounded-[24px] bg-ink p-6 sm:p-7 text-white shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-white/55">
                    AVAILABLE BALANCE
                  </p>
                  <div className="mt-1 flex items-baseline gap-2.5">
                    <p className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-white">
                      ${dollarEquivalent}
                    </p>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-300/90 bg-white/10 px-2.5 py-0.5 rounded-full">
                      <Gem className="h-3 w-3 text-gold" /> {coinsBalance.toLocaleString()} Coins
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-[13px] text-white/55 leading-relaxed">
                    Used for tips, unlocks &amp; pay-per-view messages
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Wallet className="h-5 w-5" strokeWidth={1.8} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddFundsOpen(true)}
                  className="rounded-full bg-brand px-5 py-2.5 text-xs sm:text-[13.5px] font-bold text-white shadow-pop transition-all hover:bg-brand-deep hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  Add funds
                </button>
                <button
                  type="button"
                  onClick={() => setRedeemOpen(true)}
                  className="rounded-full border border-white/20 bg-transparent px-4.5 py-2.5 text-xs sm:text-[13.5px] font-semibold text-white transition-all hover:bg-white/10 active:scale-95 cursor-pointer"
                >
                  Redeem a code
                </button>
              </div>

              {/* Auto-reload Toggle Row */}
              <div className="mt-5 flex items-center justify-between border-t border-white/12 pt-4">
                <div>
                  <p className="text-xs sm:text-[13px] font-semibold text-white">Auto-reload</p>
                  <p className="text-[11.5px] sm:text-xs text-white/50 mt-0.5">
                    Top up $50 automatically when balance drops below $10
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={autoReload}
                  onClick={handleAutoReloadToggle}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer p-0.5',
                    autoReload ? 'bg-brand' : 'bg-white/20'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                      autoReload ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            </section>

            {/* 2. PAYMENT METHODS CARD */}
            <section className="rounded-[24px] border border-line bg-surface p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[15px] font-bold text-ink">Payment methods</h2>
                <button
                  type="button"
                  onClick={() => setAddMethodOpen(true)}
                  className="text-xs font-semibold text-brand hover:underline cursor-pointer"
                >
                  + Add method
                </button>
              </div>

              <div className="divide-y divide-line/70">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between py-3.5 first:pt-2 last:pb-1"
                  >
                    <div className="flex items-center gap-3">
                      {/* Card Brand Badge */}
                      <span
                        className={cn(
                          'flex h-6.5 w-10 shrink-0 items-center justify-center rounded-md text-[8.5px] font-extrabold tracking-wider text-white',
                          method.type === 'visa' ? 'bg-ink' : 'bg-ink-soft'
                        )}
                      >
                        {method.type === 'visa' ? 'VISA' : 'MC'}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-ink">
                            {method.label} ···· {method.last4}
                          </p>
                          {method.isDefault && (
                            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[11.5px] text-muted">Expires {method.expiry}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => notify(`Managing ${method.label} ···· ${method.last4}`)}
                      className="text-xs font-semibold text-muted hover:text-ink transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. ACTIVE SUBSCRIPTIONS SUMMARY */}
            <section className="rounded-[24px] border border-line bg-surface p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[15px] font-bold text-ink">Active subscriptions</h2>
                <span className="text-xs font-medium text-muted">${totalMonthlySubs}/mo total</span>
              </div>

              <div className="divide-y divide-line/70">
                {INITIAL_SUBSCRIPTIONS.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between py-3.5 first:pt-2 last:pb-1"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ring-line/50',
                          sub.bgGradient,
                          sub.textColor
                        )}
                      >
                        {sub.initial}
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="truncate text-sm font-semibold text-ink">{sub.name}</p>
                        <p className="truncate text-[11.5px] text-muted">Renews {sub.renewsDate}</p>
                      </div>
                    </div>

                    <span className="text-sm font-bold text-ink shrink-0 ml-2">
                      ${sub.monthlyPrice.toFixed(2)}/mo
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-line/70">
                <button
                  type="button"
                  onClick={() => navigate('/subscriptions')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline cursor-pointer"
                >
                  <span>Manage all subscriptions</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </section>

            {/* 4. TRANSACTION HISTORY LEDGER */}
            <section className="rounded-[24px] border border-line bg-surface p-5 sm:p-6 shadow-sm">
              <h2 className="text-[15px] font-bold text-ink mb-3.5">Transaction history</h2>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'topup', label: 'Top-ups' },
                  { id: 'subscription', label: 'Subscriptions' },
                  { id: 'tip', label: 'Tips' },
                  { id: 'unlock', label: 'Unlocks' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id as FilterType)}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer',
                      activeFilter === f.id
                        ? 'bg-ink text-white shadow-2xs'
                        : 'border border-line bg-paper/60 text-muted hover:bg-paper hover:text-ink'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Transaction Rows */}
              <div className="divide-y divide-line/70 mt-2">
                {displayedTransactions.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted">No transactions in this filter.</p>
                ) : (
                  displayedTransactions.map((tx) => {
                    const isCredit = tx.isCredit;

                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 py-3.5 first:pt-2 last:pb-1"
                      >
                        {/* Transaction Icon */}
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                            tx.category === 'topup' && 'bg-emerald-50 text-emerald-600',
                            tx.category === 'subscription' && 'bg-brand/10 text-brand',
                            tx.category === 'tip' && 'bg-rose/10 text-rose',
                            tx.category === 'unlock' && 'bg-amber-50 text-gold'
                          )}
                        >
                          {tx.category === 'topup' && <ArrowUpRight className="h-4 w-4 stroke-[2.2]" />}
                          {tx.category === 'subscription' && <Crown className="h-4 w-4" />}
                          {tx.category === 'tip' && <Heart className="h-4 w-4 fill-current" />}
                          {tx.category === 'unlock' && <Lock className="h-4 w-4" />}
                        </div>

                        {/* Title & Date */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">{tx.title}</p>
                          <p className="text-xs text-muted truncate">
                            {tx.description} · {tx.date}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-[10.5px] font-bold shrink-0 hidden sm:inline-block',
                            tx.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          )}
                        >
                          {tx.status === 'completed' ? 'Completed' : 'Pending'}
                        </span>

                        {/* Amount */}
                        <span
                          className={cn(
                            'text-sm font-bold shrink-0 text-right w-20',
                            isCredit ? 'text-emerald-600' : 'text-ink'
                          )}
                        >
                          {isCredit ? `+$${tx.amount.toFixed(2)}` : `-$${tx.amount.toFixed(2)}`}
                        </span>

                        {/* Receipt Button */}
                        <button
                          type="button"
                          onClick={() => notify(`Receipt downloaded for ${tx.title} (${tx.id})`)}
                          title="Download receipt"
                          className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-muted hover:text-ink hover:bg-paper transition-colors cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Load More Button */}
              {filteredTransactions.length > visibleTxCount && (
                <div className="text-center mt-3 pt-3 border-t border-line/70">
                  <button
                    type="button"
                    onClick={() => setVisibleTxCount((c) => c + 5)}
                    className="text-xs font-semibold text-brand hover:underline cursor-pointer"
                  >
                    Load more transactions
                  </button>
                </div>
              )}
            </section>

          </div>
        </main>
      </div>

      {/* Mobile Floating Bottom Navigation Notch */}
      <MobileBottomNav
        activeTab="wallet"
        onNavigate={handleSidebarNavigate}
        onCreate={() => notify('Drop composer')}
      />

      {/* Interactive Modals */}
      <AddFundsModal
        open={addFundsOpen}
        onClose={() => setAddFundsOpen(false)}
        onSuccess={(coins, amount) => {
          notify(`Added ${coins.toLocaleString()} Coins ($${amount.toFixed(2)}) to your wallet! 💎`);
        }}
      />

      <RedeemCodeModal
        open={redeemOpen}
        onClose={() => setRedeemOpen(false)}
        onSuccess={(coins, code) => {
          notify(`Redeemed code ${code} for +${coins} coins! 🎉`);
        }}
      />

      <AddPaymentMethodModal
        open={addMethodOpen}
        onClose={() => setAddMethodOpen(false)}
        onAdd={handleAddPaymentMethod}
      />

      {/* Toast Alert */}
      <Toast message={toast} />
    </div>
  );
}
