import { BadgeCheck, Sparkles } from "lucide-react";
import type { ExploreCreator } from "../../data/exploreData";
import { formatCount } from "../../utils/format";
import { cn } from "../../utils/cn";

interface CreatorMasonryCardProps {
  creator: ExploreCreator;
  onToggleFollow: (id: string) => void;
  onSelectCreator?: (creator: ExploreCreator) => void;
}

export function CreatorMasonryCard({
  creator,
  onToggleFollow,
  onSelectCreator,
}: CreatorMasonryCardProps) {
  return (
    <article className="break-inside-avoid mb-3.5 sm:mb-4 overflow-hidden rounded-[22px] border border-line bg-surface shadow-xs transition-all duration-300 hover:shadow-card hover:-translate-y-0.5 group">
      {/* Cover Image with Dynamic Masonry Height */}
      <div
        onClick={() => onSelectCreator?.(creator)}
        className="relative w-full overflow-hidden bg-paper-deep cursor-pointer"
        style={{ height: `${creator.coverHeight}px` }}
      >
        <img
          src={creator.cover}
          alt={creator.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Floating Frosted Glass Avatar Badge */}
        <div className="absolute inset-x-2.5 bottom-2.5 flex items-center gap-2 rounded-full border border-white/40 bg-white/92 px-2.5 py-1.5 shadow-sm backdrop-blur-md transition-transform group-hover:scale-[1.02]">
          <img
            src={creator.avatar}
            alt={creator.name}
            className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-black/10"
          />
          <span className="truncate text-[12px] font-bold text-ink tracking-tight">
            {creator.name}
          </span>
          {creator.verified && (
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 fill-brand text-white" />
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col gap-2.5 p-3 sm:p-3.5">
        {/* Category & Fans Count */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold uppercase tracking-wider text-muted">
            {creator.category}
          </span>
          <span className="font-semibold text-faint">
            {formatCount(creator.fans)} fans
          </span>
        </div>

        {/* 3-Thumbnail Portfolio Strip */}
        <div className="grid grid-cols-3 gap-1.5">
          {creator.portfolio.map((img, i) => (
            <div
              key={i}
              className="aspect-square overflow-hidden rounded-lg bg-paper ring-1 ring-line/50"
            >
              <img
                src={img}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>
          ))}
        </div>

        {/* Action Footer: Follow Button + Price Badge */}
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFollow(creator.id);
            }}
            aria-pressed={creator.following}
            className={cn(
              "flex-1 rounded-full py-2 text-[12px] font-bold tracking-[-0.01em] transition-all duration-200 cursor-pointer active:scale-95",
              creator.following
                ? "border border-line bg-paper text-ink-soft hover:border-rose/30 hover:bg-rose-50 hover:text-rose"
                : "bg-ink text-white shadow-xs hover:bg-black"
            )}
          >
            {creator.following ? "Following" : "Follow"}
          </button>

          {creator.price && (
            <span
              title={`Monthly membership: ${creator.price} Coins/mo`}
              className="flex shrink-0 items-center gap-1 rounded-full border border-[#e9d6ab] bg-gold-soft px-2.5 py-1.5 text-[11px] font-bold text-gold-deep"
            >
              <Sparkles className="h-3 w-3 stroke-[2.2]" />
              <span>{creator.price} Coins/mo</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
