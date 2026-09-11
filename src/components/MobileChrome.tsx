import { Bell, Compass, Home, MessageCircle, Plus, Users } from "lucide-react";
import type { FeedTab } from "../data";
import { ME } from "../data";
import { cn } from "../utils/cn";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";
import { type NavItem } from "./Sidebar";

interface Props {
  activeTab: FeedTab | string;
  onNavigate: (item: NavItem) => void;
  onCreate: () => void;
  onNotify: (message: string) => void;
}

interface MobileTopBarProps {
  onNotify: (message: string) => void;
  onLiveClick?: () => void;
  isLiveActive?: boolean;
}

/** Sticky top bar — phones only */
export function MobileTopBar({ onNotify, onLiveClick, isLiveActive }: MobileTopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/85 backdrop-blur-xl md:hidden">
      <div className="flex h-14 items-center justify-between px-3.5 sm:px-4">
        <Logo />
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Animated Mobile Live Button - placed right to the left of the Notification icon */}
          <button
            type="button"
            onClick={onLiveClick}
            aria-pressed={isLiveActive}
            title={isLiveActive ? "Showing live creators — Click to show all" : "Filter to live creators"}
            className={cn(
              "group relative flex h-8 items-center gap-1.5 rounded-full border py-1 pl-2 pr-2.5 shadow-sm transition-all duration-300 hover:shadow-card active:scale-95 select-none shrink-0",
              isLiveActive
                ? "border-rose bg-rose text-white shadow-pop ring-2 ring-rose/30"
                : "border-rose/35 bg-surface text-ink hover:border-rose/60 hover:bg-rose-50/40"
            )}
          >
            <span className="relative flex h-2 w-2 items-center justify-center">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full opacity-75",
                  isLiveActive ? "bg-white animate-ping" : "bg-rose animate-ping"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex h-1.5 w-1.5 rounded-full",
                  isLiveActive ? "bg-white" : "bg-rose"
                )}
              />
            </span>
            <span
              className={cn(
                "text-[12px] font-semibold tracking-[-0.01em]",
                isLiveActive ? "text-white" : "text-rose"
              )}
            >
              Live
            </span>
            <span
              className={cn(
                "ml-0.5 rounded-full px-1.5 py-[1px] text-[10.5px] font-bold tracking-tight",
                isLiveActive
                  ? "bg-white/20 text-white"
                  : "bg-rose-50 text-rose"
              )}
            >
              3
            </span>
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => onNotify("You're all caught up")}
            className="relative grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface"
          >
            <Bell className="h-[20px] w-[20px]" strokeWidth={1.9} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose ring-2 ring-paper" />
          </button>

          {/* Profile Avatar */}
          <button type="button" aria-label="Your profile" className="ml-0.5">
            <Avatar src={ME.avatar} alt={ME.name} size={32} />
          </button>
        </div>
      </div>
    </header>
  );
}

const HOME_ITEM: NavItem = { id: "home", label: "Home", icon: Home, tab: "foryou" };
const EXPLORE_ITEM: NavItem = { id: "explore", label: "Explore", icon: Compass, tab: "trending" };
const MESSAGES_ITEM: NavItem = { id: "messages", label: "Messages", icon: MessageCircle, badge: 3 };
const PROFILE_ITEM: NavItem = { id: "profile", label: "Profile", icon: Users };

/** Floating Capsule Bottom Navigation — Mobile Mode (Home || Explore || + || Messages || Profile) */
export function MobileBottomNav({ activeTab, onNavigate, onCreate }: Omit<Props, "onNotify">) {
  const isHomeActive =
    activeTab === "foryou" ||
    activeTab === "following" ||
    activeTab === "exclusive" ||
    activeTab === "live" ||
    activeTab === "home";

  const isExploreActive =
    activeTab === "trending" ||
    activeTab === "search" ||
    activeTab === "collections" ||
    activeTab === "explore";

  const isMessagesActive = activeTab === "messages";
  const isProfileActive = activeTab === "profile";

  const NavPill = ({
    item,
    isActive,
    badge,
  }: {
    item: NavItem;
    isActive: boolean;
    badge?: number;
  }) => {
    const Icon = item.icon;

    return (
      <button
        type="button"
        onClick={() => onNavigate(item)}
        aria-current={isActive ? "page" : undefined}
        aria-label={item.label}
        className={cn(
          "group relative flex items-center justify-center transition-all duration-300 ease-out select-none shrink-0",
          isActive
            ? "h-11 rounded-full bg-ink px-3.5 text-white shadow-ink"
            : "h-11 w-11 rounded-full text-muted hover:bg-paper/80 hover:text-ink active:scale-95"
        )}
      >
        <div className="relative flex items-center justify-center">
          <Icon
            className={cn(
              "transition-transform duration-300",
              isActive ? "h-[19px] w-[19px]" : "h-[20px] w-[20px] group-hover:scale-105"
            )}
            strokeWidth={isActive ? 2.3 : 1.9}
          />
          {!isActive && badge && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[9.5px] font-bold text-white ring-2 ring-surface">
              {badge}
            </span>
          )}
        </div>
        {isActive && (
          <span className="ml-2 text-[13px] font-semibold tracking-[-0.01em] whitespace-nowrap animate-fade-in">
            {item.label}
          </span>
        )}
      </button>
    );
  };

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-4 inset-x-0 z-40 mx-auto flex w-fit min-w-[320px] max-w-[calc(100%-1.5rem)] items-center justify-between rounded-full border border-line/80 bg-surface/90 px-2 py-1.5 shadow-[0_16px_40px_-10px_rgba(18,18,24,0.25)] ring-1 ring-white/80 backdrop-blur-2xl md:hidden"
    >
      <div className="flex w-full items-center justify-between gap-1 sm:gap-2">
        {/* 1. Home */}
        <NavPill item={HOME_ITEM} isActive={isHomeActive} />

        {/* 2. Explore */}
        <NavPill item={EXPLORE_ITEM} isActive={isExploreActive} />

        {/* 3. Create Action Button */}
        <button
          type="button"
          onClick={onCreate}
          aria-label="Create new post or drop"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white shadow-brand transition-all duration-300 hover:bg-brand-deep hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" strokeWidth={2.4} />
        </button>

        {/* 4. Messages */}
        <NavPill item={MESSAGES_ITEM} isActive={isMessagesActive} badge={3} />

        {/* 5. Profile */}
        <button
          type="button"
          onClick={() => onNavigate(PROFILE_ITEM)}
          aria-current={isProfileActive ? "page" : undefined}
          aria-label="Profile"
          className={cn(
            "group relative flex h-11 shrink-0 items-center justify-center transition-all duration-300 ease-out select-none",
            isProfileActive
              ? "rounded-full bg-ink px-3 text-white shadow-ink"
              : "w-11 rounded-full text-muted hover:bg-paper/80 hover:text-ink active:scale-95"
          )}
        >
          <div className={cn("rounded-full p-[1.5px]", isProfileActive ? "ring-2 ring-white" : "")}>
            <Avatar src={ME.avatar} alt={ME.name} size={isProfileActive ? 24 : 28} />
          </div>
          {isProfileActive && (
            <span className="ml-2 text-[13px] font-semibold tracking-[-0.01em] whitespace-nowrap animate-fade-in">
              Profile
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
