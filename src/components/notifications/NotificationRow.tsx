import {
  AtSign,
  BadgeCheck,
  Coins,
  CreditCard,
  Lock,
  MessageSquare,
  Radio,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  UserPlus,
  X,
  type LucideIcon,
} from "lucide-react";
import type { NotificationItem, NotificationKind, NotificationTone } from "../../data";
import { VerifiedBadge } from "../ui/VerifiedBadge";
import { cn } from "../../utils/cn";

const KIND_ICONS: Record<NotificationKind, LucideIcon> = {
  post: Sparkles,
  live: Radio,
  message: MessageSquare,
  tip: Coins,
  follow: UserPlus,
  comment: MessageSquare,
  mention: AtSign,
  verified: ShieldCheck,
  renewal: RefreshCw,
  payout: CreditCard,
  shield: ShieldAlert,
  security: Lock,
  promo: Tag,
};

const TONE_STYLES: Record<
  NotificationTone,
  {
    iconBg: string;
    iconColor: string;
    tagBg: string;
    tagColor: string;
    tagBorder: string;
  }
> = {
  brand: {
    iconBg: "bg-brand",
    iconColor: "text-white",
    tagBg: "bg-brand-soft",
    tagColor: "text-brand",
    tagBorder: "border-brand-ring",
  },
  gold: {
    iconBg: "bg-gold",
    iconColor: "text-white",
    tagBg: "bg-gold-soft",
    tagColor: "text-gold-deep",
    tagBorder: "border-gold-ring",
  },
  rose: {
    iconBg: "bg-rose",
    iconColor: "text-white",
    tagBg: "bg-rose-soft",
    tagColor: "text-rose",
    tagBorder: "border-rose-ring",
  },
  ink: {
    iconBg: "bg-ink",
    iconColor: "text-white",
    tagBg: "bg-paper-deep",
    tagColor: "text-ink",
    tagBorder: "border-line-strong",
  },
};

interface NotificationRowProps {
  item: NotificationItem;
  onToggleRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onAction?: (item: NotificationItem) => void;
  compact?: boolean;
}

export function NotificationRow({
  item,
  onToggleRead,
  onDismiss,
  onAction,
  compact = false,
}: NotificationRowProps) {
  const Icon = KIND_ICONS[item.kind] || Sparkles;
  const tone = TONE_STYLES[item.tone] || TONE_STYLES.brand;

  return (
    <div
      className={cn(
        "relative transition-all duration-200 select-none group",
        compact
          ? cn(
              "flex gap-3 px-4 py-3 border-b border-[#f2f0ea] last:border-b-0",
              item.unread ? "bg-[#f7f8ff]" : "bg-surface hover:bg-paper/40"
            )
          : cn(
              "flex gap-3 p-3 sm:p-3.5 rounded-[20px] border shadow-card",
              item.unread
                ? "bg-[#f7f8ff] border-[#dfe2fb]"
                : "bg-surface border-line hover:border-line-strong hover:bg-paper/30"
            )
      )}
    >
      {/* Blue left unread indicator in compact view */}
      {compact && item.unread && (
        <span
          onClick={() => onToggleRead(item.id)}
          title="Mark as read"
          className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-brand cursor-pointer"
        />
      )}

      {/* Avatar with bottom-right micro badge */}
      <div className="relative shrink-0">
        <div
          className={cn(
            "rounded-full border border-line bg-paper-deep overflow-hidden flex items-center justify-center",
            compact ? "h-10 w-10" : "h-11 w-11"
          )}
        >
          {item.avatar ? (
            <img
              src={item.avatar}
              alt={item.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-xs font-bold text-ink-soft">
              {item.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Category micro badge */}
        <span
          className={cn(
            "absolute -right-1 -bottom-1 grid place-items-center rounded-full border-2",
            compact ? "h-[19px] w-[19px] border-surface" : "h-[21px] w-[21px] border-paper",
            tone.iconBg,
            tone.iconColor
          )}
        >
          <Icon className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} strokeWidth={2.4} />
        </span>

        {/* Live pulsing animation */}
        {item.pinging && (
          <span
            className={cn(
              "absolute -right-1 -bottom-1 rounded-full bg-rose opacity-60 animate-ping pointer-events-none",
              compact ? "h-[19px] w-[19px]" : "h-[21px] w-[21px]"
            )}
          />
        )}
      </div>

      {/* Center content */}
      <div className="min-w-0 flex-1 flex flex-col gap-1">
        <div className="text-[13.5px] sm:text-[14px] leading-snug text-ink-soft">
          <span className="font-bold text-ink">{item.name}</span>
          {item.verified && (
            <span className="inline-block ml-1 align-[-2px]">
              <VerifiedBadge size={14} />
            </span>
          )}
          <span> {item.text}</span>
        </div>

        {/* Optional quoted comment/reply snippet */}
        {item.quote && (
          <div className="text-[13px] leading-relaxed text-muted px-2.5 py-1.5 rounded-xl bg-paper border border-line mt-0.5">
            {item.quote}
          </div>
        )}

        {/* Meta row: Time, Tag, Action button */}
        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          <span className="text-[11.5px] font-semibold text-faint tracking-[-0.01em]">
            {item.time}
          </span>

          {item.tag && (
            <span
              className={cn(
                "text-[11px] font-bold px-2 py-0.5 rounded-full border",
                tone.tagBg,
                tone.tagColor,
                tone.tagBorder
              )}
            >
              {item.tag}
            </span>
          )}

          {item.action && (
            <button
              type="button"
              onClick={() => onAction?.(item)}
              className={cn(
                "ml-auto px-3.5 py-1 rounded-full text-[12px] font-bold border transition-all cursor-pointer select-none active:scale-95",
                item.unread
                  ? "bg-ink text-white border-ink hover:bg-ink-soft shadow-sm"
                  : "bg-paper text-ink border-line hover:bg-paper-warm"
              )}
            >
              {item.action}
            </button>
          )}
        </div>
      </div>

      {/* Optional locked/unlocked media thumbnail */}
      {item.media && (
        <div
          className={cn(
            "relative shrink-0 rounded-xl border border-line bg-paper-deep overflow-hidden self-center",
            compact ? "h-11 w-11" : "h-[54px] w-[54px] rounded-[14px]"
          )}
        >
          <img
            src={item.media}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {item.locked && (
            <span className="absolute inset-0 grid place-items-center bg-ink/45 text-white">
              <Lock className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2.4} />
            </span>
          )}
        </div>
      )}

      {/* Right controls: unread toggle dot & dismiss X */}
      <div className="flex flex-col items-center justify-between shrink-0 pl-1">
        {!compact && (
          <span
            onClick={() => onToggleRead(item.id)}
            title={item.unread ? "Mark as read" : "Mark as unread"}
            className={cn(
              "h-2.5 w-2.5 rounded-full cursor-pointer transition-all mt-1",
              item.unread ? "bg-brand scale-100" : "bg-transparent scale-0"
            )}
          />
        )}
        <button
          type="button"
          onClick={() => onDismiss(item.id)}
          title="Dismiss"
          className="grid h-6 w-6 place-items-center rounded-full text-faint hover:bg-paper-warm hover:text-ink transition-colors cursor-pointer mt-auto"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
