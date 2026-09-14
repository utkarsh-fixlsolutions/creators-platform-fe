import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CreditCard,
  Crown,
  Eye,
  Gift,
  Home,
  LifeBuoy,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Share,
  Sparkles,
  ChevronRight,
  Wallet,
} from "lucide-react";
import type { FeedTab } from "../data";
import { ME } from "../data";
import { cn } from "../utils/cn";
import { Avatar } from "./Avatar";
import { useCreatorStore } from "../store/creatorStore";
import { useNotificationStore } from "../store/notificationStore";
import { useSidebarStore } from "../store/sidebarStore";

/* ------------------------------------------------------------------ */
/*  Navigation config (Bookmarks & Vault removed)                     */
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
  { id: "creators", label: "Creators", icon: Search },
  { id: "wallet", label: "Wallet", icon: Wallet, action: "wallet" },
  { id: "live", label: "Live Creators", icon: Eye, live: true, tab: "live" },
  { id: "subscriptions", label: "Subscriptions", icon: Crown },
];

export const fansNav: NavItemConfig[] = [
  { id: "payments", label: "Subscription Payments", icon: CreditCard },
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
  if (tab === "creators" || tab === "trending" || tab === "search" || tab === "explore") return "creators";
  if (tab === "exclusive" || tab === "subscriptions") return "subscriptions";
  if (tab === "live") return "live";
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
  collapsed: boolean;
  secondary?: boolean;
  onClick: () => void;
}

