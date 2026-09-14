import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Crown,
  Gem,
  Images,
  Lock,
  Radio,
  ShieldCheck,
  Unlock,
  User,
  Volume2,
  VolumeX,
  X,
  ExternalLink,
} from 'lucide-react';
import type { Conversation } from '../../data/messagesData';
import { cn } from '../../utils/cn';

interface Props {
  conversation: Conversation;
  onClose: () => void;
  onTip: () => void;
  onUnlock: (messageId: string) => void;
  muted: boolean;
  onToggleMute: () => void;
}

export default function ChatProfilePanel({
  conversation,
  onClose,
  onTip,
  onUnlock,
  muted,
  onToggleMute,
}: Props) {
  const navigate = useNavigate();
  const { creator, messages } = conversation;
  const [activeMediaTab, setActiveMediaTab] = useState<'all' | 'unlocked' | 'locked'>('all');

  const mediaMessages = messages.filter((m) => m.type === 'ppv' || m.type === 'image');
  const lockedCount = mediaMessages.filter((m) => m.type === 'ppv' && !m.unlocked).length;
  const unlockedCount = mediaMessages.filter((m) => m.type === 'image' || (m.type === 'ppv' && m.unlocked)).length;

  const filteredMedia = mediaMessages.filter((m) => {
    if (activeMediaTab === 'unlocked') return m.type === 'image' || (m.type === 'ppv' && m.unlocked);
    if (activeMediaTab === 'locked') return m.type === 'ppv' && !m.unlocked;
    return true;
  });

  const handleProfileClick = () => {
    const cleanHandle = creator.handle.replace(/^@/, '');
    navigate(`/app/@${cleanHandle}`);
  };

  return (
    <aside className="flex h-full w-full flex-col border-l border-line bg-surface overflow-hidden">
      {/* Panel Top Bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
        <h3 className="text-sm font-bold text-ink">Creator Details</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-paper hover:text-ink transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
        {/* Creator Hero Header Card */}
        <div className="flex flex-col items-center rounded-2xl border border-line bg-paper/60 p-4 text-center shadow-xs">
          <div className="relative mb-3">
            <div
              className={cn(
                'rounded-full p-[2px]',
                creator.vip ? 'bg-gradient-to-tr from-gold to-gold-soft shadow-sm' : ''
              )}
            >
              <img
                src={creator.avatar}
                alt={creator.name}
                className="h-18 w-18 rounded-full object-cover ring-2 ring-surface"
              />
            </div>
            {creator.online && (
              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-surface bg-emerald-500 ring-1 ring-emerald-500/20" />
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <h2 className="text-[16px] font-bold text-ink">{creator.name}</h2>
            {creator.verified && <BadgeCheck className="h-4 w-4 fill-brand text-white" />}
          </div>

          <p className="text-xs text-muted font-medium mt-0.5">{creator.handle}</p>
          <p className="mt-1 text-[11.5px] text-ink-soft leading-relaxed max-w-[240px]">
            {creator.category}
          </p>

          {/* VIP Badge */}
          {creator.vip && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-gold-soft/30 px-3 py-1 text-[11px] font-bold text-gold ring-1 ring-gold/30">
              <Crown className="h-3.5 w-3.5" />
              <span>{creator.subscription}</span>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="mt-4 grid w-full grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onTip}
              className="flex flex-col items-center justify-center rounded-xl border border-line bg-surface p-2 text-ink shadow-2xs hover:border-brand/40 hover:text-brand transition-all cursor-pointer"
            >
              <Gem className="h-4 w-4 text-gold mb-1" />
              <span className="text-[10.5px] font-bold">Tip</span>
            </button>

            <button
              type="button"
              onClick={handleProfileClick}
              className="flex flex-col items-center justify-center rounded-xl border border-line bg-surface p-2 text-ink shadow-2xs hover:border-brand/40 hover:text-brand transition-all cursor-pointer"
            >
              <User className="h-4 w-4 text-brand mb-1" />
              <span className="text-[10.5px] font-bold">Profile</span>
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              className="flex flex-col items-center justify-center rounded-xl border border-line bg-surface p-2 text-ink shadow-2xs hover:border-rose/40 hover:text-rose transition-all cursor-pointer"
            >
              {muted ? (
                <VolumeX className="h-4 w-4 text-rose mb-1" />
              ) : (
                <Volume2 className="h-4 w-4 text-muted mb-1" />
              )}
              <span className="text-[10.5px] font-bold">{muted ? 'Unmute' : 'Mute'}</span>
            </button>
          </div>
        </div>

        {/* Media Vault Section */}
        <div className="rounded-2xl border border-line bg-paper/40 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Images className="h-4 w-4 text-brand" />
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                Shared Media
              </h4>
            </div>
            <span className="rounded-full bg-surface px-2 py-0.5 text-[10.5px] font-bold text-muted border border-line">
              {mediaMessages.length}
            </span>
          </div>

          {/* Media Filter Tabs */}
          <div className="flex gap-1 rounded-xl bg-surface p-1 border border-line mb-3">
            <button
              type="button"
              onClick={() => setActiveMediaTab('all')}
              className={cn(
                'flex-1 rounded-lg py-1 text-[11px] font-bold transition-all',
                activeMediaTab === 'all'
                  ? 'bg-ink text-white shadow-xs'
                  : 'text-muted hover:text-ink'
              )}
            >
              All ({mediaMessages.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveMediaTab('unlocked')}
              className={cn(
                'flex-1 rounded-lg py-1 text-[11px] font-bold transition-all',
                activeMediaTab === 'unlocked'
                  ? 'bg-ink text-white shadow-xs'
                  : 'text-muted hover:text-ink'
              )}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveMediaTab('locked')}
              className={cn(
                'flex-1 rounded-lg py-1 text-[11px] font-bold transition-all',
                activeMediaTab === 'locked'
                  ? 'bg-ink text-white shadow-xs'
                  : 'text-muted hover:text-ink'
              )}
            >
              Locked ({lockedCount})
            </button>
          </div>

          {/* Media Grid */}
          {filteredMedia.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted">
              No media in this category.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filteredMedia.map((m) => (
                <div
                  key={m.id}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-paper-warm shadow-xs"
                >
                  <img
                    src={m.mediaUrl}
                    alt=""
                    className={cn(
                      'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
                      m.type === 'ppv' && !m.unlocked ? 'blur-md' : ''
                    )}
                  />

                  {m.type === 'ppv' && !m.unlocked ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/40 p-1.5 text-center">
                      <Lock className="h-4 w-4 text-white" />
                      <span className="mt-0.5 text-[10px] font-bold text-white">
                        💎 {m.coins}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUnlock(m.id)}
                        className="mt-1 rounded-full bg-brand px-2.5 py-0.5 text-[9.5px] font-bold text-white hover:bg-brand-deep transition-colors cursor-pointer"
                      >
                        Unlock
                      </button>
                    </div>
                  ) : (
                    <div className="absolute bottom-1 left-1 rounded bg-ink/75 px-1 py-0.5 text-[9px] font-semibold text-white backdrop-blur-xs">
                      {m.mediaLabel ? m.mediaLabel.slice(0, 14) : 'Photo'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security / Privacy Card */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface p-3 text-[11px] text-muted">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Direct creator inbox. Securely encrypted and processed.</span>
        </div>
      </div>
    </aside>
  );
}
