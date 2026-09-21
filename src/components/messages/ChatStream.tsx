import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Lock, Play, Pause, Gem, Unlock, Sparkles, Video } from 'lucide-react';
import type { Conversation, Message } from '../../data/messagesData';
import { cn } from '../../utils/cn';

interface Props {
  conversation: Conversation;
  typing: boolean;
  onUnlock: (messageId: string) => void;
  justUnlockedId: string | null;
  /** Whose messages render right-aligned as "mine" — defaults to the fan's view. */
  viewerRole?: 'fan' | 'creator';
  typingLabel?: string;
  noticeText?: ReactNode;
}

/* ---------- Voice Memo Player Component ---------- */
const BARS = Array.from({ length: 32 }, (_, i) => 6 + Math.abs(Math.sin(i * 1.6) * 14) + (i % 3) * 2.5);

function VoiceMemo({ m, mine }: { m: Message; mine: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const dur = m.duration || 20;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setT((v) => {
        if (v >= dur) {
          setPlaying(false);
          return 0;
        }
        return v + 0.1;
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing, dur]);

  const progress = t / dur;
  const fmt = (s: number) => `0:${String(Math.floor(s)).padStart(2, '0')}`;

  return (
    <div
      className={cn(
        'flex w-[260px] sm:w-[280px] items-center gap-3 rounded-2xl p-3 shadow-sm transition-all',
        mine ? 'bg-brand text-white' : 'bg-surface border border-line text-ink'
      )}
    >
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow transition-all active:scale-95',
          mine ? 'bg-white text-brand' : 'bg-brand text-white'
        )}
      >
        {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
      </button>

      <div className="flex-1">
        <div
          className="flex h-7 cursor-pointer items-center gap-[2px]"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setT(((e.clientX - r.left) / r.width) * dur);
          }}
        >
          {BARS.map((h, i) => {
            const active = i / BARS.length <= progress;
            return (
              <span
                key={i}
                style={{
                  height: playing && active ? `${Math.min(26, h + 6)}px` : `${h}px`,
                }}
                className={cn(
                  'w-[3px] rounded-full transition-all duration-200',
                  mine
                    ? active
                      ? 'bg-white'
                      : 'bg-white/40'
                    : active
                    ? 'bg-brand'
                    : 'bg-line-strong'
                )}
              />
            );
          })}
        </div>
        <div
          className={cn(
            'mt-1 flex justify-between text-[10.5px] font-medium',
            mine ? 'text-white/80' : 'text-muted'
          )}
        >
          <span>{fmt(t)}</span>
          <span>{fmt(dur)}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Locked PPV Drop Card ---------- */
