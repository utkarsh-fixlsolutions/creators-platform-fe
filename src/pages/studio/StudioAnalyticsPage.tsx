import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Crown, Wallet, Eye, ArrowRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useStudioContentStore } from '../../store/studioContentStore';
import {
  KPI_BY_RANGE,
  TRAFFIC_SOURCES,
  EARNINGS_BALANCE,
  audienceSeriesForRange,
  type StudioRange,
} from '../../data/studioData';
import { cn } from '../../utils/cn';

const RANGES: { id: StudioRange; label: string }[] = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: 'all', label: 'All time' },
];

type Tab = 'overview' | 'content' | 'audience' | 'earnings';
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'content', label: 'Content' },
  { id: 'audience', label: 'Audience' },
  { id: 'earnings', label: 'Earnings' },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 shadow-card text-xs">
      <p className="font-semibold text-ink">{label}</p>
      <p className="text-muted">{payload[0].value.toLocaleString()} followers</p>
    </div>
  );
}

export function StudioAnalyticsPage() {
  const navigate = useNavigate();
  const contentItems = useStudioContentStore((s) => s.items);
  const [range, setRange] = useState<StudioRange>('30d');
  const [tab, setTab] = useState<Tab>('overview');

  const kpi = KPI_BY_RANGE[range];
  const series = useMemo(() => audienceSeriesForRange(range), [range]);

  const topContent = useMemo(
    () => [...contentItems].sort((a, b) => b.views - a.views).slice(0, 5),
    [contentItems]
  );

  const stats = [
    { id: 'followers', label: 'Followers', value: kpi.followers.toLocaleString(), delta: kpi.followersDelta, icon: Users },
    { id: 'subscribers', label: 'Subscribers', value: kpi.subscribers.toLocaleString(), delta: kpi.subscribersDelta, icon: Crown },
    { id: 'earnings', label: 'Total earnings', value: `$${kpi.earnings.toLocaleString()}`, delta: kpi.earningsDelta, icon: Wallet },
    { id: 'impressions', label: 'Post impressions', value: kpi.impressions >= 1000 ? `${(kpi.impressions / 1000).toFixed(0)}K` : kpi.impressions, delta: kpi.impressionsDelta, icon: Eye },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Analytics</h1>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as StudioRange)}
          className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold text-ink outline-none cursor-pointer"
        >
          {RANGES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tab row */}
      <div className="inline-flex rounded-full border border-line bg-surface p-1 shadow-card overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer',
              tab === t.id ? 'bg-ink text-white' : 'text-muted hover:text-ink'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
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

          <section className="rounded-[24px] border border-line bg-surface p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-ink">Audience growth</h2>
              <span className="text-xs font-semibold text-emerald-600">{kpi.followersDelta}</span>
            </div>
            <div className="h-56 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="audienceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--color-line)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                    axisLine={{ stroke: 'var(--color-line)' }}
                    tickLine={false}
                  />
                  <YAxis hide domain={['dataMin - 2000', 'dataMax + 2000']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="followers"
                    stroke="var(--color-brand)"
                    strokeWidth={2.5}
                    fill="url(#audienceFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-[24px] border border-line bg-surface p-5 sm:p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-ink mb-4">Where your audience comes from</h2>
            <div className="space-y-3">
              {TRAFFIC_SOURCES.map((src) => (
                <div key={src.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-ink">{src.label}</span>
                    <span className="font-semibold text-muted">{src.percent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-paper-deep overflow-hidden">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${src.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {tab === 'content' && (
        <section className="rounded-[24px] border border-line bg-surface p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-[15px] font-bold text-ink">Top performing content</h2>
            <button
              type="button"
              onClick={() => navigate('/studio/content')}
              className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline cursor-pointer"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-line/70">
            {topContent.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="w-5 text-xs font-bold text-faint tabular-nums">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink truncate">{item.title}</p>
                  <p className="text-xs text-muted">{item.likes.toLocaleString()} likes</p>
                </div>
                <span className="text-sm font-bold text-ink tabular-nums shrink-0">{item.views.toLocaleString()} views</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'audience' && (
        <section className="rounded-[24px] border border-line bg-surface p-5 sm:p-6 shadow-sm">
          <h2 className="text-[15px] font-bold text-ink mb-4">Where your audience comes from</h2>
          <div className="space-y-3">
            {TRAFFIC_SOURCES.map((src) => (
              <div key={src.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-ink">{src.label}</span>
                  <span className="font-semibold text-muted">{src.percent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-paper-deep overflow-hidden">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${src.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'earnings' && (
        <section className="rounded-[24px] bg-ink p-6 text-white shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-white/55">Total balance</p>
          <p className="mt-1 text-3xl font-extrabold tracking-[-0.02em]">${EARNINGS_BALANCE.total.toLocaleString()}</p>
          <p className="mt-1 text-xs text-emerald-300">{EARNINGS_BALANCE.totalDelta}</p>
          <button
            type="button"
            onClick={() => navigate('/studio/earnings')}
            className="mt-5 rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-deep transition-all cursor-pointer"
          >
            View full earnings
          </button>
        </section>
      )}
    </div>
  );
}
