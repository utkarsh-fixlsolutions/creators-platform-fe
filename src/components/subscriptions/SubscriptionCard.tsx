import { useRef, useState } from "react";
import { Check, MessageCircle, MoreVertical, RefreshCw, XCircle } from "lucide-react";
import type { SubscriptionItem } from "../../store/subscriptionStore";
import { VerifiedBadge } from "../ui/VerifiedBadge";
import { useClickOutside } from "../../hooks/useClickOutside";

interface SubscriptionCardProps {
  subscription: SubscriptionItem;
  onMessage: (subscription: SubscriptionItem) => void;
  onTip: (subscription: SubscriptionItem) => void;
  onCancel: (id: string) => void;
  onRenew: (id: string) => void;
}

export function SubscriptionCard({
  subscription,
  onMessage,
  onTip,
  onCancel,
  onRenew,
}: SubscriptionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  const isExpired = subscription.status === "expired";
  const isRenewing = subscription.status === "renewing";

  let statusBg = "bg-[#eceefe] text-[#2431c6] border-[#c7cbfa]";
  let statusLabel = "Active";

  if (isRenewing) {
    statusBg = "bg-gold-soft text-gold-deep border-[#e9d6ab]";
    statusLabel = `Renews ${subscription.renews}`;
  } else if (isExpired) {
    statusBg = "bg-paper text-faint border-line";
    statusLabel = "Expired";
  }

  return (
    <div className="rounded-[22px] border border-line bg-surface p-3.5 sm:p-4 shadow-card transition-all duration-200 hover:shadow-card-hover">
      {/* Top Profile & Status Row */}
      <div className="flex items-center gap-3">
        <span
          className="h-12 w-12 shrink-0 rounded-full border border-line bg-paper-deep shadow-xs"
          style={{
            backgroundImage: `url("${subscription.avatar}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="truncate text-[14.5px] font-bold text-ink">
              {subscription.name}
            </span>
            {subscription.verified && <VerifiedBadge size={14} />}
          </div>
          <p className="mt-1 text-[12px] leading-none text-muted">
            {subscription.tier} Tier · {subscription.price} Coins/mo
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap shadow-2xs ${statusBg}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Action Buttons Row */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onMessage(subscription)}
          className="flex-1 rounded-full border border-line bg-paper py-2 text-center text-[12.5px] font-bold text-ink transition-all hover:bg-paper-deep active:scale-98 cursor-pointer"
        >
          Message
        </button>
        <button
          type="button"
          onClick={() => onTip(subscription)}
          className="flex-1 rounded-full border border-[#e9d6ab] bg-gold-soft py-2 text-center text-[12.5px] font-bold text-gold-deep transition-all hover:brightness-95 active:scale-98 cursor-pointer"
        >
          Tip
        </button>

        {/* Manage Overflow Menu */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Manage subscription"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:bg-paper hover:text-ink cursor-pointer"
          >
            <MoreVertical className="h-4 w-4 stroke-[2.1]" />
          </button>

          {menuOpen && (
            <div className="animate-scale-in absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-pop">
              {!isExpired ? (
                <>
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-faint">
                    Auto-Renew ON
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onCancel(subscription.id);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-rose hover:bg-rose-soft/60 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4 text-rose" />
                    <span>Cancel subscription</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onRenew(subscription.id);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-brand hover:bg-brand-soft cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4 text-brand" />
                  <span>Renew ({subscription.price} Coins)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
