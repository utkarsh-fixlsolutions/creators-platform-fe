import { useMemo, useState } from 'react';
import { Settings, Crown, Coins, Heart, MessageSquare, AtSign, UserPlus, Sparkles, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STUDIO_NOTIFICATIONS, type StudioNotificationKind } from '../../data/studioData';
import { cn } from '../../utils/cn';

type Tab = 'all' | 'subscriptions' | 'tips' | 'comments' | 'mentions';

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'tips', label: 'Tips' },
  { id: 'comments', label: 'Comments' },
  { id: 'mentions', label: 'Mentions' },
];

const KIND_TO_TAB: Record<StudioNotificationKind, Tab> = {
  subscription: 'subscriptions',
  tip: 'tips',
  comment: 'comments',
  mention: 'mentions',
  like: 'all',
  follower: 'all',
  milestone: 'all',
};

const KIND_ICON: Record<StudioNotificationKind, LucideIcon> = {
  subscription: Crown,
  tip: Coins,
  like: Heart,
  comment: MessageSquare,
  mention: AtSign,
  follower: UserPlus,
  milestone: Sparkles,
};

const KIND_STYLE: Record<StudioNotificationKind, string> = {
  subscription: 'bg-brand text-white',
  tip: 'bg-gold text-white',
  like: 'bg-rose text-white',
  comment: 'bg-ink text-white',
  mention: 'bg-brand text-white',
  follower: 'bg-emerald-500 text-white',
  milestone: 'bg-gold text-white',
};

export function StudioNotificationsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('all');

  const filtered = useMemo(
    () => STUDIO_NOTIFICATIONS.filter((n) => tab === 'all' || KIND_TO_TAB[n.kind] === tab),
    [tab]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Notifications</h1>
        <button
          type="button"
          onClick={() => navigate('/studio/settings')}
          aria-label="Notification settings"
          className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface hover:text-ink cursor-pointer"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer',
              tab === t.id ? 'bg-ink text-white shadow-2xs' : 'border border-line bg-surface text-muted hover:text-ink hover:border-line-strong'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-[24px] border border-line bg-surface shadow-sm divide-y divide-line/70">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-xs text-muted">Nothing here yet.</p>
        ) : (
          filtered.map((item) => {
            const Icon = KIND_ICON[item.kind];
            return (
              <div key={item.id} className={cn('flex items-center gap-3 p-4', item.unread && 'bg-brand-soft/40')}>
                <div className="relative shrink-0">
                  <div className="h-11 w-11 rounded-full border border-line bg-paper-deep overflow-hidden flex items-center justify-center">
                    {item.avatar ? (
                      <img src={item.avatar} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-muted" />
                    )}
                  </div>
                  <span className={cn('absolute -right-1 -bottom-1 grid h-[21px] w-[21px] place-items-center rounded-full border-2 border-surface', KIND_STYLE[item.kind])}>
                    <Icon className="h-3 w-3" strokeWidth={2.4} />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] leading-snug text-ink-soft">
                    <span className="font-bold text-ink">{item.name}</span> {item.text}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-faint font-semibold">{item.time}</p>
                </div>
                {item.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
