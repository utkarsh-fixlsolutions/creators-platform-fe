import { Bell, Compass, Crown, Home, MessageCircle, Radio, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import type { FeedTab } from "../data";
import { ME } from "../data";
import { cn } from "../utils/cn";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";
import { type NavItem } from "./Sidebar";
import { useNotificationStore } from "../store/notificationStore";

interface Props {
  activeTab: FeedTab | string;
  onNavigate: (item: NavItem) => void;
  onCreate?: () => void;
  onNotify: (message: string) => void;
}

import { useState } from "react";
import { HamburgerButton } from "./ui/HamburgerButton";
import { MobileMenuDrawer } from "./ui/MobileMenuDrawer";

interface MobileTopBarProps {
  onNotify: (message: string) => void;
  onLiveClick?: () => void;
  isLiveActive?: boolean;
  onNotificationsClick?: () => void;
}

/** Sticky top bar — phones only */
export function MobileTopBar({
  onNotify,
  onLiveClick,
  isLiveActive,
  onNotificationsClick,
}: MobileTopBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useNotificationStore((s) => s.unreadCount());
  const [menuOpen, setMenuOpen] = useState(false);

  const activeLive = isLiveActive ?? location.pathname.startsWith("/live");

  const handleLiveNav = () => {
    if (onLiveClick) {
      onLiveClick();
    } else {
      navigate("/live");
    }
  };

  const handleNotificationNav = () => {
    if (onNotificationsClick) {
      onNotificationsClick();
    } else {
      navigate("/notifications");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line/80 bg-paper/90 backdrop-blur-xl md:hidden">
        <div className="flex h-14 items-center justify-between px-3.5 sm:px-4">
          <div onClick={() => navigate("/")} className="cursor-pointer">
            <Logo />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Compact Mobile Live Icon Button */}
            <button
              type="button"
              onClick={handleLiveNav}
              aria-label="Live creators"
              aria-pressed={activeLive}
              title={activeLive ? "Live creators feed active" : "View live creators"}
              className={cn(
                "group relative grid h-9 w-9 place-items-center rounded-full transition-all duration-200 cursor-pointer active:scale-95 select-none",
                activeLive
                  ? "bg-rose text-white shadow-pop ring-2 ring-rose/30"
                  : "text-ink-soft hover:bg-surface hover:text-rose"
              )}
            >
              <Radio
                className={cn(
                  "h-[20px] w-[20px] transition-transform group-hover:scale-105",
                  activeLive ? "text-white" : "text-rose"
                )}
                strokeWidth={2}
              />
              {/* Badge: pulsating dot + count 3 */}
              <span
                className={cn(
                  "absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9.5px] font-extrabold ring-2 ring-paper",
                  activeLive
                    ? "bg-white text-rose"
                    : "bg-rose text-white"
                )}
              >
                <span className="relative mr-0.5 flex h-1.5 w-1.5 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping" />
                  <span className="relative inline-flex h-1 w-1 rounded-full bg-current" />
                </span>
                3
              </span>
            </button>

            {/* Notifications Bell */}
            <button
              type="button"
              aria-label="Notifications"
              onClick={handleNotificationNav}
              className="relative grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface cursor-pointer"
            >
              <Bell className="h-[20px] w-[20px]" strokeWidth={1.9} />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[9.5px] font-bold text-white ring-2 ring-paper">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* 2-line Animated Folding Hamburger Button */}
            <HamburgerButton
              open={menuOpen}
              onToggle={() => setMenuOpen((o) => !o)}
            />
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Sheet */}
      <MobileMenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNotify={onNotify}
      />
    </>
  );
}

const HOME_ITEM: NavItem = { id: "home", label: "Home", icon: Home, tab: "foryou" };
const EXPLORE_ITEM: NavItem = { id: "explore", label: "Explore", icon: Compass, tab: "trending" };
const SUBSCRIPTIONS_ITEM: NavItem = { id: "subscriptions", label: "Subs", icon: Crown, badge: 2 };
const MESSAGES_ITEM: NavItem = { id: "messages", label: "Messages", icon: MessageCircle, badge: 3 };
const PROFILE_ITEM: NavItem = { id: "profile", label: "Profile", icon: Users };

/** Floating Capsule Bottom Navigation — Mobile Mode (Home || Explore || Subs || Messages || Profile) */
export function MobileBottomNav({ activeTab, onNavigate }: Omit<Props, "onNotify">) {
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

  const isSubsActive = activeTab === "subscriptions";
  const isMessagesActive = activeTab === "messages";
  const isProfileActive = activeTab === "profile";

  const NavPill = ({
    item,
    isActive,
    badge,
    badgeColor = "bg-brand",
  }: {
    item: NavItem;
    isActive: boolean;
    badge?: number;
    badgeColor?: string;
  }) => {
    const Icon = item.icon;

    return (
      <button
        type="button"
        onClick={() => onNavigate(item)}
        aria-current={isActive ? "page" : undefined}
        aria-label={item.label}
        className={cn(
          "group relative flex items-center justify-center transition-all duration-300 ease-out select-none shrink-0 cursor-pointer",
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
          {badge !== undefined && (
            <span
              className={cn(
                "absolute flex items-center justify-center rounded-full px-1 text-[9px] font-extrabold text-white ring-2",
                isActive
                  ? "-top-2 -right-2 h-3.5 min-w-[14px] bg-rose ring-ink"
                  : "-top-1.5 -right-1.5 h-4 min-w-[16px] ring-surface",
                !isActive && badgeColor
              )}
            >
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

        {/* 3. Subscriptions (Replaces + icon) */}
        <NavPill
          item={SUBSCRIPTIONS_ITEM}
          isActive={isSubsActive}
          badge={2}
          badgeColor="bg-rose"
        />

        {/* 4. Messages */}
        <NavPill
          item={MESSAGES_ITEM}
          isActive={isMessagesActive}
          badge={3}
          badgeColor="bg-brand"
        />

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
