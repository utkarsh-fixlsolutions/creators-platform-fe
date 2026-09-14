import { cn } from "../../utils/cn";
import { EXPLORE_CATEGORIES, type ExploreCategory } from "../../data/exploreData";

interface CategoryPillsProps {
  activeCategory: string;
  onSelect: (cat: string) => void;
  className?: string;
}

export function CategoryPills({
  activeCategory,
  onSelect,
  className,
}: CategoryPillsProps) {
  return (
    <div
      role="tablist"
      aria-label="Creator categories"
      className={cn(
        "flex gap-2 overflow-x-auto py-1 no-scrollbar select-none",
        className
      )}
    >
      {EXPLORE_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onSelect(cat)}
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full px-4 py-2 text-[12.5px] tracking-[-0.01em] transition-all duration-200 cursor-pointer active:scale-95",
              isActive
                ? "bg-ink font-bold text-white shadow-sm"
                : "border border-line bg-surface font-medium text-ink-soft hover:border-line-strong hover:bg-paper hover:text-ink"
            )}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
