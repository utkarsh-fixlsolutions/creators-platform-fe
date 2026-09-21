import { BadgeCheck, Sparkles } from "lucide-react";
import type { ExploreCreator } from "../../data/exploreData";
import { formatCount } from "../../utils/format";
import { cn } from "../../utils/cn";

interface CreatorCardProps {
  creator: ExploreCreator;
  onToggleFollow: (id: string) => void;
  onSelectCreator?: (creator: ExploreCreator) => void;
}

export function CreatorCard({
  creator,
  onToggleFollow,
  onSelectCreator,
}: CreatorCardProps) {
  const handleClick = () => {
    onSelectCreator?.(creator);
  };

  return (
    <article
      onClick={handleClick}
      className="group relative flex flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer"
    >
      {/* 16:9 Cover Banner */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-paper-deep">
        <img
          src={creator.cover}
          alt={creator.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Category Pill Over Cover */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="rounded-full border border-white/20 bg-black/45 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
            {creator.category}
          </span>
        </div>

        {/* Gold Membership Pill (if applicable) */}
        {creator.price && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full border border-amber-400/30 bg-black/50 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-amber-300 shadow-xs">
            <Sparkles className="h-3 w-3 stroke-[2.2]" />
            <span>🪙 {creator.price}/mo</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="relative flex flex-1 flex-col px-4 pt-0 pb-4">
        {/* Floating Overlapping Avatar */}
        <div className="-mt-7 flex items-end justify-between mb-2">
          <div className="relative">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="h-14 w-14 rounded-full object-cover ring-3 ring-surface shadow-sm bg-paper"
            />
            {creator.verified && (
              <BadgeCheck className="absolute -bottom-0.5 -right-0.5 h-4 w-4 fill-brand text-white ring-2 ring-surface rounded-full shrink-0" />
            )}
          </div>

          <div className="text-right">
            <span className="text-[12px] font-semibold text-muted tabular-nums">
              {formatCount(creator.fans)} fans
            </span>
          </div>
        </div>

        {/* Creator Name & Handle */}
        <div className="min-w-0 mb-3">
          <h3 className="truncate font-bold text-[15.5px] text-ink leading-tight transition-colors group-hover:text-brand">
            {creator.name}
          </h3>
          <p className="truncate text-[12.5px] text-muted mt-0.5 font-normal">
            @{creator.handle.replace(/^@/, '')}
          </p>
        </div>

        {/* 3-Thumbnail Preview Strip */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {creator.portfolio.map((img, i) => (
            <div
              key={i}
              className="group/thumb aspect-square overflow-hidden rounded-xl bg-paper ring-1 ring-line/60"
            >
              <img
                src={img}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover/thumb:scale-110"
              />
            </div>
          ))}
        </div>

        {/* Action Footer: Blue Brand Follow CTA */}
        <div className="mt-auto flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFollow(creator.id);
            }}
            aria-pressed={creator.following}
            className={cn(
              "flex-1 rounded-full py-2.5 text-[12.5px] font-bold tracking-[-0.01em] transition-all duration-200 cursor-pointer active:scale-95 shadow-xs",
              creator.following
                ? "border border-line bg-paper text-ink-soft hover:border-rose/30 hover:bg-rose-50 hover:text-rose"
                : "bg-brand text-white hover:bg-brand-deep hover:shadow-brand"
            )}
          >
            {creator.following ? "Following" : "Follow"}
          </button>
        </div>
      </div>
    </article>
  );
}