function NavItemButton({ item, active, collapsed, secondary, onClick }: NavItemProps) {
  const Icon = item.icon;

  return (
    <li className="relative group list-none">
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        aria-label={item.label}
        className={cn(
          "relative flex items-center rounded-xl font-medium tracking-[-0.01em] transition-all duration-200 active:scale-[0.98] cursor-pointer select-none",
          collapsed
            ? "h-11 w-11 mx-auto justify-center"
            : secondary
            ? "h-[34px] w-full gap-3 px-3 text-[13px]"
            : "h-10 w-full gap-3 px-3 text-[14px]",
          active
            ? "bg-ink text-white shadow-ink font-semibold"
            : secondary
            ? "text-muted hover:bg-surface/80 hover:text-ink hover:shadow-2xs"
            : "text-ink-soft hover:bg-surface hover:text-ink hover:shadow-card",
          item.danger && !active && "hover:bg-rose-50 hover:text-rose-600",
        )}
      >
        {/* Active indicator bar sits in the left nav gutter when expanded */}
        {!collapsed && (
          <span
            aria-hidden
            className={cn(
              "absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand transition-all duration-300 ease-out",
              active ? "scale-y-100 opacity-100" : "scale-y-50 opacity-0",
            )}
          />
        )}

        <span className="relative shrink-0 flex items-center justify-center">
          <Icon
            className={cn(
              "transition-transform duration-300 ease-out group-hover:scale-110",
              secondary && !collapsed ? "h-4 w-4" : "h-5 w-5",
              active ? "text-white" : secondary ? "text-muted group-hover:text-ink" : "text-ink-soft group-hover:text-ink",
            )}
            strokeWidth={active ? 2.3 : secondary ? 1.75 : 1.9}
          />

          {/* Real-time Live pulsing dot */}
          {item.live && (
            <span aria-hidden className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-rose animate-live-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose ring-2 ring-paper" />
            </span>
          )}

          {/* Compact badge dot for collapsed mode */}
          {item.badge && collapsed && (
            <span
              aria-hidden
              className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-brand ring-2 ring-paper"
            />
          )}
        </span>

        {/* Text label when expanded */}
        {!collapsed && (
          <span className="truncate flex-1 text-left">
            {item.label}
          </span>
        )}

        {/* Counter badge when expanded */}
        {!collapsed && item.badge && (
          <span
            className={cn(
              "ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums",
              active ? "bg-white/20 text-white" : "bg-brand text-white shadow-sm",
            )}
          >
            {item.badge}
          </span>
        )}
      </button>

      {/* Floating Tooltip in Collapsed Mode */}
      {collapsed && (
        <div
          role="tooltip"
          className="pointer-events-none absolute left-[56px] top-1/2 -translate-y-1/2 z-50 opacity-0 transition-all duration-200 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0"
        >
          <div className="flex items-center gap-1.5 rounded-lg border border-line/80 bg-ink px-2.5 py-1 text-xs font-semibold text-white shadow-pop whitespace-nowrap">
            <span>{item.label}</span>
            {item.badge && (
              <span className="rounded-full bg-brand px-1.5 py-0.2 text-[10px] font-bold text-white">
                {item.badge}
              </span>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */

interface SidebarProps {
  activeTab: FeedTab | string;
  onNavigate: (item: NavItemConfig) => void;
  onCreate?: () => void;
  onLogoClick?: () => void;
}

export function Sidebar({ activeTab, onNavigate, onLogoClick }: SidebarProps) {
  const activeId = navIdForTab(activeTab);
  const unreadNotifications = useNotificationStore((s) => s.unreadCount());
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar);
  const [headerHovered, setHeaderHovered] = useState(false);

  const navItems = primaryNav.map((item) => {
    if (item.id === "notifications") {
      return { ...item, badge: unreadNotifications > 0 ? unreadNotifications : undefined };
    }
    return item;
  });

  const renderGroup = (items: NavItemConfig[], secondary = false) => (
    <ul className={cn("space-y-1", isCollapsed && "space-y-1.5")}>
      {items.map((item) => (
        <NavItemButton
          key={item.id}
          item={item}
          collapsed={isCollapsed}
          secondary={secondary}
          active={activeId === item.id}
          onClick={() => onNavigate(item)}
        />
      ))}
    </ul>
  );

  return (
    <aside
      className={cn(
        "hidden md:block shrink-0 transition-all duration-300 ease-in-out relative z-30",
        isCollapsed ? "w-[80px]" : "w-[272px]",
      )}
    >
      <div
        className={cn(
          "sticky top-0 flex h-screen flex-col border-r border-line bg-paper/70 backdrop-blur-md transition-all duration-300 ease-in-out py-5 overflow-visible",
          isCollapsed ? "w-[80px] px-2.5 items-center" : "w-[272px] px-4",
        )}
      >
        {/* ========================================================= */}
        {/* Top Header & Foldable Toggle Area                         */}
        {/* ========================================================= */}
        <div
          className={cn(
            "relative mb-5 flex items-center transition-all duration-200",
            isCollapsed ? "w-full justify-center" : "w-full justify-between px-1",
          )}
          onMouseEnter={() => setHeaderHovered(true)}
          onMouseLeave={() => setHeaderHovered(false)}
        >
          {/* Collapsed State: Centered Toggle Button + "Expand" Floating Capsule */}
          {isCollapsed ? (
            <div className="relative group flex items-center justify-center">
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label="Expand sidebar"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface/90 text-ink shadow-xs border border-line/70 transition-all duration-200 hover:border-ink/30 hover:bg-surface hover:scale-105 active:scale-95 cursor-pointer"
              >
                <PanelLeftOpen className="h-5 w-5 stroke-[2] text-ink" />
              </button>

              {/* Expand Floating Capsule Tooltip (matches reference image media_1789381278345.png) */}
              <div
                onClick={toggleSidebar}
                className="pointer-events-none absolute left-[54px] top-1/2 -translate-y-1/2 z-50 flex cursor-pointer items-center rounded-full border border-line bg-surface px-3.5 py-1 text-[12px] font-bold text-ink shadow-pop transition-all duration-200 hover:bg-paper-deep/70 hover:scale-105 active:scale-95 whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto -translate-x-1 group-hover:translate-x-0"
              >
                Expand
              </div>
            </div>
          ) : (
            /* Expanded State: Full Logo + Collapse Toggle on Hover/Click */
            <div className="flex w-full items-center justify-between">
              {/* Brand Logo */}
              <div
                onClick={onLogoClick}
                className="flex items-center gap-3 cursor-pointer group select-none"
                title="Back to Home / Landing"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-ink text-white shadow-ink transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-105">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path
                      d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <span className="leading-none">
                  <span className="block text-[17px] font-bold tracking-[-0.02em] text-ink">
                    Creators
                  </span>
                  <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                    Platform
                  </span>
                </span>
              </div>

              {/* Collapse Button */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={toggleSidebar}
                  aria-label="Collapse sidebar"
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg border border-line/60 bg-surface/60 text-muted transition-all duration-200 hover:border-ink/20 hover:bg-surface hover:text-ink active:scale-95 cursor-pointer",
                    headerHovered ? "opacity-100" : "opacity-80",
                  )}
                >
                  <PanelLeftClose className="h-4 w-4 stroke-[2]" />
                </button>

                {/* Floating "Collapse" pill on hover */}
                <div
                  role="tooltip"
                  className="pointer-events-none absolute right-0 top-full mt-1.5 z-50 hidden rounded-full border border-line bg-surface/95 px-2.5 py-0.5 text-[11px] font-bold text-ink shadow-pop whitespace-nowrap group-hover:block"
                >
                  Collapse
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* Navigation Sections                                       */}
        {/* ========================================================= */}
        <nav aria-label="Primary Navigation" className="flex-1 w-full space-y-3">
          {/* Primary Nav List */}
          <div>{renderGroup(navItems, false)}</div>

          {/* Divider */}
          <div className={cn("h-px bg-line my-2", isCollapsed ? "mx-1" : "mx-2")} />

          {/* Expanded secondary navigation */}
          {!isCollapsed && (
            <>
              {/* For Fans Group */}
              <div role="group" aria-label="For fans">
                <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
                  For fans
                </p>
                {renderGroup(fansNav, true)}
              </div>

              <div className="mx-2 my-2 h-px bg-line" />

              {/* System & Account */}
              <div>{renderGroup(systemNav, true)}</div>
            </>
          )}

          {/* Collapsed quick settings */}
          {isCollapsed && (
            <div className="space-y-1.5 pt-1">
              <NavItemButton
                item={{ id: "settings", label: "Settings", icon: Settings }}
                collapsed={true}
                secondary={true}
                active={activeId === "settings"}
                onClick={() => onNavigate({ id: "settings", label: "Settings", icon: Settings })}
              />
            </div>
          )}
        </nav>

        {/* ========================================================= */}
        {/* Become a Creator CTA                                      */}
        {/* ========================================================= */}
        <div className="my-3 shrink-0 w-full">
          {/* Expanded: Sleek Luxury Card */}
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => useCreatorStore.getState().openModal()}
              className="group relative flex w-full items-center gap-2.5 rounded-2xl bg-ink p-3 text-left text-white shadow-card transition-all duration-300 hover:bg-black hover:shadow-ink active:scale-[0.98] cursor-pointer"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/15 text-white transition-transform group-hover:scale-105">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold leading-tight tracking-[-0.01em]">
                  Become a Creator
                </span>
                <span className="block truncate text-[11px] font-medium text-white/60">
                  Keep 90% of earnings
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
            </button>
          )}

          {/* Collapsed: Gift / Sparkle Icon Button (matches reference media_1789381278345.png) */}
          {isCollapsed && (
            <div className="relative group flex justify-center">
              <button
                type="button"
                onClick={() => useCreatorStore.getState().openModal()}
                aria-label="Become a Creator"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white shadow-card transition-all duration-200 hover:bg-black hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Gift className="h-5 w-5 transition-transform group-hover:scale-110" />
              </button>

              {/* Tooltip */}
              <div
                role="tooltip"
                className="pointer-events-none absolute left-[56px] top-1/2 -translate-y-1/2 z-50 opacity-0 transition-all duration-200 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0"
              >
                <div className="rounded-lg border border-line/80 bg-ink px-2.5 py-1 text-xs font-semibold text-white shadow-pop whitespace-nowrap">
                  Become a Creator
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* Bottom User Profile Section                               */}
        {/* ========================================================= */}
        <div className="shrink-0 border-t border-line pt-3 w-full">
          {!isCollapsed ? (
            <div className="flex w-full items-center gap-2.5 rounded-2xl p-2 text-left transition-colors hover:bg-surface group">
              <Avatar src={ME.avatar} alt={ME.name} size={36} />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-ink">
                  {ME.name}
                </span>
                <span className="block truncate text-[11px] text-muted">
                  @{ME.handle}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate({ id: "settings", label: "Settings", icon: Settings })}
                aria-label="Account Settings"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-ink cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="relative group flex justify-center">
              <button
                type="button"
                onClick={() => onNavigate({ id: "settings", label: "Settings", icon: Settings })}
                aria-label="User Profile & Settings"
                className="rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Avatar src={ME.avatar} alt={ME.name} size={36} />
              </button>

              {/* Tooltip */}
              <div
                role="tooltip"
                className="pointer-events-none absolute left-[56px] top-1/2 -translate-y-1/2 z-50 opacity-0 transition-all duration-200 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0"
              >
                <div className="rounded-lg border border-line/80 bg-ink px-2.5 py-1 text-xs font-semibold text-white shadow-pop whitespace-nowrap">
                  {ME.name} (@{ME.handle})
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}
