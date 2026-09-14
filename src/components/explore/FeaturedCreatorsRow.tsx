import { useRef } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { ExploreCreator } from "../../data/exploreData";
import { formatCount } from "../../utils/format";

interface FeaturedCreatorsRowProps {
  creators: ExploreCreator[];
  onToggleFollow: (id: string) => void;
  onSelectCreator: (creator: ExploreCreator) => void;
}

export function FeaturedCreatorsRow({
  creators,
  onToggleFollow,
  onSelectCreator,
}: FeaturedCreatorsRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -340 : 340;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const featured = creators.slice(0, 6);

  return (
    <div className="mb-8">
      {/* Header with Carousel Navigation */}
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Spotlight</span>
          </div>
          <h2 className="font-bold text-[20px] sm:text-[22px] tracking-tight text-ink leading-snug mt-0.5">
            Featured Creators
          </h2>
        </div>

        {/* Carousel Arrow Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-ink-soft shadow-2xs transition-all duration-200 hover:border-line-strong hover:bg-paper hover:text-ink active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-ink-soft shadow-2xs transition-all duration-200 hover:border-line-strong hover:bg-paper hover:text-ink active:scale-95 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Stream */}
      <div
        ref={scrollRef}
        className="flex gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar py-1 scroll-smooth snap-x snap-mandatory"
      >
        {featured.map((creator) => (
          <article
            key={creator.id}
            onClick={() => onSelectCreator(creator)}
            className="group relative h-[300px] w-[210px] sm:h-[340px] sm:w-[240px] shrink-0 snap-start overflow-hidden rounded-[24px] border border-line bg-surface shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer"
          >
            {/* Full-bleed Portrait Cover */}
            <img
              src={creator.cover}
              alt={creator.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Dark Editorial Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

            {/* Top Category Badge */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="rounded-full bg-white/85 backdrop-blur-md px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-ink shadow-xs">
                {creator.category}
              </span>
              {creator.price && (
                <span className="rounded-full border border-white/30 bg-black/40 backdrop-blur-md px-2 py-0.5 text-[10.5px] font-bold text-amber-300 shadow-xs">
                  🪙 {creator.price}/mo
                </span>
              )}
            </div>

            {/* Bottom Info & Follow Button */}
            <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 text-white">
              <div className="flex items-center gap-2 mb-1.5">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="h-7 w-7 rounded-full object-cover ring-2 ring-white/80"
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 font-bold text-[14px] leading-tight truncate">
                    <span>{creator.name}</span>
                    {creator.verified && (
                      <BadgeCheck className="h-3.5 w-3.5 fill-brand text-white shrink-0" />
                    )}
                  </p>
                  <p className="text-[11px] text-white/70 truncate tabular-nums">
                    @{creator.handle} · {formatCount(creator.fans)} fans
                  </p>
                </div>
              </div>

              {/* Follow Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFollow(creator.id);
                }}
                className={`mt-2 w-full rounded-full py-2 text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer ${
                  creator.following
                    ? "bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                    : "bg-brand text-white hover:bg-brand-deep"
                }`}
              >
                {creator.following ? "Following" : "Follow"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
