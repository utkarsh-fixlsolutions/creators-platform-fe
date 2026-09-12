import { cn } from "../utils/cn";

interface AvatarProps {
  src: string;
  alt: string;
  size?: number;
  /** Decorative ring: gold = offers memberships, live = streaming now */
  ring?: "gold" | "live" | "brand";
  className?: string;
}

export function Avatar({ src, alt, size = 40, ring, className }: AvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 rounded-full",
        ring && "p-[2px]",
        ring === "gold" && "bg-gradient-to-br from-[#f2c56a] via-[#d9952a] to-[#a86b14]",
        ring === "live" && "bg-gradient-to-br from-[#ff6b8a] to-[#e11d48]",
        ring === "brand" && "bg-brand",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={cn(
          "h-full w-full rounded-full bg-paper-deep object-cover",
          ring && "ring-2 ring-surface",
        )}
      />
    </span>
  );
}
