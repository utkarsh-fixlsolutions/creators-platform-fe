import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CREATORS, SUGGESTED_IDS, type Creator, type LiveRoom } from "../../data";
import { LIVE_TAB_LABELS, LiveFilterTabs } from "../../components/live/LiveFilterTabs";
import { LiveFeaturedCard } from "../../components/live/LiveFeaturedCard";
import { LiveRoomCard } from "../../components/live/LiveRoomCard";
import { StartingSoonRow } from "../../components/live/StartingSoonRow";
import { Reveal } from "../../components/Reveal";
import { Sidebar, type NavItem } from "../../components/Sidebar";
import { MobileBottomNav, MobileTopBar } from "../../components/MobileChrome";
import { RightRail } from "../../components/RightRail";
import { Toast } from "../../components/Toast";
import { useLiveStore, type LiveFilterTab } from "../../store/liveStore";

export function LiveNowPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const {
    rooms,
    featuredRoom,
    filterTab,
    setFilterTab,
    setActiveRoom,
  } = useLiveStore();

  const filteredRooms = useMemo(() => {
    if (filterTab === "all") return rooms;
    return rooms.filter((r) => r.cats.includes(filterTab));
  }, [rooms, filterTab]);

  const creatorById = useMemo(
    () => Object.fromEntries(CREATORS.map((c) => [c.id, c])) as Record<string, Creator>,
    []
  );

  const suggested = useMemo(
    () => SUGGESTED_IDS.map((id) => creatorById[id]).filter(Boolean),
    [creatorById]
  );

  const handleWatch = (room: LiveRoom) => {
    setActiveRoom(room);
    navigate(`/live/${room.creatorId}`);
  };

  const handleSidebarNavigate = (item: NavItem) => {
    if (item.id === "home") {
      navigate("/app");
    } else if (item.id === "messages") {
      navigate("/messages");
    } else if (item.id === "notifications") {
      navigate("/notifications");
    } else if (item.id === "live") {
      // already on /live
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
      notify("Fan Profile & Settings");
    }
  };

  const browseLabel = LIVE_TAB_LABELS[filterTab] || "Everyone live";
  const countLabel = `${filteredRooms.length} ${filteredRooms.length === 1 ? "room" : "rooms"}`;

  return (
    <div className="page-glow min-h-screen bg-paper text-ink">
      {/* Mobile Sticky Header */}
      <MobileTopBar
        onNotify={notify}
        onLiveClick={() => {}}
        isLiveActive={true}
        onNotificationsClick={() => navigate("/notifications")}
      />

      <div className="w-full grid grid-cols-1 md:grid-cols-[80px_minmax(0,1fr)] lg:grid-cols-[272px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,1fr)_356px] 2xl:grid-cols-[272px_minmax(0,1fr)_380px]">
        {/* Left Sidebar */}
        <Sidebar
          activeTab="live"
          onNavigate={handleSidebarNavigate}
          onCreate={() => notify("The composer opens in the full app")}
          onLogoClick={() => navigate("/")}
        />

        {/* Center Live Browse Column */}
        <main className="min-w-0 px-3.5 pb-28 sm:px-6 md:pb-14 lg:px-8">
          <div className="mx-auto w-full max-w-[640px]">
            {/* Desktop Page Title */}
            <div className="hidden md:flex items-center justify-between pt-6 pb-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-[26px] tracking-tight text-ink">
                  Live now
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-rose px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  {rooms.length + 1} LIVE
                </span>
              </div>
            </div>

            {/* Filter Tabs Strip */}
            <div className="sticky top-14 z-20 bg-paper/85 py-3 backdrop-blur-xl md:top-0 md:pt-4">
              <LiveFilterTabs active={filterTab} onChange={setFilterTab} />
            </div>

            {/* Content Area */}
            <div className="space-y-4 pt-1">
              {/* Hero Featured Live Room (Theo Marchetti) */}
              {(filterTab === "all" || featuredRoom.cats.includes(filterTab)) && (
                <Reveal>
                  <LiveFeaturedCard room={featuredRoom} onWatch={handleWatch} />
                </Reveal>
              )}

              {/* Section Header */}
              <div className="flex items-center justify-between px-1 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/40">
                  {browseLabel}
                </span>
                <span className="text-[11.5px] font-semibold text-faint">
                  {countLabel}
                </span>
              </div>

              {/* 2-up / 3-up Room Grid */}
              {filteredRooms.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                  {filteredRooms.map((room, idx) => (
                    <Reveal key={room.id} delay={Math.min(idx, 3) * 60}>
                      <LiveRoomCard room={room} onSelect={handleWatch} />
                    </Reveal>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <Reveal>
                  <div className="my-6 rounded-[24px] border border-dashed border-line-strong bg-surface p-8 text-center shadow-card">
                    <h3 className="font-bold text-[19px] tracking-tight text-ink">
                      No one&apos;s live in this filter
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
                      Turn on Notify me and we&apos;ll ping you the moment they start.
                    </p>
                  </div>
                </Reveal>
              )}

              {/* Starting Soon Scheduled Row */}
              <Reveal delay={120}>
                <StartingSoonRow onNotify={notify} />
              </Reveal>
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
          onTagClick={(tag) => notify(`Showing live tag: #${tag}`)}
          onNotify={notify}
        />
      </div>

      {/* Mobile Floating Capsule Navigation */}
      <MobileBottomNav
        activeTab="live"
        onNavigate={handleMobileNav}
        onCreate={() => notify("Live broadcast creation is available for creators")}
      />

      <Toast message={toast} />
    </div>
  );
}
