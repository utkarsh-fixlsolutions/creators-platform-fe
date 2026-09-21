import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CREATORS, POSTS, SUGGESTED_IDS, type Creator, type FeedTab, type Post } from "../../data";
import { FeedTabs } from "../../components/FeedTabs";
import { EmptyState, EndOfFeed, FeedHeader } from "../../components/FeedStates";
import { MobileBottomNav, MobileTopBar } from "../../components/MobileChrome";
import { PostCard } from "../../components/PostCard";
import { Reveal } from "../../components/Reveal";
import { RightRail } from "../../components/RightRail";
import { Sidebar, type NavItem } from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useWalletStore } from "../../store/walletStore";
import { useSidebarStore } from "../../store/sidebarStore";
import { cn } from "../../utils/cn";
import { Toast } from "../../components/Toast";

export function FanHomePage() {
  const navigate = useNavigate();
  const isSidebarCollapsed = useSidebarStore((s) => s.isCollapsed);
  const [creators, setCreators] = useState<Creator[]>(CREATORS);
  const [posts, setPosts] = useState<Post[]>(POSTS);
  const [tab, setTab] = useState<FeedTab>("foryou");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const feedTopRef = useRef<HTMLDivElement>(null);

  /* ---- helpers ---------------------------------------------------------- */

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const creatorById = useMemo(
    () => Object.fromEntries(creators.map((c) => [c.id, c])) as Record<string, Creator>,
    [creators],
  );

  const scrollToFeedTop = useCallback(() => {
    const el = feedTopRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 8;
    if (window.scrollY > top) window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const changeTab = useCallback(
    (next: FeedTab) => {
      setTab(next);
      if (next !== "search") setQuery("");
      scrollToFeedTop();
    },
    [scrollToFeedTop],
  );

  /* ---- interactions ----------------------------------------------------- */

  const toggleLike = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p,
      ),
    );
  }, []);

  const toggleFollow = useCallback(
    (creatorId: string) => {
      const creator = creatorById[creatorId];
      if (!creator) return;
      setCreators((prev) =>
        prev.map((c) => (c.id === creatorId ? { ...c, following: !c.following } : c)),
      );
      notify(
        creator.following
          ? `Unfollowed ${creator.name}`
          : `You're now following ${creator.name}`,
      );
    },
    [creatorById, notify],
  );

  const unlockPost = useCallback(
    (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      const creator = creatorById[post.creatorId];
      setPosts((prev) =>
        prev.map((p) => (p.creatorId === post.creatorId ? { ...p, unlocked: true } : p)),
      );
      setCreators((prev) =>
        prev.map((c) => (c.id === post.creatorId ? { ...c, following: true } : c)),
      );
      notify(`Welcome to ${creator.name.split(" ")[0]}'s studio — archive unlocked`);
    },
    [posts, creatorById, notify],
  );

  const sharePost = useCallback(
    async (post: Post) => {
      const creator = creatorById[post.creatorId];
      const url = `${window.location.origin}/@${creator.handle}/${post.id}`;
      try {
        if (navigator.share) {
          await navigator.share({ title: `${creator.name} on Creators`, url });
          return;
        }
        await navigator.clipboard.writeText(url);
        notify("Link copied to clipboard");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        notify("Link ready to share");
      }
    },
    [creatorById, notify],
  );

  const searchTag = useCallback(
    (tag: string) => {
      setTab("search");
      setQuery(`#${tag}`);
      scrollToFeedTop();
    },
    [scrollToFeedTop],
  );

  const handleNavigate = useCallback(
    (item: NavItem) => {
      if (item.id === "messages") {
        navigate("/messages");
      } else if (item.id === "notifications") {
        navigate("/notifications");
      } else if (item.id === "live") {
        navigate("/live");
      } else if (item.id === "subscriptions") {
        navigate("/subscriptions");
      } else if (item.id === "explore" || item.id === "creators") {
        navigate("/explore");
      } else if (item.id === "settings" || item.id === "profile") {
        navigate("/settings");
      } else if (item.id === "wallet") {
        navigate("/wallet");
      } else if (item.id === "home") {
      } else if (item.tab) {
        changeTab(item.tab);
      } else {
        notify(`${item.label} is coming soon in this preview`);
      }
    },
    [changeTab, navigate, notify],
  );

  const handleCreate = useCallback(() => notify("The composer opens in the full app"), [notify]);

  /* ---- keyboard: "/" focuses search ------------------------------------- */

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        changeTab("search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [changeTab]);

  /* ---- derived feed ----------------------------------------------------- */

  const visiblePosts = useMemo(() => {
    switch (tab) {
      case "following":
        return posts.filter((p) => creatorById[p.creatorId]?.following);
      case "exclusive":
        return posts.filter((p) => p.exclusive);
      case "live":
        return posts.filter((p) => p.live);
      case "trending":
        return [...posts].sort((a, b) => b.likes - a.likes);
      case "collections":
        return posts.filter((p) => p.collection);
      case "search": {
        const q = query.trim().toLowerCase().replace(/^#/, "");
        if (!q) return posts;
        return posts.filter((p) => {
          const c = creatorById[p.creatorId];
          const haystack = [
            c?.name,
            c?.handle,
            c?.category,
            p.caption,
            p.collection,
            p.location,
            ...p.tags.map((t) => `#${t}`),
            ...p.tags,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        });
      }
      default:
        return posts;
    }
  }, [tab, posts, query, creatorById]);

  const suggested = useMemo(
    () => SUGGESTED_IDS.map((id) => creatorById[id]).filter(Boolean),
    [creatorById],
  );

  const feedKey = tab;

  /* ---- render ----------------------------------------------------------- */

  return (
    <div id="top" className="page-glow min-h-screen bg-paper text-ink">
      <MobileTopBar
        onNotify={notify}
        onLiveClick={() => navigate("/live")}
        isLiveActive={false}
        onNotificationsClick={() => navigate("/notifications")}
      />

      <div
        className={cn(
          "w-full grid grid-cols-1 md:grid-cols-[80px_minmax(0,1fr)] transition-all duration-300 ease-in-out",
          isSidebarCollapsed
            ? "lg:grid-cols-[80px_minmax(0,1fr)] xl:grid-cols-[80px_minmax(0,1fr)_356px] 2xl:grid-cols-[80px_minmax(0,1fr)_380px]"
            : "lg:grid-cols-[272px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,1fr)_356px] 2xl:grid-cols-[272px_minmax(0,1fr)_380px]",
        )}
      >
        
        {/* Left Sidebar */}
        <Sidebar
          activeTab={tab}
          onNavigate={handleNavigate}
          onCreate={handleCreate}
          onLogoClick={() => navigate('/')}
        />

        {/* Center Main Feed */}
        <main className="min-w-0 px-4 pb-28 sm:px-6 md:pb-14 lg:px-8">
          <div className="mx-auto w-full max-w-[640px]">
            {/* Desktop-only Feed Header (hidden on mobile to eliminate repetitive notification/messages/coins) */}
            <div className="hidden md:block">
              <FeedHeader
                onMessagesClick={() => navigate("/messages")}
                onNotificationsClick={() => navigate("/notifications")}
                onWalletClick={() => navigate("/wallet")}
              />
            </div>

            {/* Desktop-only Sticky tab pill (hidden on mobile since bottom navigation notch provides tabs) */}
            <div
              ref={feedTopRef}
              className="hidden md:block sticky top-0 z-20 bg-paper/85 py-3 md:pt-5 backdrop-blur-xl"
            >
              <FeedTabs active={tab} onChange={changeTab} query={query} onQueryChange={setQuery} />
            </div>

            {/* Feed */}
            <section
              id="feed-panel"
              role="tabpanel"
              aria-labelledby={`tab-${tab}`}
              aria-live="polite"
              className="pt-3.5 sm:pt-4 md:pt-3"
            >
              {visiblePosts.length === 0 ? (
                <EmptyState
                  query={tab === "search" ? query : ""}
                  onReset={() => (tab === "search" ? setQuery("") : changeTab("foryou"))}
                />
              ) : (
                <div key={feedKey} className="space-y-5">
                  {visiblePosts.map((post, index) => (
                    <Reveal key={post.id} delay={Math.min(index, 3) * 70}>
                      <PostCard
                        post={post}
                        creator={creatorById[post.creatorId]}
                        onLike={toggleLike}
                        onFollow={toggleFollow}
                        onShare={sharePost}
                        onUnlock={unlockPost}
                        onTagClick={searchTag}
                        onNotify={notify}
                      />
                    </Reveal>
                  ))}
                  <Reveal>
                    <EndOfFeed onExplore={() => changeTab("trending")} />
                  </Reveal>
                </div>
              )}
            </section>
          </div>
        </main>

        {/* Right Rail */}
        <RightRail
          suggested={suggested}
          onFollow={toggleFollow}
          onTagClick={searchTag}
          onNotify={notify}
        />
      </div>

      <MobileBottomNav activeTab={tab} onNavigate={handleNavigate} onCreate={handleCreate} />
      <Toast message={toast} />
    </div>
  );
}
