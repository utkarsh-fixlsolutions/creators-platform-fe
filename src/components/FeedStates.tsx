import { Bell, Coins, MessageCircle, SearchX, Sparkles } from "lucide-react";
import { useWalletStore } from "../store/walletStore";
import { useNotificationStore } from "../store/notificationStore";

/* ---- Page header: Clean screen label with right-aligned utility actions --- */

interface FeedHeaderProps {
  onMessagesClick?: () => void;
  onNotificationsClick?: () => void;
  onWalletClick?: () => void;
}

export function FeedHeader({
  onMessagesClick,
  onNotificationsClick,
  onWalletClick,
}: FeedHeaderProps) {
  const coinsBalance = useWalletStore((s) => s.coinsBalance);
  const unreadNotifications = useNotificationStore((s) => s.unreadCount());

  return (
    <header className="flex items-center justify-between pb-3.5 pt-5 sm:pt-6">
      <h1 className="text-[20px] font-bold tracking-tight text-ink">
        Home
      </h1>

      <div className="flex items-center gap-2.5">
        {/* Wallet Balance Pill */}
        <button
          type="button"
          onClick={onWalletClick}
          aria-label="Wallet balance"
          className="flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-xs font-semibold text-ink shadow-xs transition-all duration-200 hover:border-line-strong hover:bg-paper-deep/50 active:scale-95 cursor-pointer select-none"
        >
          <Coins className="h-3.5 w-3.5 text-muted" />
          <span className="tabular-nums font-semibold text-ink">
            {coinsBalance.toLocaleString()} Coins
          </span>
        </button>

        {/* Messages Shortcut Button */}
        <button
          type="button"
          onClick={onMessagesClick}
          aria-label="Messages"
          className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink-soft shadow-xs transition-all duration-200 hover:border-line-strong hover:bg-paper-deep/50 hover:text-ink active:scale-95 cursor-pointer"
        >
          <MessageCircle className="h-4 w-4 transition-transform group-hover:scale-105" strokeWidth={1.9} />
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9.5px] font-bold tabular-nums text-white ring-2 ring-paper">
            3
          </span>
        </button>

        {/* Notifications Shortcut Button */}
        <button
          type="button"
          onClick={onNotificationsClick}
          aria-label="Notifications"
          className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink-soft shadow-xs transition-all duration-200 hover:border-line-strong hover:bg-paper-deep/50 hover:text-ink active:scale-95 cursor-pointer"
        >
          <Bell className="h-4 w-4 transition-transform group-hover:scale-105" strokeWidth={1.9} />
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9.5px] font-bold tabular-nums text-white ring-2 ring-paper">
            {unreadNotifications > 0 ? unreadNotifications : 6}
          </span>
        </button>
      </div>
    </header>
  );
}

/* ---- Empty state --------------------------------------------------------- */

export function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="animate-fade-up rounded-[28px] border border-dashed border-line-strong bg-surface/60 px-6 py-16 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-paper text-muted">
        <SearchX className="h-6 w-6" strokeWidth={1.8} />
      </span>
      <h2 className="mt-5 font-bold text-[22px] tracking-tight text-ink">Nothing here yet</h2>
      <p className="mx-auto mt-2.5 max-w-[36ch] text-[14px] leading-relaxed text-muted">
        {query
          ? `We couldn't find anything for “${query}”. Try a creator's name, a #tag, or a place.`
          : "There's nothing to show in this feed right now. Check back soon."}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand hover:shadow-brand"
      >
        {query ? "Clear search" : "Back to For you"}
      </button>
    </div>
  );
}

/* ---- End of feed -------------------------------------------------------- */

export function EndOfFeed({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-surface text-brand shadow-card ring-1 ring-line">
        <Sparkles className="h-5 w-5" strokeWidth={1.9} />
      </span>
      <p className="mt-4 font-bold text-[20px] tracking-tight text-ink">You're all caught up</p>
      <p className="mt-2 max-w-[34ch] text-[13.5px] leading-relaxed text-muted">
        You've seen every new post from the last two days. Find someone new to follow?
      </p>
      <button
        type="button"
        onClick={onExplore}
        className="mt-5 inline-flex h-10 items-center rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card"
      >
        Explore trending
      </button>
    </div>
  );
}
