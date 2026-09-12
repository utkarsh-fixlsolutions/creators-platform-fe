import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BadgeCheck, Crown, Gem, Images, MoreVertical, BellOff, User, Flag } from 'lucide-react';
import type { Creator } from '../../data/messagesData';
import { cn } from '../../utils/cn';

interface Props {
  creator: Creator;
  onBack: () => void;
  onTip: () => void;
  onToggleVault: () => void;
  vaultOpen: boolean;
  muted: boolean;
  onToggleMute: () => void;
}

export default function ChatHeader({
  creator,
  onBack,
  onTip,
  onToggleVault,
  vaultOpen,
  muted,
  onToggleMute,
}: Props) {
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-line bg-surface/95 px-4 py-3 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3 min-w-0">
        {/* Back Button (Mobile only) */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to messages inbox"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-paper hover:text-ink md:hidden transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Creator Avatar */}
        <div className="relative shrink-0">
          <div
            className={cn(
              'rounded-full p-[1.5px]',
              creator.vip ? 'bg-gradient-to-tr from-gold to-gold-soft' : ''
            )}
          >
            <img
              src={creator.avatar}
              alt={creator.name}
              className="h-10 w-10 rounded-full object-cover ring-1 ring-line"
            />
          </div>
          {creator.online && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface bg-emerald-500" />
          )}
        </div>

        {/* Name, Verified, VIP & Subscription metadata */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 truncate">
            <h2 className="truncate text-[15px] font-semibold text-ink">
              {creator.name}
            </h2>
            {creator.verified && (
              <BadgeCheck className="h-4 w-4 shrink-0 fill-brand text-white" />
            )}
            {creator.vip && (
              <span className="hidden items-center gap-1 rounded-full bg-gold-soft/30 px-2 py-0.5 text-[10px] font-bold text-gold ring-1 ring-gold/20 sm:inline-flex">
                <Crown className="h-3 w-3" /> VIP Pass
              </span>
            )}
          </div>
          <p className="truncate text-xs text-muted">
            {creator.online ? (
              <span className="text-emerald-600 font-medium">Online now</span>
            ) : (
              'Active recently'
            )}{' '}
            · {creator.subscription}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Send Tip Button */}
        <button
          type="button"
          onClick={onTip}
          className="flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-deep hover:shadow-card active:scale-95"
        >
          <Gem className="h-3.5 w-3.5 text-amber-300" />
          <span className="hidden sm:inline">Tip</span>
        </button>

        {/* Media Vault Toggle */}
        <button
          type="button"
          onClick={onToggleVault}
          title="Media Vault"
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full transition-all',
            vaultOpen
              ? 'bg-ink text-white'
              : 'text-muted hover:bg-paper hover:text-ink active:scale-95'
          )}
        >
          <Images className="h-4 w-4" />
        </button>

        {/* More Actions Menu */}
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-label="More options"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-paper hover:text-ink active:scale-95 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menu && (
            <div className="absolute right-0 top-11 z-30 w-48 overflow-hidden rounded-2xl border border-line bg-surface py-1.5 shadow-float animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  onToggleMute();
                  setMenu(false);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-ink hover:bg-paper transition-colors"
              >
                <BellOff className="h-4 w-4 text-muted" />
                <span>{muted ? 'Unmute notifications' : 'Mute notifications'}</span>
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-ink hover:bg-paper transition-colors"
              >
                <User className="h-4 w-4 text-muted" />
                <span>View Creator Profile</span>
              </button>
              <div className="my-1 border-t border-line" />
              <button
                type="button"
                className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose hover:bg-rose-50 transition-colors"
              >
                <Flag className="h-4 w-4" />
                <span>Report Conversation</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
