import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Eye, EyeOff, MoreVertical, ShieldAlert, Sliders, Copy, Share2, Sparkles } from "lucide-react";
import { CREATORS, type LiveRoom } from "../../data";
import { VerifiedBadge } from "../ui/VerifiedBadge";
import { useClickOutside } from "../../hooks/useClickOutside";

interface LiveOverlayChromeProps {
  room: LiveRoom;
  onBack: () => void;
  onToggleEntitlement?: () => void;
  onNotify?: (msg: string) => void;
}

function formatElapsed(startedAt: string): string {
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - start) / 1000));
  const mins = Math.floor(diffSec / 60);
  const secs = diffSec % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatViewers(count: number): string {
  return count.toLocaleString();
}

export function LiveOverlayChrome({
  room,
  onBack,
  onToggleEntitlement,
  onNotify,
}: LiveOverlayChromeProps) {
  const creator = CREATORS.find((c) => c.id === room.creatorId);
  const creatorName = creator?.name || "Theo Marchetti";
  const avatar = creator?.avatar || room.coverImage || "";
  const verified = creator?.verified ?? true;

  const [elapsed, setElapsed] = useState(() => formatElapsed(room.startedAt));
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(formatElapsed(room.startedAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [room.startedAt]);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    onNotify?.("Room link copied to clipboard");
    setMenuOpen(false);
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col gap-2 p-3 sm:p-4">
      {/* Top Chrome Row */}
      <div className="pointer-events-auto flex items-center justify-between gap-2">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to browse"
          className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-white/92 text-ink shadow-[0_6px_20px_-8px_rgba(18,18,24,0.5)] backdrop-blur-[10px] transition-all duration-200 hover:bg-white active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="h-[18px] w-[18px] stroke-[2.4]" />
        </button>

        {/* Creator Live Pill */}
        <div className="flex min-w-0 items-center gap-2.5 rounded-full bg-white/92 py-1 pl-1 pr-3.5 shadow-[0_6px_20px_-8px_rgba(18,18,24,0.5)] backdrop-blur-[10px]">
          <div className="relative h-[30px] w-[30px] shrink-0">
            {/* Live expanding pulse ring */}
            <span className="absolute -inset-[3px] rounded-full border-2 border-rose animate-live-ring-slow" />
            <span
              className="block h-[30px] w-[30px] rounded-full border-2 border-rose bg-paper-deep"
              style={{
                backgroundImage: `url("${avatar}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="truncate text-[13.5px] font-bold tracking-[-0.01em] text-ink">
                {creatorName}
              </span>
              {verified && (
                <span className="shrink-0">
                  <VerifiedBadge size={13} />
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose animate-pulse" />
              <span className="text-[10.5px] font-extrabold tracking-[0.08em] text-rose">
                LIVE {elapsed}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Viewers Count & Overflow Menu */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <div className="flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-2 text-[12px] font-bold text-ink shadow-[0_6px_20px_-8px_rgba(18,18,24,0.5)] backdrop-blur-[10px]">
            <Eye className="h-3.5 w-3.5 stroke-[2.2]" />
            <span>{formatViewers(room.viewers)}</span>
          </div>

          {/* Menu Anchor */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Room options"
              className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-white/92 text-ink shadow-[0_6px_20px_-8px_rgba(18,18,24,0.5)] backdrop-blur-[10px] transition-all duration-200 hover:bg-white active:scale-95 cursor-pointer"
            >
              <MoreVertical className="h-[17px] w-[17px] stroke-[2.4]" />
            </button>

            {menuOpen && (
              <div className="animate-scale-in absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-pop">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-ink transition-colors hover:bg-paper"
                >
                  <Copy className="h-4 w-4 text-muted" />
                  <span>Copy room link</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNotify?.("Share sheet opened");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-ink transition-colors hover:bg-paper"
                >
                  <Share2 className="h-4 w-4 text-muted" />
                  <span>Share stream</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNotify?.("Quality locked to 1080p60 Ultra");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-ink transition-colors hover:bg-paper"
                >
                  <Sliders className="h-4 w-4 text-muted" />
                  <span>Stream quality (1080p)</span>
                </button>
                {onToggleEntitlement && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleEntitlement();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-gold-deep transition-colors hover:bg-gold-soft"
                  >
                    <Sparkles className="h-4 w-4 text-gold-deep" />
                    <span>Toggle Gate / Entitled</span>
                  </button>
                )}
                <div className="my-1 h-px bg-line" />
                <button
                  type="button"
                  onClick={() => {
                    onNotify?.("Report submitted for review");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-rose hover:bg-rose-soft/60"
                >
                  <ShieldAlert className="h-4 w-4 text-rose" />
                  <span>Report room</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recording Blocked Notice */}
      <div className="pointer-events-auto self-start">
        <div className="flex items-center gap-1.5 rounded-full bg-ink/55 px-3 py-1 text-[10.5px] font-semibold text-white/90 backdrop-blur-md shadow-sm">
          <EyeOff className="h-3 w-3 stroke-[2.2]" />
          <span>Recording &amp; screenshots are blocked</span>
        </div>
      </div>
    </div>
  );
}
