import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Images,
  MessageCircle,
  Bell,
  BarChart3,
  Wallet,
  Settings,
  Plus,
  Radio,
  ArrowUpRight,
  LogOut,
} from 'lucide-react';
import { NavItemButton, type NavItemConfig } from '../Sidebar';
import { useSessionStore } from '../../store/sessionStore';
import { useWalletStore } from '../../store/walletStore';
import { useNotificationStore } from '../../store/notificationStore';
import { STUDIO_CONVERSATIONS } from '../../data/studioData';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { Logo } from '../Logo';
import { cn } from '../../utils/cn';
import { StudioMobileNav } from './StudioMobileNav';
import { CreateSheet } from '../studio/CreateSheet';

const PRIMARY_NAV: NavItemConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'content', label: 'Content', icon: Images },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const BUSINESS_NAV: NavItemConfig[] = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'earnings', label: 'Earnings', icon: Wallet },
  { id: 'settings', label: 'Profile & Settings', icon: Settings },
];

const PATH_BY_ID: Record<string, string> = {
  dashboard: '/studio',
  content: '/studio/content',
  messages: '/studio/messages',
  notifications: '/studio/notifications',
  analytics: '/studio/analytics',
  earnings: '/studio/earnings',
  settings: '/studio/settings',
};

export function CreatorStudioLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, switchActiveRole } = useSessionStore();
  const availableCredits = useWalletStore((s) => s.availableCredits);
  const unreadNotifications = useNotificationStore((s) => s.unreadCount());
  const unreadMessages = STUDIO_CONVERSATIONS.reduce((a, c) => a + c.unread, 0);
  const [createOpen, setCreateOpen] = useState(false);

  const handleSwitchToFan = () => {
    switchActiveRole('fan');
    navigate('/app');
  };

  const activeId =
    Object.entries(PATH_BY_ID).find(([, path]) =>
      path === '/studio' ? location.pathname === '/studio' : location.pathname.startsWith(path)
    )?.[0] ?? 'dashboard';

  const withBadges = (items: NavItemConfig[]) =>
    items.map((item) => {
      if (item.id === 'messages') return { ...item, badge: unreadMessages > 0 ? unreadMessages : undefined };
      if (item.id === 'notifications') return { ...item, badge: unreadNotifications > 0 ? unreadNotifications : undefined };
      return item;
    });

  const renderGroup = (items: NavItemConfig[]) => (
    <ul className="space-y-0.5">
      {withBadges(items).map((item) => (
        <NavItemButton
          key={item.id}
          item={item}
          collapsed={false}
          active={activeId === item.id}
          onClick={() => navigate(PATH_BY_ID[item.id])}
        />
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-line bg-paper/70 backdrop-blur-md sticky top-0 h-screen px-3.5 py-4 justify-between">
          <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between px-1 pb-4 mb-4 border-b border-line">
              <Logo compact onClick={() => navigate('/')} />
              <span className="px-2 py-0.5 rounded-md bg-ink text-white text-[10px] font-semibold uppercase tracking-wider">
                Studio
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 bg-surface rounded-2xl border border-line mb-5">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120'}
                alt={user?.displayName || 'Creator'}
                className="w-9 h-9 rounded-full object-cover border border-line shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-ink truncate">{user?.displayName}</span>
                  <VerifiedBadge size={13} />
                </div>
                <p className="text-[11px] text-muted truncate">@{user?.handle}</p>
              </div>
            </div>

            <nav aria-label="Studio navigation" className="space-y-4">
              <div>{renderGroup(PRIMARY_NAV)}</div>
              <div>
                <p className="mb-1 px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
                  Business
                </p>
                {renderGroup(BUSINESS_NAV)}
              </div>
            </nav>
          </div>

          <div className="pt-4 mt-4 border-t border-line space-y-2 shrink-0">
            <div className="p-3 rounded-xl bg-paper-deep/70 text-[11px] flex justify-between">
              <span className="text-muted">Available</span>
              <strong className="text-ink font-mono">${(availableCredits / 100).toFixed(2)}</strong>
            </div>

            <button
              type="button"
              onClick={handleSwitchToFan}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-medium bg-paper hover:bg-paper-deep text-ink flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Switch to Fan App</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full py-2 px-3 text-xs text-left text-rose hover:bg-rose-soft rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur-md border-b border-line">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120'}
                  alt={user?.displayName || 'Creator'}
                  className="w-8 h-8 rounded-full object-cover border border-line shrink-0 md:hidden"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[13.5px] font-semibold text-ink truncate">{user?.displayName}</span>
                    <VerifiedBadge size={13} />
                  </div>
                  <span className="hidden sm:block text-[11px] text-muted">Creator Studio</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <NavLink
                  to="/studio/notifications"
                  aria-label="Notifications"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-surface transition-colors"
                >
                  <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9.5px] font-bold text-white ring-2 ring-paper">
                      {unreadNotifications}
                    </span>
                  )}
                </NavLink>

                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  aria-label="Create"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-surface transition-colors cursor-pointer"
                >
                  <Plus className="h-[18px] w-[18px]" strokeWidth={2} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/studio/live')}
                  aria-label="Go live"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-live hover:bg-rose-soft transition-colors cursor-pointer"
                >
                  <Radio className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </button>

                <NavLink
                  to="/studio/earnings"
                  className="ml-1 flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-brand transition-colors"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  <span>${(availableCredits / 100).toFixed(2)}</span>
                </NavLink>
              </div>
            </div>
          </header>

          <main className={cn('px-4 sm:px-6 py-5 pb-28 md:pb-10 max-w-5xl mx-auto w-full')}>
            <Outlet context={{ openCreate: () => setCreateOpen(true) }} />
          </main>
        </div>
      </div>

      <StudioMobileNav activeId={activeId} onNavigate={(id) => navigate(PATH_BY_ID[id])} onCreateClick={() => setCreateOpen(true)} />

      <CreateSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
