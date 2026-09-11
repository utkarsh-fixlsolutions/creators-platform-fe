import {
  Bell,
  Bookmark,
  Compass,
  Crown,
  MessageCircle,
  Plus,
  Settings,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { FeedTab } from "../data";
import { ME } from "../data";
import { cn } from "../utils/cn";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Feed tab this item maps to (if any) */
  tab?: FeedTab;
  badge?: number | "dot";
}

export const NAV_ITEMS: NavItem[] = [
  { id: "discover", label: "Discover", icon: Compass, tab: "foryou" },
  { id: "following", label: "Following", icon: Users, tab: "following" },
  { id: "exclusive", label: "Exclusive", icon: Crown, tab: "exclusive" },
  { id: "messages", label: "Messages", icon: MessageCircle, badge: 3 },
  { id: "notifications", label: "Notifications", icon: Bell, badge: "dot" },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "profile", label: "Profile", icon: UserRound },
];

/** Which nav item should light up for a given feed tab */
export function navIdForTab(tab: FeedTab): string {
  if (tab === "following") return "following";
  if (tab === "exclusive") return "exclusive";
  return "discover";
}

interface SidebarProps {
  activeTab: FeedTab;
  onNavigate: (item: NavItem) => void;
  onCreate: () => void;
  onLogoClick?: () => void;
}

export function Sidebar({ activeTab, onNavigate, onCreate, onLogoClick }: SidebarProps) {
  const activeId = navIdForTab(activeTab);

  return (
    <aside className="hidden md:block">
      <div className="no-scrollbar sticky top-0 flex h-screen flex-col overflow-y-auto border-r border-line px-3 py-6 lg:px-5">
        <div className="flex justify-center lg:justify-start lg:px-1 cursor-pointer" onClick={onLogoClick}>
          <Logo compact className="lg:hidden" />
          <Logo className="hidden lg:flex" />
        </div>

        <nav aria-label="Primary" className="mt-9 flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item)}
                aria-current={active ? "page" : undefined}
                title={item.label}
                className={cn(
                  "group relative flex w-full items-center justify-center gap-3.5 rounded-2xl px-3 py-2.5 text-[15px] font-medium tracking-[-0.01em] transition-all duration-200 lg:justify-start",
                  active
                    ? "bg-ink text-white shadow-ink"
                    : "text-ink-soft hover:bg-surface hover:text-ink hover:shadow-card",
                )}
              >
                <span className="relative">
                  <item.icon
                    className="h-[22px] w-[22px] shrink-0 transition-transform duration-300 ease-out group-hover:scale-110"
                    strokeWidth={active ? 2.2 : 1.9}
                  />
                  {item.badge === "dot" && (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose ring-2 ring-paper" />
                  )}
                  {typeof item.badge === "number" && (
                    <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white ring-2 ring-paper lg:hidden">
                      {item.badge}
                    </span>
                  )}
                </span>
                <span className="hidden flex-1 text-left lg:block">{item.label}</span>
                {typeof item.badge === "number" && (
                  <span
                    className={cn(
                      "hidden h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold lg:grid",
                      active ? "bg-white/20 text-white" : "bg-brand text-white",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onCreate}
          className="group mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-semibold text-white shadow-brand transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-deep active:translate-y-0 lg:h-[52px]"
        >
          <Plus
            className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90"
            strokeWidth={2.4}
          />
          <span className="hidden lg:inline">Create</span>
        </button>

        <div className="mt-5 flex items-center justify-center gap-3 rounded-2xl border border-transparent p-2 transition-colors duration-200 hover:border-line hover:bg-surface lg:justify-start">
          <Avatar src={ME.avatar} alt={ME.name} size={40} />
          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="truncate text-[14px] font-semibold">{ME.name}</p>
            <p className="truncate text-xs text-muted">@{ME.handle}</p>
          </div>
          <button
            type="button"
            aria-label="Settings"
            className="hidden h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-ink lg:grid"
          >
            <Settings className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
