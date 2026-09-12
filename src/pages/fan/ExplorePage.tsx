import { useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SearchX, X } from "lucide-react";
import { Sidebar, type NavItem } from "../../components/Sidebar";
import { MobileBottomNav, MobileTopBar } from "../../components/MobileChrome";
import { RightRail } from "../../components/RightRail";
import { Toast } from "../../components/Toast";
import { Reveal } from "../../components/Reveal";
import { CategoryPills } from "../../components/explore/CategoryPills";
import { CreatorMasonryCard } from "../../components/explore/CreatorMasonryCard";
import {
  INITIAL_EXPLORE_CREATORS,
  type ExploreCreator,
} from "../../data/exploreData";
import { CREATORS, SUGGESTED_IDS } from "../../data";

export function ExplorePage() {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<ExploreCreator[]>(INITIAL_EXPLORE_CREATORS);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const creatorById = useMemo(
    () => Object.fromEntries(CREATORS.map((c) => [c.id, c])),
    []
  );

  const suggested = useMemo(
    () => SUGGESTED_IDS.map((id) => creatorById[id]).filter(Boolean),
    [creatorById]
  );

  // Toggle follow state
  const handleToggleFollow = (id: string) => {
    setCreators((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.following;
          notify(nextState ? `Following ${c.name}` : `Unfollowed ${c.name}`);
          return {
            ...c,
            following: nextState,
            fans: nextState ? c.fans + 1 : Math.max(0, c.fans - 1),
          };
        }
        return c;
      })
    );
  };

  // Filter creators based on category & search query
  const filteredCreators = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return creators.filter((c) => {
      const matchesCategory =
        activeCategory === "All" ||
        c.category.toLowerCase() === activeCategory.toLowerCase();

      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [creators, activeCategory, searchQuery]);

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
      navigate("/subscriptions");
    } else if (item.id === "explore" || item.id === "creators") {
      // already on explore
    } else if (item.tab) {
      navigate("/app");
    } else {
      notify(`${item.label} is coming soon`);
    }
  };

  const handleMobileNav = (item: NavItem) => {
    if (item.id === "home") {
      navigate("/app");
    } else if (item.id === "messages") {
      navigate("/messages");
    } else if (item.id === "subscriptions") {
      navigate("/subscriptions");
    } else if (item.id === "explore") {
      // already here
    } else if (item.id === "profile") {
      notify("Fan Profile & Settings");
    }
  };

  return (
    <div className="page-glow min-h-screen bg-paper text-ink">
      {/* Mobile Top Bar */}
      <MobileTopBar
        onNotify={notify}
        onLiveClick={() => navigate("/live")}
        isLiveActive={false}
        onNotificationsClick={() => navigate("/notifications")}
      />

      {/* Full-width responsive 3-column layout */}
      <div className="w-full grid grid-cols-1 md:grid-cols-[80px_minmax(0,1fr)] lg:grid-cols-[272px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,1fr)_356px] 2xl:grid-cols-[272px_minmax(0,1fr)_380px]">
        {/* Left Sidebar */}
        <Sidebar
          activeTab="explore"
          onNavigate={handleSidebarNavigate}
          onCreate={() => notify("The composer opens in the full app")}
          onLogoClick={() => navigate("/")}
        />

        {/* Center Discovery Workspace */}
        <main className="min-w-0 px-3.5 pb-28 sm:px-6 md:pb-14 lg:px-8">
          <div className="mx-auto w-full max-w-[1020px]">
            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between gap-6 pt-6 pb-4">
              <div>
                <h1 className="font-display text-[32px] sm:text-[36px] tracking-[-0.015em] text-ink leading-tight">
                  Discover creators
                </h1>
                <p className="mt-1 text-[13px] text-muted">
                  {filteredCreators.length}{" "}
                  {filteredCreators.length === 1 ? "creator" : "creators"} across every category
                </p>
              </div>

              {/* Desktop Pill Search Bar */}
              <div className="relative flex w-[280px] lg:w-[320px] items-center rounded-full border border-line bg-surface px-3.5 py-2 shadow-xs transition-colors focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/20">
                <Search className="h-4 w-4 shrink-0 text-muted" strokeWidth={2.2} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search creators & tags…"
                  className="ml-2 w-full bg-transparent text-[13px] text-ink placeholder:text-muted outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="grid h-5 w-5 place-items-center rounded-full text-muted hover:text-ink cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Header Title + Full-Width Search Input */}
            <div className="flex md:hidden flex-col gap-2.5 pt-4 pb-2">
              <h1 className="font-display text-[26px] tracking-tight text-ink">
                Creators
              </h1>
              <div className="relative flex w-full items-center rounded-full border border-line bg-surface px-3.5 py-2 shadow-xs focus-within:border-brand/60">
                <Search className="h-4 w-4 shrink-0 text-muted" strokeWidth={2.2} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search creators & tags…"
                  className="ml-2 w-full bg-transparent text-[13px] text-ink placeholder:text-muted outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="grid h-5 w-5 place-items-center rounded-full text-muted hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills (Sticky Strip) */}
            <div className="sticky top-14 z-20 bg-paper/85 py-2.5 backdrop-blur-xl md:top-0 md:pt-2">
              <CategoryPills
                activeCategory={activeCategory}
                onSelect={setActiveCategory}
              />
            </div>

            {/* Visual Masonry Discovery Grid */}
            <div className="pt-2">
              {filteredCreators.length === 0 ? (
                /* Empty State */
                <Reveal>
                  <div className="my-8 rounded-[24px] border border-dashed border-line-strong bg-surface p-8 text-center shadow-card">
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-paper text-muted">
                      <SearchX className="h-6 w-6" strokeWidth={1.8} />
                    </span>
                    <h2 className="mt-4 font-display text-[22px] text-ink">
                      No creators match
                    </h2>
                    <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
                      {searchQuery
                        ? `We couldn't find creators matching "${searchQuery}". Try another name, category, or tag.`
                        : "No creators found in this category. Switch categories to explore more creators."}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory("All");
                        setSearchQuery("");
                      }}
                      className="mt-5 inline-flex rounded-full bg-ink px-6 py-2.5 text-[12.5px] font-bold text-white shadow-xs hover:bg-black active:scale-95 transition-all cursor-pointer"
                    >
                      Reset filters
                    </button>
                  </div>
                </Reveal>
              ) : (
                /* Multi-column Masonry Layout */
                <div className="columns-2 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-3 2xl:columns-4 gap-3.5 space-y-3.5">
                  {filteredCreators.map((creator, index) => (
                    <Reveal key={creator.id} delay={Math.min(index, 6) * 50}>
                      <CreatorMasonryCard
                        creator={creator}
                        onToggleFollow={handleToggleFollow}
                        onSelectCreator={(c) => {
                          notify(`Viewing ${c.name}'s portfolio profile`);
                        }}
                      />
                    </Reveal>
                  ))}
                </div>
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
              handleToggleFollow(creatorId);
            }
          }}
          onTagClick={(tag) => {
            setSearchQuery(tag);
            notify(`Filtering creators by #${tag}`);
          }}
          onNotify={notify}
        />
      </div>

      {/* Mobile Floating Capsule Navigation */}
      <MobileBottomNav activeTab="explore" onNavigate={handleMobileNav} />

      {/* Toast Notification */}
      <Toast message={toast} />
    </div>
  );
}
