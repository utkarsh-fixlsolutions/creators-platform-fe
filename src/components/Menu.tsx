import type { LucideIcon } from "lucide-react";
import { cn } from "../utils/cn";

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  hint?: string;
  onSelect: () => void;
  danger?: boolean;
  active?: boolean;
}

interface MenuProps {
  items: MenuItem[];
  align?: "left" | "right";
  className?: string;
  label?: string;
}

/** Floating popover menu. Parent must be `relative`. */
export function Menu({ items, align = "right", className, label }: MenuProps) {
  return (
    <div
      role="menu"
      aria-label={label}
      className={cn(
        "absolute top-full z-40 mt-2 min-w-[228px] animate-scale-in rounded-2xl border border-line bg-surface p-1.5 shadow-pop",
        align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
        className,
      )}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          onClick={item.onSelect}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150",
            item.danger
              ? "text-rose hover:bg-rose-soft"
              : item.active
                ? "bg-paper text-ink"
                : "text-ink-soft hover:bg-paper hover:text-ink",
          )}
        >
          <span
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
              item.danger ? "bg-rose-soft/70" : item.active ? "bg-ink text-white" : "bg-paper",
            )}
          >
            <item.icon className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block">{item.label}</span>
            {item.hint && <span className="block text-xs font-normal text-muted">{item.hint}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
