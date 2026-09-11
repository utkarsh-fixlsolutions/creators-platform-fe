import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  ChevronDown,
  Crown,
  Flame,
  LayoutGrid,
  Plus,
  Radio,
  Search,
  Star,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import type { FeedTab } from "../data";
import { SEARCH_SUGGESTIONS } from "../data";
import { cn } from "../utils/cn";
import { useClickOutside } from "../hooks/useClickOutside";
import { Menu } from "./Menu";

interface TabDef {
  id: FeedTab;
  label: string;
  icon: LucideIcon;
  hint?: string;
}

export const PRIMARY_TABS: TabDef[] = [
  { id: "foryou", label: "For you", icon: Star },
  { id: "following", label: "Following", icon: Users },
  { id: "search", label: "Search", icon: Search },
  { id: "exclusive", label: "Exclusive", icon: Crown },
];

/** The fifth circle — "something we can put, like…" */
export const MORE_OPTIONS: TabDef[] = [
  { id: "live", label: "Live now", icon: Radio, hint: "Creators streaming right now" },
  { id: "trending", label: "Trending", icon: Flame, hint: "Most loved in the last 24 hours" },
  { id: "collections", label: "Collections", icon: LayoutGrid, hint: "Curated series and packs" },
];

export const ALL_TABS = [...PRIMARY_TABS, ...MORE_OPTIONS];

interface FeedTabsProps {
  active: FeedTab;
  onChange: (tab: FeedTab) => void;
  query: string;
  onQueryChange: (q: string) => void;
}

export function FeedTabs({ active, onChange, query, onQueryChange }: FeedTabsProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const closeMore = useCallback(() => setMoreOpen(false), []);
  useClickOutside(moreRef, closeMore, moreOpen);

  const activeMore = MORE_OPTIONS.find((o) => o.id === active);

  return (
    <div className="space-y-3">
      {/* The pill — five circles, exactly as sketched */}
      <div>
        <div
          role="tablist"
          aria-label="Feed"
          className="inline-flex max-w-full items-center gap-0 rounded-full border border-line bg-surface p-1.5 shadow-card md:gap-0.5"
        >
          {PRIMARY_TABS.map((tab) => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              active={active === tab.id}
              onClick={() => onChange(tab.id)}
              fillWhenActive={tab.id === "foryou"}
            />
          ))}

          {/* Divider before the "More" slot */}
          <span className="mx-1 hidden h-6 w-px bg-line md:block" aria-hidden="true" />

          <div ref={moreRef} className="relative">
            <TabButton
              id={activeMore?.id ?? "more"}
              label={activeMore?.label ?? "More"}
              icon={activeMore?.icon ?? Plus}
              active={Boolean(activeMore)}
              onClick={() => setMoreOpen((open) => !open)}
              expanded={moreOpen}
              trailing={
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    moreOpen && "rotate-180",
                  )}
                />
              }
            />
            {moreOpen && (
              <Menu
                label="More feeds"
                items={MORE_OPTIONS.map((opt) => ({
                  icon: opt.icon,
                  label: opt.label,
                  hint: opt.hint,
                  active: active === opt.id,
                  onSelect: () => {
                    onChange(opt.id);
                    setMoreOpen(false);
                  },
                }))}
              />
            )}
          </div>
        </div>
      </div>

      {active === "search" && (
        <SearchField query={query} onQueryChange={onQueryChange} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------- */

interface TabButtonProps {
  id: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  fillWhenActive?: boolean;
  trailing?: ReactNode;
  expanded?: boolean;
}

function TabButton({
  id,
  label,
  icon: Icon,
  active,
  onClick,
  fillWhenActive,
  trailing,
  expanded,
}: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${id}`}
      aria-selected={active}
      aria-controls="feed-panel"
      aria-expanded={expanded}
      onClick={onClick}
      title={label}
      className={cn(
        "group flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 transition-colors duration-200",
        active ? "bg-paper pr-1 min-[360px]:pr-3.5" : "pr-1 hover:bg-paper/70 md:pr-3.5",
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-full border transition-all duration-300 ease-out",
          active
            ? "border-ink bg-ink text-white shadow-ink"
            : "border-line bg-surface text-ink-soft group-hover:-translate-y-px group-hover:border-line-strong group-hover:text-ink",
        )}
      >
        <Icon
          className="h-[17px] w-[17px] transition-transform duration-300 group-active:scale-90"
          strokeWidth={2.1}
          fill={active && fillWhenActive ? "currentColor" : "none"}
        />
      </span>
      <span
        className={cn(
          "whitespace-nowrap text-[14px] tracking-[-0.01em]",
          active
            ? "hidden font-semibold text-ink min-[360px]:inline"
            : "hidden font-medium text-muted group-hover:text-ink md:inline",
        )}
      >
        {label}
      </span>
      {trailing && (
        <span className={cn("-ml-0.5 text-muted", active ? "hidden min-[360px]:inline" : "hidden md:inline")}>
          {trailing}
        </span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------------- */

function SearchField({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (q: string) => void;
}) {
  return (
    <div className="animate-scale-in space-y-2.5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search creators, posts, #tags…"
          aria-label="Search the feed"
          className="h-12 w-full appearance-none rounded-2xl border border-line bg-surface pl-12 pr-24 text-[15px] text-ink shadow-card outline-none transition-all duration-200 placeholder:text-faint focus:border-brand focus:ring-4 focus:ring-brand/10 [&::-webkit-search-cancel-button]:hidden"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden rounded-md border border-line bg-paper px-1.5 py-0.5 font-sans text-[11px] font-medium text-muted sm:block">
              /
            </kbd>
          )}
        </div>
      </div>

      {!query && (
        <div className="flex flex-wrap items-center gap-1.5 px-1 text-[13px]">
          <span className="mr-1 text-muted">Try</span>
          {SEARCH_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onQueryChange(s)}
              className="rounded-full border border-line bg-surface px-3 py-1 font-medium text-ink-soft transition-all duration-200 hover:-translate-y-px hover:border-line-strong hover:text-ink hover:shadow-card"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
