import { Radio, SearchX, Sparkles } from "lucide-react";
import { ME } from "../data";
import { greeting } from "../utils/format";
import { cn } from "../utils/cn";

/* ---- Page header with Live Now Action Button -------------------------- */

interface FeedHeaderProps {
  onLiveClick?: () => void;
  isLiveActive?: boolean;
}

export function FeedHeader({ onLiveClick, isLiveActive }: FeedHeaderProps) {
  return (
    <header className="pb-3 pt-6 sm:pt-8 md:pb-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
        {greeting()}, {ME.name.split(" ")[0]}
      </p>
      
      <div className="mt-1.5 flex items-center justify-between gap-4">
        <h1 className="font-display text-[38px] leading-[0.95] tracking-[-0.015em] text-ink sm:text-[48px] lg:text-[52px]">
          Discovery <em className="text-brand not-italic">Feed</em>
        </h1>

        {/* Highlighted Live Now Button placed in the line of Discovery Feed on right side */}
        <button
          type="button"
          onClick={onLiveClick}
          aria-pressed={isLiveActive}
          title={isLiveActive ? "Showing live creators — Click to show all" : "Filter to live creators"}
          className={cn(
            "group relative hidden md:flex items-center gap-2.5 rounded-full border py-1.5 pl-2.5 pr-4 shadow-card transition-all duration-300 hover:shadow-card-hover active:scale-95 select-none shrink-0",
            isLiveActive
              ? "border-rose bg-rose text-white shadow-pop ring-2 ring-rose/30"
              : "border-rose/35 bg-surface text-ink hover:border-rose/60 hover:bg-rose-50/40"
          )}
        >
          {/* Animated Radar Beacon Dot */}
          <span className="relative flex h-3.5 w-3.5 items-center justify-center">
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                isLiveActive ? "bg-white" : "bg-rose"
              )}
            />
            <span
              className={cn(
                "relative inline-flex h-2.5 w-2.5 rounded-full ring-2",
                isLiveActive ? "bg-white ring-rose" : "bg-rose ring-surface"
              )}
            />
          </span>

          {/* Label + Dynamic Animated Equalizer Bars */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[13px] font-bold tracking-[0.05em] uppercase",
                isLiveActive ? "text-white" : "text-ink group-hover:text-rose transition-colors"
              )}
            >
              Live now
            </span>

            {/* 3 Animated Soundwave/Equalizer Bars */}
            <div className="flex h-3.5 items-end gap-0.5" aria-hidden="true">
              <span
                className={cn(
                  "w-[2.5px] rounded-full animate-eq-1",
                  isLiveActive ? "bg-white" : "bg-rose"
                )}
              />
              <span
                className={cn(
                  "w-[2.5px] rounded-full animate-eq-2",
                  isLiveActive ? "bg-white" : "bg-rose"
                )}
              />
              <span
                className={cn(
                  "w-[2.5px] rounded-full animate-eq-3",
                  isLiveActive ? "bg-white" : "bg-rose"
                )}
              />
            </div>

            {/* Active Count Badge */}
            <span
              className={cn(
                "flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
                isLiveActive
                  ? "bg-white/25 text-white"
                  : "bg-rose-soft text-rose"
              )}
            >
              3
            </span>
          </div>
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
