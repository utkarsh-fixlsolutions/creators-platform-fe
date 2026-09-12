import { cn } from "../utils/cn";

interface LogoProps {
  /** Hide the wordmark (used on the collapsed tablet rail) */
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

/** Ink‑block mark with a four‑point pen star — a wink at the sketch. */
export function Logo({ compact, className, onClick }: LogoProps) {
  return (
    <a
      href="#top"
      onClick={onClick}
      aria-label="Creators Platform — home"
      className={cn("group flex items-center gap-3 rounded-2xl", className)}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-ink text-white shadow-ink transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z"
            fill="currentColor"
          />
        </svg>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[17px] font-bold tracking-[-0.02em] text-ink">Creators</span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
            Platform
          </span>
        </span>
      )}
    </a>
  );
}
