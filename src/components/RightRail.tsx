import { BadgeCheck, TrendingUp } from "lucide-react";
import type { Creator } from "../data";
import { TRENDING_TAGS } from "../data";
import { cn } from "../utils/cn";
import { formatCount } from "../utils/format";
import { Avatar } from "./Avatar";
import { Reveal } from "./Reveal";

interface RightRailProps {
  suggested: Creator[];
  onFollow: (creatorId: string) => void;
  onTagClick: (tag: string) => void;
  onNotify: (message: string) => void;
}

export function RightRail({ suggested, onFollow, onTagClick, onNotify }: RightRailProps) {
  return (
    <aside className="hidden xl:block">
      <div className="quiet-scroll sticky top-0 flex h-screen flex-col gap-5 overflow-y-auto py-8 pl-2 pr-8">
        {/* Suggested creators */}
        <Reveal delay={80}>
          <section
            aria-labelledby="suggested-heading"
            className="rounded-[24px] border border-line bg-surface p-5 shadow-card"
          >
            <header className="mb-4 flex items-center justify-between">
              <h2 id="suggested-heading" className="text-[15px] font-semibold tracking-[-0.01em]">
                Suggested for you
              </h2>
              <button
                type="button"
                onClick={() => onNotify("Opening all suggestions")}
                className="text-xs font-semibold text-brand transition-colors hover:text-brand-deep"
              >
                See all
              </button>
            </header>
            <ul className="space-y-1">
              {suggested.map((creator) => (
                <li
                  key={creator.id}
                  className="-mx-2 flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors duration-200 hover:bg-paper"
                >
                  <Avatar src={creator.avatar} alt={creator.name} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate text-[14px] font-semibold">
                      <span className="truncate">{creator.name}</span>
                      {creator.verified && (
                        <BadgeCheck className="h-4 w-4 shrink-0 fill-brand text-white" />
                      )}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {creator.category} · {formatCount(creator.fans)} fans
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onFollow(creator.id)}
                    aria-pressed={creator.following}
                    className={cn(
                      "h-8 shrink-0 rounded-full px-3.5 text-xs font-semibold transition-all duration-200",
                      creator.following
                        ? "border border-line text-ink-soft hover:border-rose/40 hover:bg-rose-soft hover:text-rose"
                        : "bg-brand-soft text-brand hover:bg-brand hover:text-white",
                    )}
                  >
                    {creator.following ? "Following" : "Follow"}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        {/* Trending — Plain quiet list */}
        <Reveal delay={160}>
          <section aria-labelledby="trending-heading" className="px-1 pt-1">
            <header className="mb-2.5 flex items-center justify-between">
              <h2
                id="trending-heading"
                className="flex items-center gap-1.5 text-[13px] font-semibold tracking-[-0.01em] text-muted"
              >
                <TrendingUp className="h-3.5 w-3.5 text-brand" />
                Trending now
              </h2>
              <span className="text-[11px] text-faint">24h</span>
            </header>
            <ol className="space-y-0.5">
              {TRENDING_TAGS.map((item, index) => (
                <li key={item.tag}>
                  <button
                    type="button"
                    onClick={() => onTagClick(item.tag)}
                    className="group -mx-2 flex w-[calc(100%+1rem)] items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors duration-200 hover:bg-surface/80"
                  >
                    <span className="w-4 text-xs font-semibold tabular-nums text-faint transition-colors group-hover:text-ink">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold text-ink">
                        #{item.tag}
                      </span>
                      <span className="block text-[11px] text-muted tabular-nums">
                        {formatCount(item.posts)} posts
                      </span>
                    </span>
                    <span className="rounded-full bg-[#e7f6ec] px-2 py-0.5 text-[10.5px] font-semibold tabular-nums text-[#1f8a4c]">
                      {item.delta}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>

        <footer className="mt-auto px-1 pt-2 text-[11.5px] leading-relaxed text-faint">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-3 gap-y-1">
            {["About", "Help", "Creators", "Privacy", "Terms"].map((link) => (
              <a key={link} href="#top" className="transition-colors hover:text-ink">
                {link}
              </a>
            ))}
          </nav>
          <p className="mt-2">© 2026 Creators Platform</p>
        </footer>
      </div>
    </aside>
  );
}
