import { useEffect } from "react";
import {
  BadgeCheck,
  Check,
  Coins,
  Radio,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { useCreatorStore } from "../../store/creatorStore";

const CREATOR_PERKS = [
  {
    icon: Coins,
    text: "Keep 90% of subscriptions & tips",
    color: "text-gold-deep bg-gold-soft",
  },
  {
    icon: Wallet,
    text: "Fast weekly payouts, no minimum",
    color: "text-brand bg-brand-soft",
  },
  {
    icon: Radio,
    text: "Go live & host ticketed shows",
    color: "text-rose bg-rose-soft",
    live: true,
  },
  {
    icon: BadgeCheck,
    text: "Verified badge on your profile",
    color: "text-brand bg-brand-soft",
  },
  {
    icon: Sparkles,
    text: "Custom tiers, pricing & perks",
    color: "text-gold-deep bg-gold-soft",
  },
];

export function BecomeCreatorModal() {
  const isModalOpen = useCreatorStore((s) => s.isModalOpen);
  const hasApplied = useCreatorStore((s) => s.hasApplied);
  const closeModal = useCreatorStore((s) => s.closeModal);
  const apply = useCreatorStore((s) => s.apply);
  const reset = useCreatorStore((s) => s.reset);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        reset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, reset]);

  // Lock body scroll
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Become a Creator"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Dimmed backdrop */}
      <div
        aria-hidden="true"
        onClick={reset}
        className="fixed inset-0 bg-ink/55 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-[420px] max-h-[90dvh] overflow-y-auto rounded-[28px] border border-line bg-surface p-6 sm:p-7 shadow-pop animate-scale-in quiet-scroll">
        {/* Top Right Close Button */}
        <button
          type="button"
          onClick={reset}
          aria-label="Close dialog"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-line bg-paper text-ink-soft transition-colors hover:bg-paper-warm hover:text-ink active:scale-95 cursor-pointer"
        >
          <X className="h-4 w-4" strokeWidth={2.2} />
        </button>

        {hasApplied ? (
          /* Confirmation Success State */
          <div className="py-6 text-center animate-fade-in">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eceefe] text-[#2431c6] shadow-sm">
              <Check className="h-7 w-7 stroke-[2.5]" />
            </span>
            <h2 className="mt-5 font-bold text-[22px] tracking-tight text-ink">
              You&apos;re on the list
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
              We&apos;ll review your profile and email you within 48 hours.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex rounded-full bg-ink px-8 py-3 text-[13.5px] font-bold text-white shadow-ink transition-all hover:bg-black active:scale-95 cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          /* Application Form & Perks State */
          <div>
            {/* Header Icon Squircle */}
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white shadow-card">
              <Sparkles className="h-5 w-5" />
            </span>

            {/* Headline & Subtitle */}
            <h2 className="mt-4 font-bold text-[22px] leading-tight tracking-tight text-ink">
              Become a Creator
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Turn your content into income — subscriptions, tips and live shows.
            </p>

            {/* Creator Perks List */}
            <div className="mt-5 space-y-3">
              {CREATOR_PERKS.map((perk, i) => {
                const Icon = perk.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${perk.color}`}
                    >
                      <Icon className="h-4 w-4 stroke-[2]" />
                    </span>
                    <span className="text-[13.5px] font-medium leading-snug text-ink-soft">
                      {perk.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={apply}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-[14px] font-bold text-white shadow-ink transition-all duration-200 hover:bg-black active:scale-[0.98] cursor-pointer"
            >
              Apply now
            </button>

            {/* Footer Trust Guarantee */}
            <p className="mt-2.5 text-center text-[11.5px] font-medium text-faint">
              No fees to apply · Free to join
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
