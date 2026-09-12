import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, CheckCheck, ChevronRight, SlidersHorizontal, Sparkles } from "lucide-react";
import { useNotificationStore } from "../../store/notificationStore";
import { useCreatorStore } from "../../store/creatorStore";
import { NotificationRow } from "../../components/notifications/NotificationRow";
import { NotificationTabs, type NotificationTab } from "../../components/notifications/NotificationTabs";
import { Sidebar, type NavItem } from "../../components/Sidebar";
import { MobileBottomNav, MobileTopBar } from "../../components/MobileChrome";
import { RightRail } from "../../components/RightRail";
import { Toast } from "../../components/Toast";
import { CREATORS, SUGGESTED_IDS, type Creator, type NotificationItem } from "../../data";

export function NotificationsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<NotificationTab>("all");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const { items, unreadCount, toggleRead, dismiss, markAllRead } =
    useNotificationStore();

  const totalUnread = unreadCount();

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (tab === "all") return true;
      return item.cat.includes(tab);
    });
  }, [items, tab]);

  const todayItems = useMemo(
    () => filteredItems.filter((i) => i.day === "today"),
    [filteredItems]
  );
  const earlierItems = useMemo(
    () => filteredItems.filter((i) => i.day === "earlier"),
    [filteredItems]
  );

  const creatorById = useMemo(
    () => Object.fromEntries(CREATORS.map((c) => [c.id, c])) as Record<string, Creator>,
    []
  );

  const suggested = useMemo(
    () => SUGGESTED_IDS.map((id) => creatorById[id]).filter(Boolean),
    [creatorById]
  );

  const handleAction = (item: NotificationItem) => {
    if (item.kind === "message") {
      navigate("/messages");
    } else if (item.kind === "live") {
      navigate("/app");
    } else if (item.action) {
      notify(`${item.action}: ${item.name}`);
    }
  };

  const handleSidebarNavigate = (item: NavItem) => {
    if (item.id === "home") {
      navigate("/app");
    } else if (item.id === "messages") {
      navigate("/messages");
    } else if (item.id === "notifications") {
      // already here
    } else if (item.id === "live") {
      navigate("/live");
    } else if (item.id === "subscriptions") {
      navigate("/subscriptions");
    } else if (item.id === "explore" || item.id === "creators") {
      navigate("/explore");
    } else if (item.tab) {
      navigate("/app");
    } else {
      notify(`${item.label} is coming soon`);
    }
  };

  const handleMobileNav = (item: NavItem) => {
    if (item.id === "home") {
      navigate("/app");
    } else if (item.id === "explore") {
      navigate("/explore");
    } else if (item.id === "messages") {
      navigate("/messages");
    } else if (item.id === "subscriptions") {
      navigate("/subscriptions");
    } else if (item.id === "profile") {
      notify("Fan Profile & Wallet settings");
    }
  };

  return (
    <div className="page-glow min-h-screen bg-paper text-ink">
      <MobileTopBar onNotify={notify} />

      <div className="w-full grid grid-cols-1 md:grid-cols-[80px_minmax(0,1fr)] lg:grid-cols-[272px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,1fr)_356px] 2xl:grid-cols-[272px_minmax(0,1fr)_380px]">
        {/* Left Sidebar */}
        <Sidebar
          activeTab="notifications"
          onNavigate={handleSidebarNavigate}
          onCreate={() => notify("The composer opens in the full app")}
          onLogoClick={() => navigate("/")}
        />

        {/* Center Main Area */}
        <main className="min-w-0 px-3.5 pb-28 sm:px-6 md:pb-14 lg:px-8">
          <div className="mx-auto w-full max-w-[640px]">
            {/* Header matching 1a spec */}
            <header className="pb-2 pt-5 sm:pt-8 md:pb-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    aria-label="Back"
                    className="grid h-[34px] w-[34px] place-items-center rounded-full border border-line bg-surface text-ink-soft hover:bg-paper-warm hover:text-ink md:hidden transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
                  </button>

                  <h1 className="font-display text-[26px] sm:text-[34px] font-bold tracking-tight text-ink">
                    Notifications
                  </h1>

                  {totalUnread > 0 && (
                    <span className="inline-grid place-items-center h-5 min-w-[20px] px-1.5 rounded-full bg-brand text-white text-[11px] font-bold shadow-sm">
                      {totalUnread}
                    </span>
                  )}
                </div>

                {/* Header Action buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      markAllRead();
                      notify("All notifications marked as read");
                    }}
                    title="Mark all as read"
                    className="grid h-[34px] w-[34px] place-items-center rounded-full border border-line bg-surface text-ink-soft hover:bg-paper-warm hover:text-ink transition-colors cursor-pointer select-none"
                  >
                    <CheckCheck className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => notify("Notification settings")}
                    title="Notification settings"
                    className="grid h-[34px] w-[34px] place-items-center rounded-full border border-line bg-surface text-ink-soft hover:bg-paper-warm hover:text-ink transition-colors cursor-pointer select-none"
                  >
                    <SlidersHorizontal className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </header>

            {/* Mobile Prominent Become a Creator Promo Banner Card */}
            <div className="pt-2 pb-1 md:hidden">
              <button
                type="button"
                onClick={() => useCreatorStore.getState().openModal()}
                className="flex w-full items-center gap-3 rounded-2xl bg-ink p-3 text-left text-white shadow-card transition-all duration-200 active:scale-[0.98] cursor-pointer select-none"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 text-white">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-bold tracking-[-0.01em]">
                    Become a Creator
                  </span>
                  <span className="block text-[11.5px] text-white/60">
                    Earn from subscriptions, tips &amp; live shows
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-white/40 shrink-0" />
              </button>
            </div>

            {/* Filter Pill Tabs */}
            <div className="sticky top-14 z-20 bg-paper/85 py-2.5 backdrop-blur-xl md:top-0 md:pt-4">
              <NotificationTabs
                active={tab}
                onChange={setTab}
                variant="mobile"
              />
            </div>

            {/* Notifications Feed */}
            <section
              role="region"
              aria-label="Notifications List"
              className="pt-2 space-y-5"
            >
              {filteredItems.length === 0 ? (
                /* Empty state matching 1a spec */
                <div className="my-10 mx-1 p-8 text-center rounded-3xl border border-dashed border-line-strong bg-surface">
                  <span className="inline-grid place-items-center h-[52px] w-[52px] rounded-full bg-paper border border-line text-muted mx-auto">
                    <Bell className="h-6 w-6" strokeWidth={1.9} />
                  </span>
                  <h3 className="font-display text-[21px] font-bold text-ink mt-3.5">
                    You're all caught up
                  </h3>
                  <p className="text-[13px] text-muted mt-1.5 max-w-sm mx-auto leading-relaxed">
                    Nothing new in this filter. New drops, tips and replies land here first.
                  </p>
                </div>
              ) : (
                <>
                  {/* TODAY Group */}
                  {todayItems.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-2 py-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/40">
                          Today
                        </span>
                        <span className="text-[11.5px] font-semibold text-faint">
                          {todayItems.length} {todayItems.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        {todayItems.map((item) => (
                          <NotificationRow
                            key={item.id}
                            item={item}
                            onToggleRead={toggleRead}
                            onDismiss={dismiss}
                            onAction={handleAction}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EARLIER Group */}
                  {earlierItems.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-2 py-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/40">
                          Earlier
                        </span>
                        <span className="text-[11.5px] font-semibold text-faint">
                          {earlierItems.length} {earlierItems.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        {earlierItems.map((item) => (
                          <NotificationRow
                            key={item.id}
                            item={item}
                            onToggleRead={toggleRead}
                            onDismiss={dismiss}
                            onAction={handleAction}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-center py-6 text-xs text-faint">
                    Notifications older than 30 days are cleared automatically
                  </div>
                </>
              )}
            </section>
          </div>
        </main>

        {/* Right Rail */}
        <RightRail
          suggested={suggested}
          onFollow={(id) => notify(`Followed ${creatorById[id]?.name || "creator"}`)}
          onTagClick={(t) => notify(`Search tag #${t}`)}
          onNotify={notify}
        />
      </div>

      <MobileBottomNav
        activeTab="notifications"
        onNavigate={handleMobileNav}
        onCreate={() => notify("The composer opens in the full app")}
      />

      <Toast message={toast} />
    </div>
  );
}
