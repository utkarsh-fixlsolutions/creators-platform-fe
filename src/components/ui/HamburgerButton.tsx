import { cn } from "../../utils/cn";

interface HamburgerButtonProps {
  open: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * 2-line animated folding hamburger button that folds into a crisp cross (X).
 * The lower bar is intentionally shorter at rest (11px) so the open state has a satisfying stretch release.
 */
export function HamburgerButton({ open, onToggle, className }: HamburgerButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={open ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={open}
      aria-controls="mobile-navigation-drawer"
      className={cn(
        "group relative grid h-9 w-9 place-items-center rounded-full",
        "text-ink outline-none transition-colors duration-300",
        "hover:bg-paper focus-visible:ring-2 focus-visible:ring-brand/30 active:scale-95 cursor-pointer",
        open && "bg-paper-deep",
        className
      )}
    >
      <span className="relative block h-4 w-[18px]">
        {/* Top Bar */}
        <span
          aria-hidden="true"
          className="burger-line absolute left-0 top-[3px] h-[1.7px] w-full rounded-full bg-current"
          style={{
            transform: open ? "translateY(4.15px) rotate(45deg)" : "translateY(0) rotate(0deg)",
          }}
        />
        {/* Bottom Bar (shorter at rest, expands to 100% when open) */}
        <span
          aria-hidden="true"
          className="burger-line absolute bottom-[3px] left-0 h-[1.7px] rounded-full bg-current"
          style={{
            width: open ? "100%" : "11px",
            transform: open
              ? "translateY(-4.15px) rotate(-45deg)"
              : "translateY(0) rotate(0deg)",
          }}
        />
      </span>
    </button>
  );
}
