import { Check, Coins, Info, X } from "lucide-react";
import { CREATORS, type LiveRoom } from "../../data";
import { VerifiedBadge } from "../ui/VerifiedBadge";
import { useWalletStore } from "../../store/walletStore";

interface TicketSheetProps {
  room: LiveRoom;
  onClose: () => void;
  onPurchase: () => void;
}

export function TicketSheet({ room, onClose, onPurchase }: TicketSheetProps) {
  const creator = CREATORS.find((c) => c.id === room.creatorId);
  const creatorName = creator?.name || "Noor Adeyemi";
  const avatar = creator?.avatar || room.coverImage || "";
  const price = room.ticketPrice || 120;
  const coinsBalance = useWalletStore((s) => s.coinsBalance);

  const ticketIncludes = [
    "90-minute show + 48h replay",
    "Chat and reactions for ticket holders",
    "Tip goals unlock extra sets",
  ];

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden">
      {/* Blurred Poster Backdrop */}
      <div
        aria-hidden="true"
        className="absolute -inset-5 bg-[#24242b] bg-cover bg-center filter blur-[22px] saturate-80 brightness-[0.70]"
        style={{
          backgroundImage: `url("${room.streamPoster || room.coverImage || avatar}")`,
        }}
      />
      {/* Dark Scrim Overlay */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/35 to-ink/85"
      />

      {/* Top Chrome */}
      <div className="relative z-10 flex items-center gap-2 p-3 pt-6 sm:p-4 sm:pt-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close ticket view"
          className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-white/92 text-ink shadow-[0_6px_20px_-8px_rgba(18,18,24,0.5)] backdrop-blur-[10px] transition-all hover:bg-white active:scale-95 cursor-pointer"
        >
          <X className="h-[18px] w-[18px] stroke-[2.2]" />
        </button>
        <span className="flex items-center gap-1.5 rounded-full border border-[#e9d6ab] bg-gold-soft px-3 py-1.5 text-[11px] font-extrabold tracking-[0.06em] text-gold-deep shadow-sm">
          TICKETED SHOW
        </span>
        <span className="ml-auto rounded-full bg-white/92 px-3 py-2 text-[12px] font-bold text-ink shadow-[0_6px_20px_-8px_rgba(18,18,24,0.5)] backdrop-blur-[10px]">
          Starts 9:00pm
        </span>
      </div>

      {/* Center Show Hero */}
      <div className="relative z-10 mx-auto max-w-[340px] text-center px-4 py-4">
        {/* Ringed Large Avatar */}
        <div className="relative inline-block h-24 w-24">
          <span className="absolute -inset-1.5 rounded-full border-2 border-rose/60 animate-live-ring-ticket" />
          <span
            className="block h-24 w-24 rounded-full border-[3px] border-white bg-ink-soft shadow-[0_16px_40px_-12px_rgba(18,18,24,0.7)]"
            style={{
              backgroundImage: `url("${avatar}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>

        <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[18px] font-bold tracking-[-0.01em] text-white">
          <span>{creatorName}</span>
          <VerifiedBadge size={16} />
        </div>
        <h2 className="font-display text-[26px] leading-tight text-white mt-2">
          {room.title}
        </h2>
        <p className="mt-2 text-[13px] font-semibold text-white/75">
          90 minutes · 412 tickets claimed
        </p>
      </div>

      {/* Bottom Ticket Purchase Sheet */}
      <div className="relative z-10 p-3 pb-4 sm:p-4">
        <div className="mx-auto w-full max-w-[420px] rounded-[26px] border border-line bg-surface p-4 shadow-pop">
          {/* Price and Wallet Balance */}
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-ink/40">
                Entry
              </span>
              <div className="mt-1 flex items-center gap-2">
                <Coins className="h-5 w-5 stroke-[2.2] text-gold" />
                <span className="font-display text-[30px] leading-none text-ink">
                  {price} Coins
                </span>
              </div>
            </div>

            <div className="rounded-[14px] border border-[#e9d6ab] bg-gold-soft px-3 py-1.5 text-right">
              <span className="block text-[10.5px] font-bold tracking-[0.04em] text-gold-deep">
                YOUR BALANCE
              </span>
              <span className="block text-[14px] font-extrabold text-gold-deep mt-0.5">
                {coinsBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Includes Box */}
          <div className="my-3.5 flex flex-col gap-2 rounded-[18px] border border-line bg-paper p-3">
            {ticketIncludes.map((item) => (
              <span
                key={item}
                className="flex items-center gap-2.5 text-[12.5px] font-semibold text-ink-soft"
              >
                <Check className="h-3.5 w-3.5 shrink-0 stroke-[2.8] text-brand" />
                <span>{item}</span>
              </span>
            ))}
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={onPurchase}
            className="flex h-[50px] w-full items-center justify-center rounded-full bg-gold text-[14px] font-bold tracking-[-0.01em] text-white shadow-[0_12px_30px_-12px_rgba(184,121,28,0.9)] transition-all duration-200 hover:bg-gold-deep active:scale-98 cursor-pointer"
          >
            Get ticket · {price} Coins
          </button>

          {/* Policy Notice */}
          <div className="mt-3 flex items-start gap-2 rounded-2xl border border-line bg-paper p-2.5 text-[11.5px] leading-relaxed text-muted">
            <Info className="h-4 w-4 shrink-0 stroke-[2.1] text-muted mt-0.5" />
            <span className="text-pretty">
              By entering you confirm you&apos;re{" "}
              <strong className="font-bold text-ink-soft">18 or older</strong>.
              Recording is blocked and tickets are non-refundable once the show starts.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
