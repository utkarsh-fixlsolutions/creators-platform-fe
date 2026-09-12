import type { EmojiBurst } from "../../store/liveStore";

const EMOJIS = ["❤️", "🔥", "✨", "🙌", "💫"];

interface ReactionRailProps {
  bursts: EmojiBurst[];
  onReact: (glyph: string) => void;
}

export function ReactionRail({ bursts, onReact }: ReactionRailProps) {
  return (
    <div className="relative flex flex-col items-center gap-2">
      {/* Drifting Floating Burst Layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-12 right-2 h-[340px] w-16 overflow-visible"
      >
        {bursts.map((b) => (
          <span
            key={b.id}
            className="pointer-events-none absolute bottom-0 select-none animate-[emojiUp_var(--dur)_cubic-bezier(0.22,1,0.36,1)_forwards]"
            style={
              {
                left: b.left,
                fontSize: b.size,
                "--dx": b.dx,
                "--dur": b.dur,
              } as React.CSSProperties
            }
          >
            {b.glyph}
          </span>
        ))}
      </div>

      {/* Vertical Emoji Buttons Rail */}
      <div className="flex flex-col items-center gap-2.5">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onReact(emoji)}
            aria-label={`React with ${emoji}`}
            className="grid h-[42px] w-[42px] place-items-center rounded-full border border-white/50 bg-white/90 text-[19px] leading-none shadow-[0_8px_22px_-10px_rgba(18,18,24,0.55)] backdrop-blur-[10px] transition-transform duration-150 hover:bg-white hover:scale-105 active:scale-90 cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
