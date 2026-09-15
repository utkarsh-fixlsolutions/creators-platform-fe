import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Crown, Wallet, Eye, ArrowRight, Play, Lock } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import { useStudioContentStore } from '../../store/studioContentStore';
import { KPI_BY_RANGE, type StudioRange } from '../../data/studioData';
import { cn } from '../../utils/cn';

const RANGES: { id: StudioRange; label: string }[] = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: 'all', label: 'All time' },
];

export function StudioOverviewPage() {
  const navigate = useNavigate();
  const user = useSessionStore((s) => s.user);
  const contentItems = useStudioContentStore((s) => s.items);
  const [range, setRange] = useState<StudioRange>('7d');

  const kpi = KPI_BY_RANGE[range];
  const firstName = user?.displayName?.split(' ')[0] ?? 'Creator';
  const recent = contentItems.slice(0, 3);

  const stats = [
    { id: 'followers', label: 'Followers', value: kpi.followers.toLocaleString(), delta: kpi.followersDelta, icon: Users },
    { id: 'subscribers', label: 'Subscribers', value: kpi.subscribers.toLocaleString(), delta: kpi.subscribersDelta, icon: Crown },
    { id: 'earnings', label: 'Earnings', value: `$${kpi.earnings.toLocaleString()}`, delta: kpi.earningsDelta, icon: Wallet },
    { id: 'impressions', label: 'Post impressions', value: kpi.impressions >= 1000 ? `${(kpi.impressions / 1000).toFixed(0)}K` : kpi.impressions, delta: kpi.impressionsDelta, icon: Eye },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
          Good afternoon, {firstName} 👋
        </h1>
        <p className="text-sm text-muted mt-0.5">Let's create something amazing today.</p>
      </div>

      {/* Time range pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRange(r.id)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer',
              range === r.id ? 'bg-ink text-white shadow-2xs' : 'border border-line bg-surface text-muted hover:text-ink hover:border-line-strong'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* 2x2 KPI grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.id} className="rounded-[20px] border border-line bg-surface p-4 shadow-sm">
              <div className="flex items-center justify-between text-muted">
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em]">{s.label}</span>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <p className="text-xl sm:text-2xl font-bold text-ink tabular-nums">{s.value}</p>
                <span className="text-[11px] font-semibold text-emerald-600">{s.delta}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent content */}
      <section className="rounded-[24px] border border-line bg-surface p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-[15px] font-bold text-ink">Recent content</h2>
          <button
            type="button"
            onClick={() => navigate('/studio/content')}
            className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer"
          >
            See all <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="divide-y divide-line/70">
          {recent.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line bg-paper-deep">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-faint">
                    <Play className="h-4 w-4" />
                  </div>
                )}
                {item.status === 'subscribers' && (
                  <span className="absolute inset-0 grid place-items-center bg-ink/40 text-white">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink truncate">{item.title}</p>
                <p className="text-xs text-muted">
                  {item.meta} · {item.time}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold text-ink">{item.views.toLocaleString()} views</p>
                <p className="text-[11px] text-muted">{item.likes.toLocaleString()} likes</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
