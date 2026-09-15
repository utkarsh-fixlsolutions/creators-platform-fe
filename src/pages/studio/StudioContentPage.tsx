import { useMemo, useState } from 'react';
import { Search, Play, Lock, Heart, Eye, MoreHorizontal } from 'lucide-react';
import { useStudioContentStore } from '../../store/studioContentStore';
import type { ContentType } from '../../data/studioData';
import { cn } from '../../utils/cn';

type FilterType = 'all' | ContentType;

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'video', label: 'Videos' },
  { id: 'image', label: 'Images' },
  { id: 'text', label: 'Text' },
  { id: 'live', label: 'Live' },
];

export function StudioContentPage() {
  const items = useStudioContentStore((s) => s.items);
  const [filter, setFilter] = useState<FilterType>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filter !== 'all' && item.type !== filter) return false;
      if (query && !item.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [items, filter, query]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Content</h1>
        <div className="relative w-40 sm:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full rounded-full border border-line bg-surface py-1.5 pl-8 pr-3 text-xs text-ink outline-none placeholder:text-muted focus:border-brand/40 focus:ring-2 focus:ring-brand/10"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer',
              filter === f.id ? 'bg-ink text-white shadow-2xs' : 'border border-line bg-surface text-muted hover:text-ink hover:border-line-strong'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-[24px] border border-line bg-surface shadow-sm divide-y divide-line/70">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-xs text-muted">No content in this filter yet.</p>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="flex items-center gap-3.5 p-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-line bg-paper-deep">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-faint">
                    <Play className="h-5 w-5" />
                  </div>
                )}
                {item.status === 'subscribers' && (
                  <span className="absolute inset-0 grid place-items-center bg-ink/40 text-white">
                    <Lock className="h-4 w-4" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink truncate">{item.title}</p>
                <p className="text-xs text-muted mt-0.5 capitalize">
                  {item.type} · {item.meta}
                </p>
                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {item.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" /> {item.likes.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[10.5px] font-bold',
                    item.status === 'published' && 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
                    item.status === 'subscribers' && 'bg-brand-soft text-brand border border-brand-ring',
                    item.status === 'draft' && 'bg-paper-deep text-muted border border-line'
                  )}
                >
                  {item.status === 'published' ? 'Published' : item.status === 'subscribers' ? 'Subscribers only' : 'Draft'}
                </span>
                <button type="button" className="text-muted hover:text-ink cursor-pointer">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
