import { Crown, Flame, LayoutGrid, Radio, SearchX, Sparkles } from "lucide-react";
import type { FeedTab } from "../data";
import { ME } from "../data";
import { greeting } from "../utils/format";

/* ---- Page header ------------------------------------------------------- */

export function FeedHeader({ newPosts }: { newPosts: number }) {
  return (
    <header className="pb-3 pt-6 sm:pt-10 md:pb-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
        {greeting()}, {ME.name.split(" ")[0]}
      </p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <h1 className="font-display text-[46px] leading-[0.95] tracking-[-0.015em] text-ink sm:text-[60px]">
          Discovery <em className="text-brand">feed</em>
        </h1>
        <p className="hidden shrink-0 items-center gap-2 pb-2 text-[13px] text-muted sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
          </span>
          {newPosts} new since your last visit
        </p>
      </div>
      <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-muted">
        New work from the creators you follow — and the ones you're about to.
      </p>
    </header>
  );
}

/* ---- Contextual intro strip for secondary feeds ------------------------ */

const INTROS: Partial<Record<FeedTab, { icon: typeof Crown; title: string; body: string; tone: string }>> = {
  exclusive: {
    icon: Crown,
    title: "Members‑only drops",
    body: "Early access, full archives and behind‑the‑scenes from creators you support.",
    tone: "bg-gold-soft text-gold-deep",
  },
  live: {
    icon: Radio,
    title: "Live right now",
    body: "Jump into a stream while it's happening. Replays land in Collections afterwards.",
    tone: "bg-rose-soft text-live",
  },
  trending: {
    icon: Flame,
    title: "Trending in the last 24 hours",
    body: "Ranked by likes, comments and shares across the whole platform.",
    tone: "bg-brand-soft text-brand",
  },
  collections: {
    icon: LayoutGrid,
    title: "Collections",
    body: "Series, lesson packs and archives — curated by the creators themselves.",
    tone: "bg-paper-deep text-ink",
  },
};

export function TabIntro({ tab }: { tab: FeedTab }) {
  const intro = INTROS[tab];
  if (!intro) return null;
  return (
    <div className="mb-5 flex animate-fade-up items-start gap-3.5 rounded-2xl border border-line bg-surface px-4 py-3.5 shadow-card">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${intro.tone}`}>
        <intro.icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold tracking-[-0.01em]">{intro.title}</p>
        <p className="text-[13px] leading-relaxed text-muted">{intro.body}</p>
      </div>
    </div>
  );
}

/* ---- Empty state --------------------------------------------------------- */

export function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="animate-fade-up rounded-[28px] border border-dashed border-line-strong bg-surface/60 px-6 py-16 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-paper text-muted">
        <SearchX className="h-6 w-6" strokeWidth={1.8} />
      </span>
      <h2 className="mt-5 font-display text-[30px] leading-none">Nothing here yet</h2>
      <p className="mx-auto mt-3 max-w-[36ch] text-[14px] leading-relaxed text-muted">
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
      <p className="mt-4 font-display text-[26px] leading-none">You're all caught up</p>
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