function PPVCard({
  m,
  onUnlock,
  celebrate,
}: {
  m: Message;
  onUnlock: () => void;
  celebrate: boolean;
}) {
  return (
    <div className="w-[280px] sm:w-[320px] overflow-hidden rounded-2xl bg-surface border border-line shadow-card">
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-warm">
        <img
          src={m.mediaUrl}
          alt={m.mediaLabel || 'Drop preview'}
          className={cn(
            'h-full w-full object-cover transition-all duration-700',
            m.unlocked ? 'scale-100 blur-0' : 'scale-110 blur-lg'
          )}
        />

        {!m.unlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-ink/30 via-ink/50 to-ink/75 backdrop-blur-[2px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface/20 ring-1 ring-white/50 backdrop-blur-md">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <p className="mt-2.5 text-[11px] font-bold uppercase tracking-widest text-white/95">
              VIP Collector Drop
            </p>
          </div>
        )}

        {m.unlocked && m.mediaKind === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface/90 text-ink shadow-lg">
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            </div>
          </div>
        )}

        {celebrate && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand/30 backdrop-blur-sm animate-fade-in">
            <Sparkles className="h-10 w-10 text-amber-300 animate-spin" />
            <p className="mt-2 text-xs font-bold text-white">Drop Unlocked!</p>
          </div>
        )}
      </div>

      <div className="p-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[13px] font-semibold text-ink">
            {m.mediaLabel || 'Exclusive Master Cut'}
          </p>
          {m.mediaKind === 'video' && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-[10px] font-bold text-muted uppercase">
              <Video className="h-3 w-3" /> 4K
            </span>
          )}
        </div>

        {m.unlocked ? (
          <div className="mt-2.5 flex items-center justify-between border-t border-line/60 pt-2 text-xs text-emerald-600 font-semibold">
            <span className="flex items-center gap-1">
              <Unlock className="h-3.5 w-3.5" /> Unlocked & Saved
            </span>
            <span className="text-[11px] text-muted font-normal">In your Vault</span>
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/60 pt-2.5">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-muted">Price:</span>
              <span className="text-[13px] font-bold text-ink">
                💎 {m.coins} coins
              </span>
              <span className="text-[11px] text-muted">(${m.price})</span>
            </div>

            <button
              type="button"
              onClick={onUnlock}
              className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand transition-all active:scale-95"
            >
              <Lock className="h-3 w-3" />
              <span>Unlock Drop</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Main ChatStream Component ---------- */
export default function ChatStream({
  conversation,
  typing,
  onUnlock,
  justUnlockedId,
  viewerRole = 'fan',
  typingLabel,
  noticeText,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, typing]);

  return (
    <div className="flex-1 overflow-y-auto bg-paper px-4 py-6 sm:px-6 no-scrollbar">
      <div className="mx-auto max-w-3xl w-full space-y-4">
        {/* Encryption & Safety Notice */}
        <div className="mx-auto max-w-sm rounded-2xl border border-line bg-surface/70 px-4 py-2 text-center text-[11px] text-muted shadow-xs backdrop-blur-sm">
          {noticeText ?? (
            <>
              🔒 Direct message stream with <span className="font-semibold text-ink">{conversation.creator.name}</span>. Tips and drops support the creator directly.
            </>
          )}
        </div>

        {/* Message Timeline */}
        {conversation.messages.map((m) => {
          const mine = m.sender === viewerRole;

          return (
            <div
              key={m.id}
              className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}
            >
              {/* PPV Card */}
              {m.type === 'ppv' && (
                <PPVCard
                  m={m}
                  onUnlock={() => onUnlock(m.id)}
                  celebrate={justUnlockedId === m.id}
                />
              )}

              {/* Voice Memo */}
              {m.type === 'voice' && <VoiceMemo m={m} mine={mine} />}

              {/* Photo Attachment */}
              {m.type === 'image' && (
                <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
                  <img
                    src={m.mediaUrl}
                    alt="Attachment"
                    className="max-h-72 max-w-[280px] sm:max-w-xs object-cover"
                  />
                </div>
              )}

              {/* Coin Tip Event */}
              {m.type === 'tip' && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-yellow-50/80 px-4 py-2.5 shadow-sm text-ink">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400/20 text-gold">
                    <Gem className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-amber-900">
                      💎 Sent a {m.tipAmount} coin tip
                    </p>
                    {m.text && <p className="text-xs text-amber-800/90 mt-0.5">{m.text}</p>}
                  </div>
                </div>
              )}

              {/* Standard Text Bubble */}
              {m.type === 'text' && (
                <div
                  className={cn(
                    'max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-xs break-words',
                    mine
                      ? 'rounded-br-sm bg-brand text-white font-medium'
                      : 'rounded-bl-sm bg-surface border border-line text-ink'
                  )}
                >
                  {m.text}
                </div>
              )}

              {/* Timestamp */}
              <span className="mt-1 px-1 text-[10px] font-medium text-muted">
                {m.time}
              </span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typing && (
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 shadow-xs w-fit">
            <span className="h-2 w-2 rounded-full bg-muted animate-bounce" />
            <span className="h-2 w-2 rounded-full bg-muted animate-bounce [animation-delay:0.2s]" />
            <span className="h-2 w-2 rounded-full bg-muted animate-bounce [animation-delay:0.4s]" />
            <span className="text-xs text-muted font-medium ml-1">
              {typingLabel ?? `${conversation.creator.name} is typing...`}
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
