import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Bookmark,
  Compass,
  CreditCard,
  Crown,
  Eye,
  Home,
  LifeBuoy,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Settings,
  Share,
  UserRoundPlus,
  Vault,
  Wallet,
} from "lucide-react";
import type { FeedTab } from "../data";
import { ME } from "../data";
import { cn } from "../utils/cn";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";

/* ------------------------------------------------------------------ */
/*  Navigation config                                                  */
/* ------------------------------------------------------------------ */

export interface NavItemConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  tab?: FeedTab;
  badge?: number;
  live?: boolean;
  danger?: boolean;
  action?: string;
}

export const primaryNav: NavItemConfig[] = [
  { id: "home", label: "Home", icon: Home, tab: "foryou" },
  { id: "messages", label: "Messages", icon: MessageCircle, badge: 3 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
  { id: "creators", label: "Creators", icon: Compass },
  { id: "subscriptions", label: "Subscriptions", icon: Crown, tab: "exclusive" },
  { id: "vault", label: "Vault", icon: Vault },
  { id: "wallet", label: "Wallet", icon: Wallet, action: "wallet" },
];

export const fansNav: NavItemConfig[] = [
  { id: "live", label: "Live Creators", icon: Eye, live: true, tab: "live" },
  { id: "payments", label: "Subscription Payments", icon: CreditCard },
  { id: "become-creator", label: "Become a Creator", icon: UserRoundPlus, action: "creator" },
  { id: "referral", label: "Referral", icon: Share },
];

export const systemNav: NavItemConfig[] = [
  { id: "help", label: "Help & Support", icon: LifeBuoy },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "logout", label: "Log out", icon: LogOut, danger: true, action: "logout" },
];

export type NavItem = NavItemConfig;

/** Which nav item should light up for a given feed tab or screen */
export function navIdForTab(tab: FeedTab | string): string {
  if (tab === "following" || tab === "foryou" || tab === "home") return "home";
  if (tab === "messages") return "messages";
  if (tab === "notifications") return "notifications";
  if (tab === "bookmarks") return "bookmarks";
  if (tab === "creators" || tab === "trending" || tab === "search" || tab === "explore") return "creators";
  if (tab === "exclusive" || tab === "subscriptions") return "subscriptions";
  if (tab === "live") return "live";
  if (tab === "vault") return "vault";
  if (tab === "wallet") return "wallet";
  if (tab === "help") return "help";
  if (tab === "settings") return "settings";
  return tab || "home";
}

/* ------------------------------------------------------------------ */
/*  Nav Item Component                                                 */
/* ------------------------------------------------------------------ */

interface NavItemProps {
  item: NavItemConfig;
  active: boolean;
  rail: boolean;
  onClick: () => void;
}

function NavItemButton({ item, active, rail, onClick }: NavItemProps) {
  const Icon = item.icon;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        aria-label={item.label}
        className={cn(
          "group relative flex h-10 w-full items-center gap-3 rounded-xl px-3 text-[14px] font-medium tracking-[-0.01em] transition-all duration-200 active:scale-[0.98]",
          rail && "md:justify-center md:px-0 lg:justify-start lg:px-3",
          active
            ? "bg-ink text-white shadow-ink"
            : "text-ink-soft hover:bg-surface hover:text-ink hover:shadow-card",
          item.danger && !active && "hover:bg-rose-50 hover:text-rose-600",
        )}
      >
        {/* Active indicator bar sits in the nav gutter */}
        <span
          aria-hidden
          className={cn(
            "absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand transition-all duration-300 ease-out",
            active ? "scale-y-100 opacity-100" : "scale-y-50 opacity-0",
          )}
        />

        <span className="relative shrink-0">
          <Icon
            className={cn(
              "h-5 w-5 transition-transform duration-300 ease-out group-hover:scale-110",
              active ? "text-white" : "text-ink-soft",
            )}
            strokeWidth={active ? 2.3 : 1.9}
          />

          {/* Animated Real-time Live pulse */}
          {item.live && (
            <span aria-hidden className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-rose animate-live-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose ring-2 ring-paper" />
            </span>
          )}

          {/* Compact badge dot for tablet rail */}
          {item.badge && rail && (
            <span
              aria-hidden
              className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-brand ring-2 ring-paper lg:hidden"
            />
          )}
        </span>

        <span className={cn("truncate", rail && "hidden lg:inline flex-1 text-left")}>
          {item.label}
        </span>

        {item.badge && (
          <span
            className={cn(
              "ml-auto hidden h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums lg:inline-flex",
              active ? "bg-white/20 text-white" : "bg-brand text-white shadow-sm",
            )}
          >
            {item.badge}
          </span>
        )}
      </button>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */

import { useNotificationStore } from "../store/notificationStore";

interface SidebarProps {
  activeTab: FeedTab | string;
  onNavigate: (item: NavItemConfig) => void;
  onCreate?: () => void;
  onLogoClick?: () => void;
}

export function Sidebar({ activeTab, onNavigate, onLogoClick }: SidebarProps) {
  const activeId = navIdForTab(activeTab);
  const rail = true;
  const unreadNotifications = useNotificationStore((s) => s.unreadCount());

  const navItems = primaryNav.map((item) => {
    if (item.id === "notifications") {
      return { ...item, badge: unreadNotifications > 0 ? unreadNotifications : undefined };
    }
    return item;
  });

  const renderGroup = (items: NavItemConfig[]) => (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <NavItemButton
          key={item.id}
          item={item}
          rail={rail}
          active={activeId === item.id}
          onClick={() => onNavigate(item)}
        />
      ))}
    </ul>
  );

  return (
    <aside className="hidden md:block">
      <div className="quiet-scroll sticky top-0 flex h-screen flex-col overflow-y-auto border-r border-line bg-paper/60 backdrop-blur-md px-3 py-5 lg:px-4">
        
        {/* Brand Logo */}
        <div
          className="flex justify-center lg:justify-start lg:px-2 mb-6 cursor-pointer"
          onClick={onLogoClick}
          title="Back to Landing Page"
        >
          <Logo compact className="lg:hidden" />
          <Logo className="hidden lg:flex" />
        </div>

        {/* Navigation Sections */}
        <nav aria-label="Primary Navigation" className="flex-1 space-y-4">
          {/* Group 1: Primary Navigation */}
          <div>{renderGroup(navItems)}</div>

          {/* Group 2: For Fans */}
          <div role="group" aria-label="For fans">
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink/40 hidden lg:block">
              For fans
            </p>
            <div className="mx-3 mb-2 hidden h-px bg-line md:block lg:hidden" />
            {renderGroup(fansNav)}
          </div>

          {/* Group 3: System & Account */}
          <div>
            <div className="mx-3 mb-2 h-px bg-line" />
            {renderGroup(systemNav)}
          </div>
        </nav>

        {/* Bottom User Profile Pill */}
        <div className="shrink-0 border-t border-line pt-3">
          <div className="flex w-full items-center gap-2.5 rounded-2xl p-2 text-left transition-colors hover:bg-surface md:justify-center lg:justify-start group">
            <Avatar src={ME.avatar} alt={ME.name} size={36} />
            <div className="min-w-0 flex-1 hidden lg:block">
              <span className="block truncate text-xs font-semibold text-ink">
                {ME.name}
              </span>
              <span className="block truncate text-[11px] text-muted">
                @{ME.handle}
              </span>
            </div>
            <button
              type="button"
              aria-label="More account options"
              className="hidden h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-ink lg:grid"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
}
