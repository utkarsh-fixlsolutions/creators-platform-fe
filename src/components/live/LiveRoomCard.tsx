import { CREATORS, type LiveRoom } from "../../data";
import { VerifiedBadge } from "../ui/VerifiedBadge";

interface LiveRoomCardProps {
  room: LiveRoom;
  onSelect: (room: LiveRoom) => void;
}

function formatViewers(count: number): string {
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return String(count);
}

export function LiveRoomCard({ room, onSelect }: LiveRoomCardProps) {
  const creator = CREATORS.find((c) => c.id === room.creatorId);
  const creatorName = creator?.name || room.title;
  const avatar = creator?.avatar || room.coverImage || "";
  const verified = creator?.verified;

  // Access badge formatting
  let badgeText = room.badgeText || "LIVE";
  let badgeStyle = "bg-rose text-white";

  if (room.access === "ticketed" || room.badgeTone === "gold") {
    badgeText = "TICKET";
    badgeStyle = "bg-gold-soft text-gold-deep border border-[#e9d6ab]";
  } else if (room.access === "subscribers" || room.badgeTone === "ink") {
    badgeText = "SUBS";
    badgeStyle = "bg-white/90 text-ink";
  }

  // Access label subtitle
  let accessLabel = "Free for members";
  if (room.access === "ticketed") {
    accessLabel = `Ticket · ${room.ticketPrice || 120} Coins`;
  } else if (room.access === "subscribers") {
    accessLabel = "Subscribers only";
  }

  return (
    <div
      onClick={() => onSelect(room)}
      className="group relative h-[186px] w-full cursor-pointer overflow-hidden rounded-[20px] border border-line bg-[#2b2b33] shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
      style={{
        backgroundImage: `url("${room.coverImage || avatar}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Scrim */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-ink/35 via-transparent to-ink/70"
      />

      {/* Top Left: Access Badge */}
      <span
        className={`absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-[0.05em] shadow-sm backdrop-blur-sm ${badgeStyle}`}
      >
        {badgeText}
      </span>

      {/* Top Right: Viewer Count */}
      <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[10.5px] font-bold text-ink backdrop-blur-sm shadow-sm">
        {formatViewers(room.viewers)}
      </span>

      {/* Bottom Creator Row */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-2">
        <span
          className="h-7 w-7 shrink-0 rounded-full border-2 border-rose bg-[#3b3b46] shadow-sm"
          style={{
            backgroundImage: `url("${avatar}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-[12.5px] font-bold text-white drop-shadow-sm">
              {creatorName}
            </span>
            {verified && (
              <span className="shrink-0">
                <VerifiedBadge size={12} />
              </span>
            )}
          </div>
          <span className="block truncate text-[10.5px] font-semibold text-white/80">
            {accessLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
