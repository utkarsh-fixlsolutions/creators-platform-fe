import { Eye } from "lucide-react";
import type { LiveRoom } from "../../data";
import { CREATORS } from "../../data";

interface LiveFeaturedCardProps {
  room: LiveRoom;
  onWatch: (room: LiveRoom) => void;
}

export function LiveFeaturedCard({ room, onWatch }: LiveFeaturedCardProps) {
  const creator = CREATORS.find((c) => c.id === room.creatorId);
  const creatorName = creator?.name || "Theo Marchetti";
  const cover =
    room.coverImage ||
    "https://images.pexels.com/photos/14807440/pexels-photo-14807440.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=900&h=700";

  return (
    <div
      onClick={() => onWatch(room)}
      className="group relative h-[238px] w-full cursor-pointer overflow-hidden rounded-[24px] border border-line-strong bg-[#2b2b33] shadow-pop transition-transform duration-300 hover:scale-[1.01]"
      style={{
        backgroundImage: `url("${cover}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Scrim */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-ink/45 via-transparent to-ink/65"
      />

      {/* Top Left: Rose LIVE Chip */}
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-rose px-2.5 py-1 text-[11px] font-extrabold tracking-[0.06em] text-white shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        LIVE
      </div>

      {/* Top Right: Viewer Pill */}
      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/92 px-2.5 py-1 text-[11.5px] font-bold text-ink backdrop-blur-md shadow-sm">
        <Eye className="h-3.5 w-3.5 stroke-[2.2]" />
        <span>{room.viewers.toLocaleString()}</span>
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="block truncate text-[16px] font-bold tracking-[-0.01em] text-white drop-shadow-sm">
            {creatorName}
          </span>
          <span className="mt-0.5 block truncate text-[12px] font-semibold text-white/85">
            {room.title}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onWatch(room);
          }}
          className="shrink-0 rounded-full bg-surface px-4 py-2 text-[12.5px] font-bold text-ink shadow-ink transition-all duration-200 hover:bg-paper active:scale-95"
        >
          Watch
        </button>
      </div>
    </div>
  );
}
