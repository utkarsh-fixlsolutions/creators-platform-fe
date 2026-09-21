import { Check, ChevronLeft, Lock, ShieldCheck } from "lucide-react";
import { CREATORS, type LiveRoom } from "../../data";
import { VerifiedBadge } from "../ui/VerifiedBadge";

interface SubscriberGateProps {
  room: LiveRoom;
  onBack: () => void;
  onSubscribe: () => void;
}

function formatFans(fans?: number): string {
  if (!fans) return "97.4k";
  if (fans >= 1000) {
    return (fans / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return String(fans);
}

export function SubscriberGate({
  room,
  onBack,
  onSubscribe,
}: SubscriberGateProps) {
  const creator = CREATORS.find((c) => c.id === room.creatorId);
  const creatorName = creator?.name || "Theo Marchetti";
  const handle = creator?.handle || "theo.shoots";
  const avatar = creator?.avatar || room.coverImage || "";
  const firstName = creatorName.split(" ")[0];
  const membershipPrice = creator?.membership || room.ticketPrice || 5;

  const perks = [
    "Every live room, no tickets needed",
    "Subscriber-only chat and reactions",
    "Full archive of past shows in the Vault",
  ];

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden">
      {/* Blurred Video Backdrop */}
      <div
        aria-hidden="true"
        className="absolute -inset-5 bg-[#24242b] bg-cover bg-center filter blur-[26px] saturate-75 brightness-[0.72]"
        style={{
          backgroundImage: `url("${room.streamPoster || room.coverImage || avatar}")`,
        }}
      />
      {/* Dark Overlay Gradient */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/30 to-ink/80"
      />

      {/* Top Chrome */}
      <div className="relative z-10 flex items-center gap-2 p-3 pt-6 sm:p-4 sm:pt-8">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to browse"
          className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-white/92 text-ink shadow-[0_6px_20px_-8px_rgba(18,18,24,0.5)] backdrop-blur-[10px] transition-all hover:bg-white active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="h-[18px] w-[18px] stroke-[2.4]" />
        </button>
        <span className="flex items-center gap-1.5 rounded-full bg-rose px-3 py-1.5 text-[11px] font-extrabold tracking-[0.06em] text-white shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          LIVE NOW
        </span>
        <span className="ml-auto rounded-full bg-white/92 px-3 py-2 text-[12px] font-bold text-ink shadow-[0_6px_20px_-8px_rgba(18,18,24,0.5)] backdrop-blur-[10px]">
          {room.viewers.toLocaleString()} watching
        </span>
      </div>

      {/* Center Lock Hero Banner */}
      <div className="relative z-10 mx-auto max-w-[340px] text-center px-4 py-6">
        <span className="inline-grid h-16 w-16 place-items-center rounded-full border border-white/30 bg-white/14 text-white backdrop-blur-md shadow-card">
          <Lock className="h-7 w-7 stroke-[2]" />
        </span>
        <h2 className="font-bold text-[24px] leading-tight tracking-tight text-white mt-4">
          Subscribers only
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/80 text-pretty">
          {firstName}&apos;s room is open to members. Join to watch, chat and tip in real time.
        </p>
      </div>

      {/* Bottom Subscription Sheet */}
      <div className="relative z-10 p-3 pb-4 sm:p-4">
        <div className="mx-auto w-full max-w-[420px] rounded-[26px] border border-line bg-surface p-4 shadow-pop">
          {/* Creator Profile Header */}
          <div className="flex items-center gap-3">
            <span
              className="h-11 w-11 shrink-0 rounded-full border-2 border-rose bg-paper-deep shadow-sm"
              style={{
                backgroundImage: `url("${avatar}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="truncate text-[14.5px] font-bold tracking-[-0.01em] text-ink">
                  {creatorName}
                </span>
                <VerifiedBadge size={14} />
              </div>
              <span className="block truncate text-[12px] text-muted">
                @{handle} · {formatFans(creator?.fans)} fans
              </span>
            </div>
            <div className="shrink-0 text-right">
              <span className="block text-[16px] font-extrabold tracking-[-0.01em] text-ink">
                {membershipPrice} Coins
              </span>
              <span className="block text-[11px] font-semibold text-faint">
                per month
              </span>
            </div>
          </div>

          {/* Perks Box */}
          <div className="my-3.5 flex flex-col gap-2 rounded-[18px] border border-line bg-paper p-3">
            {perks.map((perk) => (
              <span
                key={perk}
                className="flex items-center gap-2.5 text-[12.5px] font-semibold text-ink-soft"
              >
                <Check className="h-3.5 w-3.5 shrink-0 stroke-[2.8] text-brand" />
                <span>{perk}</span>
              </span>
            ))}
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={onSubscribe}
            className="flex h-[50px] w-full items-center justify-center rounded-full bg-ink text-[14px] font-bold tracking-[-0.01em] text-white shadow-ink transition-all duration-200 hover:bg-black active:scale-98 cursor-pointer"
          >
            Subscribe &amp; join the room
          </button>

          {/* Footnote */}
          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[11px] font-semibold text-faint">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 stroke-[2.1]" />
            <span>18+ only · discreet billing as “LX Media” · cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
