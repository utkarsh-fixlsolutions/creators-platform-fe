import { useMemo, useState } from 'react';
import { Search, Crown, Lock, CheckCheck } from 'lucide-react';
import type { Conversation, Message } from '../../data/messagesData';
import { cn } from '../../utils/cn';

type Filter = 'all' | 'vip' | 'ppv' | 'unread';

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

function snippet(m: Message | undefined) {
  if (!m) return '';
  const who = m.sender === 'fan' ? 'You: ' : '';
  switch (m.type) {
    case 'ppv':
      return `${who}🔒 ${m.mediaLabel || 'Exclusive Drop'}`;
    case 'voice':
      return `${who}🎙️ Voice memo (0:${String(m.duration || 20).padStart(2, '0')})`;
    case 'tip':
      return `${who}💎 Sent a ${m.tipAmount} coin tip`;
    case 'image':
      return `${who}📷 Photo attachment`;
    default:
      return `${who}${m.text || ''}`;
  }
}

export default function ConversationList({ conversations, activeId, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filters: { id: Filter; label: string; icon?: React.ReactNode }[] = [
    { id: 'all', label: 'All' },
    { id: 'vip', label: 'VIP Passes', icon: <Crown className="h-3 w-3 text-gold" /> },
    { id: 'ppv', label: 'Locked Drops', icon: <Lock className="h-3 w-3 text-gold" /> },
    { id: 'unread', label: 'Unread' },
  ];

  const list = useMemo(() => {
    return conversations.filter((c) => {
      const q = query.toLowerCase();
      const matches =
        !q ||
        c.creator.name.toLowerCase().includes(q) ||
        c.creator.handle.toLowerCase().includes(q) ||
        c.creator.category.toLowerCase().includes(q);
      if (!matches) return false;
      if (filter === 'vip') return c.creator.vip;
      if (filter === 'ppv') return c.messages.some((m) => m.type === 'ppv' && !m.unlocked);
      if (filter === 'unread') return c.unread > 0;
      return true;
    });
  }, [conversations, query, filter]);

  const totalUnread = conversations.reduce((a, c) => a + c.unread, 0);

  return (
    <div className="flex h-full flex-col bg-surface border-r border-line">
      {/* Editorial Header */}
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
              Direct Messages
            </h1>
            {totalUnread > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white shadow-sm">
                {totalUnread}
              </span>
            )}
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-full border border-line bg-paper/60 py-2 pl-9 pr-4 text-[13.5px] text-ink outline-none transition placeholder:text-muted focus:border-brand/50 focus:bg-surface focus:ring-2 focus:ring-brand/10"
          />
        </div>

        {/* Filter Pills */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
          {filters.map((f) => {
            const isActive = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  'flex items-center gap-1 shrink-0 rounded-full px-3 py-1 text-[12px] font-medium transition-all select-none',
                  isActive
                    ? 'bg-ink text-white shadow-sm'
                    : 'bg-paper text-muted hover:bg-paper-warm hover:text-ink'
                )}
              >
                {f.icon}
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-line/60">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-sm font-semibold text-ink">No conversations found</p>
            <p className="mt-1 text-xs text-muted">Try selecting another filter or search keyword.</p>
          </div>
        ) : (
          list.map((c) => {
            const active = c.id === activeId;
            const lastMsg = c.messages[c.messages.length - 1];
            const hasLocked = c.messages.some((m) => m.type === 'ppv' && !m.unlocked);

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={cn(
                  'relative flex w-full items-start gap-3.5 px-4 py-3.5 text-left transition-all duration-150',
                  active
                    ? 'bg-paper border-l-4 border-l-brand'
                    : 'hover:bg-paper/50 active:bg-paper'
                )}
              >
                {/* Creator Avatar with Online Beacon */}
                <div className="relative shrink-0">
                  <div
                    className={cn(
                      'rounded-full p-[1.5px]',
                      c.creator.vip
                        ? 'bg-gradient-to-tr from-gold to-gold-soft'
                        : 'bg-transparent'
                    )}
                  >
                    <img
                      src={c.creator.avatar}
                      alt={c.creator.name}
                      className="h-11 w-11 rounded-full object-cover ring-1 ring-line"
                    />
                  </div>
                  {c.creator.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface bg-emerald-500" />
                  )}
                </div>

                {/* Info & Last Message */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="truncate text-[14px] font-semibold text-ink">
                        {c.creator.name}
                      </span>
                      {c.creator.vip && (
                        <Crown className="h-3 w-3 shrink-0 text-gold" />
                      )}
                    </div>
                    <span className="shrink-0 text-[11px] font-medium text-muted">
                      {c.lastTime}
                    </span>
                  </div>

                  <p className="truncate text-[12px] text-muted-strong font-medium mt-0.5">
                    {c.creator.handle}
                  </p>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="truncate text-[12.5px] text-muted">
                      {snippet(lastMsg)}
                    </p>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {hasLocked && (
                        <span className="flex items-center gap-0.5 rounded-full bg-gold-soft/30 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                          <Lock className="h-2.5 w-2.5" /> Drop
                        </span>
                      )}
                      {c.unread > 0 && (
                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
