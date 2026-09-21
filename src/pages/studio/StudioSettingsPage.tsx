import { useCallback, useRef, useState } from 'react';
import {
  Settings as SettingsIcon,
  Crown,
  Wallet,
  Palette,
  Link2,
  HelpCircle,
  ChevronRight,
  Camera,
  Check,
} from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import { KPI_BY_RANGE } from '../../data/studioData';
import { Toast } from '../../components/Toast';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';
import { cn } from '../../utils/cn';

export function StudioSettingsPage() {
  const user = useSessionStore((s) => s.user);
  const setUser = useSessionStore((s) => s.setUser);

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [handle, setHandle] = useState(user?.handle ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const kpi = KPI_BY_RANGE['30d'];

  const handleSave = () => {
    if (!user) return;
    setUser({ ...user, displayName: displayName.trim() || user.displayName, handle: handle.trim() || user.handle, bio: bio.trim() });
    notify('Profile updated ✨');
    setEditing(false);
  };

  const menuItems = [
    { id: 'creator-settings', label: 'Creator settings', icon: SettingsIcon, enabled: true },
    { id: 'tiers', label: 'Subscription tiers', icon: Crown, enabled: false },
    { id: 'payouts', label: 'Payout settings', icon: Wallet, enabled: false },
    { id: 'customization', label: 'Profile customization', icon: Palette, enabled: false },
    { id: 'link-in-bio', label: 'Link in bio', icon: Link2, enabled: false },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, enabled: false },
  ];

  return (
    <div className="space-y-4">
      {/* Cover + avatar */}
      <section className="overflow-hidden rounded-[24px] border border-line bg-surface shadow-sm">
        <div className="h-28 bg-gradient-to-br from-brand-soft via-paper-deep to-gold-soft" />
        <div className="px-5 sm:px-6 pb-5">
          <div className="flex items-end justify-between -mt-8">
            <div className="relative">
              <img
                src={user?.avatarUrl}
                alt={user?.displayName}
                className="h-16 w-16 rounded-full object-cover border-4 border-surface shadow-card"
              />
              <span className="absolute bottom-0 right-0 grid h-6 w-6 place-items-center rounded-full bg-ink text-white border-2 border-surface">
                <Camera className="h-3 w-3" />
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="mb-1 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold text-ink hover:border-line-strong transition-colors cursor-pointer"
            >
              {editing ? 'Cancel' : 'Edit profile'}
            </button>
          </div>

          {!editing ? (
            <>
              <div className="mt-2.5 flex items-center gap-1">
                <h1 className="text-lg font-bold text-ink">{user?.displayName}</h1>
                <VerifiedBadge size={15} />
              </div>
              <p className="text-xs text-muted">@{user?.handle}</p>
              {user?.bio && <p className="mt-2 text-sm text-ink-soft leading-relaxed">{user.bio}</p>}
            </>
          ) : (
            <div className="mt-3 space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-muted uppercase tracking-wide">Display name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper/60 px-3.5 py-2 text-sm text-ink outline-none focus:border-brand/40 focus:bg-surface"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted uppercase tracking-wide">Handle</label>
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-line bg-paper/60 px-3.5 py-2 text-sm text-ink outline-none focus:border-brand/40 focus:bg-surface"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted uppercase tracking-wide">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="mt-1 w-full resize-none rounded-xl border border-line bg-paper/60 px-3.5 py-2 text-sm text-ink outline-none focus:border-brand/40 focus:bg-surface"
                />
              </div>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-brand transition-colors cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" /> Save changes
              </button>
            </div>
          )}

          {/* Stat row */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4">
            <div>
              <p className="text-base font-bold text-ink">{kpi.followers.toLocaleString()}</p>
              <p className="text-[11px] text-muted">Followers</p>
            </div>
            <div>
              <p className="text-base font-bold text-ink">{kpi.subscribers.toLocaleString()}</p>
              <p className="text-[11px] text-muted">Subscribers</p>
            </div>
            <div>
              <p className="text-base font-bold text-ink">{(kpi.impressions / 1000).toFixed(0)}K</p>
              <p className="text-[11px] text-muted">Post views</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu list */}
      <section className="rounded-[24px] border border-line bg-surface shadow-sm divide-y divide-line/70">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => (item.enabled ? setEditing(true) : notify(`${item.label} — coming soon`))}
              className={cn(
                'flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors cursor-pointer',
                item.enabled ? 'hover:bg-paper' : 'opacity-60 hover:bg-paper/60'
              )}
            >
              <Icon className="h-4 w-4 text-muted" />
              <span className="flex-1 text-sm font-medium text-ink">{item.label}</span>
              {!item.enabled && <span className="text-[10px] font-bold uppercase tracking-wide text-faint">Soon</span>}
              <ChevronRight className="h-4 w-4 text-faint" />
            </button>
          );
        })}
      </section>

      <Toast message={toast} />
    </div>
  );
}
