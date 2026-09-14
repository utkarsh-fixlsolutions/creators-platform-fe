import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Coins, Crown, Sparkles } from "lucide-react";
import { CREATORS, SUGGESTED_IDS, type Creator } from "../../data";
import { useSubscriptionStore, type SubscriptionItem } from "../../store/subscriptionStore";
import { SubscriptionCard } from "../../components/subscriptions/SubscriptionCard";
import { Sidebar, type NavItem } from "../../components/Sidebar";
import { MobileBottomNav, MobileTopBar } from "../../components/MobileChrome";
import { RightRail } from "../../components/RightRail";
import { Toast } from "../../components/Toast";
import { Reveal } from "../../components/Reveal";

export function SubscriptionsPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const {
    subscriptions,
    filterTab,
    setFilterTab,
    activeCount,
    totalMonthlySpend,
    cancelSubscription,
    renewSubscription,
    tipCreator,
  } = useSubscriptionStore();

  const numActive = activeCount();
  const monthlySpend = totalMonthlySpend();

  const filteredSubs = useMemo(() => {
    return subscriptions.filter((s) =>
      filterTab === "active" ? s.status !== "expired" : s.status === "expired"
    );
  }, [subscriptions, filterTab]);

  const creatorById = useMemo(
    () => Object.fromEntries(CREATORS.map((c) => [c.id, c])) as Record<string, Creator>,
    []
  );

  const suggested = useMemo(
    () => SUGGESTED_IDS.map((id) => creatorById[id]).filter(Boolean),
    [creatorById]
  );

  const handleMessage = (sub: SubscriptionItem) => {
    navigate(`/messages`);
  };

  const handleTip = (sub: SubscriptionItem) => {
    const ok = tipCreator(sub.name, 50);
    if (ok) {
      notify(`Sent 50 Coins tip to ${sub.name}! 🪙✨`);
    } else {
      notify("Insufficient Coins balance. Please top up your wallet.");
    }
  };

  const handleCancel = (id: string) => {
    cancelSubscription(id);
    notify("Subscription cancelled. Access remains until cycle end.");
  };

  const handleRenew = (id: string) => {
    const ok = renewSubscription(id);
    if (ok) {
      notify("Subscription renewed successfully!");
    } else {
      notify("Insufficient Coins balance to renew.");
    }
  };

  const handleSidebarNavigate = (item: NavItem) => {
    if (item.id === "home") {
      navigate("/app");
    } else if (item.id === "messages") {
      navigate("/messages");
    } else if (item.id === "notifications") {
      navigate("/notifications");
    } else if (item.id === "live") {
      navigate("/live");
    } else if (item.id === "subscriptions") {
      // already here
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
      // already here
    } else if (item.id === "profile") {
      notify("Fan Profile & Settings");
    }
  };

  return (
    <div className="page-glow min-h-screen bg-paper text-ink">
      {/* Mobile Sticky Header */}
      <MobileTopBar
        onNotify={notify}
        onNotificationsClick={() => navigate("/notifications")}
      />

      <div className="w-full grid grid-cols-1 md:grid-cols-[80px_minmax(0,1fr)] lg:grid-cols-[272px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,1fr)_356px] 2xl:grid-cols-[272px_minmax(0,1fr)_380px]">
        {/* Left Sidebar */}
        <Sidebar
          activeTab="subscriptions"
          onNavigate={handleSidebarNavigate}
          onCreate={() => notify("The composer opens in the full app")}
          onLogoClick={() => navigate("/")}
        />

        {/* Center Main Workspace */}
        <main className="min-w-0 px-3.5 pb-28 sm:px-6 md:pb-14 lg:px-8">
          <div className="mx-auto w-full max-w-[640px]">
            {/* Mobile Header Title */}
            <div className="flex md:hidden items-center gap-3 pt-4 pb-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Back"
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink-soft hover:bg-paper"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h1 className="font-bold text-[20px] tracking-tight text-ink">
                My Subscriptions
              </h1>
            </div>

            {/* Desktop Page Title */}
            <div className="hidden md:flex items-center justify-between pt-6 pb-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-[26px] tracking-tight text-ink">
                  My Subscriptions
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-gold-soft border border-[#e9d6ab] px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide text-gold-deep">
                  <Crown className="h-3.5 w-3.5" />
                  {numActive} ACTIVE
                </span>
              </div>
            </div>

            {/* Filter Tabs Strip */}
            <div className="sticky top-14 z-20 bg-paper/85 py-3 backdrop-blur-xl md:top-0 md:pt-4">
              <div className="flex gap-1.5 rounded-full border border-line bg-surface p-1 shadow-card">
                <button
                  type="button"
                  onClick={() => setFilterTab("active")}
                  className={`flex-1 rounded-full py-2 text-center text-[13px] transition-all cursor-pointer ${
                    filterTab === "active"
                      ? "bg-ink font-bold text-white shadow-ink"
                      : "font-medium text-muted hover:text-ink"
                  }`}
                >
                  Active ({numActive})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("expired")}
                  className={`flex-1 rounded-full py-2 text-center text-[13px] transition-all cursor-pointer ${
                    filterTab === "expired"
                      ? "bg-ink font-bold text-white shadow-ink"
                      : "font-medium text-muted hover:text-ink"
                  }`}
                >
                  Expired
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="space-y-3.5 pt-1">
              {/* Total Monthly Spend Banner */}
              <Reveal>
                <div className="flex items-center justify-between rounded-[18px] border border-[#e9d6ab] bg-gold-soft p-3 px-3.5 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <Coins className="h-[18px] w-[18px] stroke-[2.2] text-gold-deep" />
                    <span className="text-[12.5px] font-bold text-gold-deep">
                      {monthlySpend} Coins/mo across {numActive} active memberships
                    </span>
                  </div>
                </div>
              </Reveal>

              {/* Subscriptions List */}
              {filteredSubs.length > 0 ? (
                <div className="space-y-3">
                  {filteredSubs.map((sub, idx) => (
                    <Reveal key={sub.id} delay={Math.min(idx, 3) * 60}>
                      <SubscriptionCard
                        subscription={sub}
                        onMessage={handleMessage}
                        onTip={handleTip}
                        onCancel={handleCancel}
                        onRenew={handleRenew}
                      />
                    </Reveal>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <Reveal>
                  <div className="my-8 rounded-[24px] border border-dashed border-line-strong bg-surface p-8 text-center shadow-card">
                    <h3 className="font-bold text-[19px] tracking-tight text-ink">
                      No subscriptions here
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
                      Switch tabs, or explore creators to subscribe to.
                    </p>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </main>

        {/* Right Rail */}
        <RightRail
          suggested={suggested}
          onFollow={(creatorId) => {
            const creator = creatorById[creatorId];
            if (creator) {
              notify(`Following ${creator.name}`);
            }
          }}
          onTagClick={(tag) => notify(`Showing tag: #${tag}`)}
          onNotify={notify}
        />
      </div>

      {/* Mobile Floating Capsule Navigation */}
      <MobileBottomNav
        activeTab="subscriptions"
        onNavigate={handleMobileNav}
      />

      <Toast message={toast} />
    </div>
  );
}
