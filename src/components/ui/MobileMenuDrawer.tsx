import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Bookmark,
  ChevronRight,
  Compass,
  CreditCard,
  Crown,
  Eye,
  Home,
  LifeBuoy,
  LogOut,
  MessageCircle,
  Settings,
  Share,
  UserRoundPlus,
  Vault,
  Wallet,
  Coins,
  type LucideIcon,
} from "lucide-react";
import { ME } from "../../data";
import { Avatar } from "../Avatar";
import { useWalletStore } from "../../store/walletStore";
import { useNotificationStore } from "../../store/notificationStore";
import { useCreatorStore } from "../../store/creatorStore";

interface MobileMenuDrawerProps {
  open: boolean;
  onClose: () => void;
  onNotify?: (msg: string) => void;
}

interface DrawerMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  badge?: number;
  live?: boolean;
  danger?: boolean;
  action?: string;
}

const PRIMARY_ITEMS: DrawerMenuItem[] = [
  { id: "home", label: "Home Feed", icon: Home, path: "/app" },
  { id: "messages", label: "Messages", icon: MessageCircle, path: "/messages", badge: 3 },
  { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
  { id: "subscriptions", label: "My Subscriptions", icon: Crown, path: "/subscriptions", badge: 2 },
  { id: "live", label: "Live Creators", icon: Eye, path: "/live", live: true },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
  { id: "creators", label: "Creators Directory", icon: Compass },
  { id: "vault", label: "Vault Archive", icon: Vault },
  { id: "wallet", label: "Wallet & Top Up", icon: Wallet, action: "wallet" },
];

const FANS_ITEMS: DrawerMenuItem[] = [
  { id: "payments", label: "Subscription Payments", icon: CreditCard },
  { id: "become-creator", label: "Become a Creator", icon: UserRoundPlus, action: "creator" },
  { id: "referral", label: "Invite & Referral", icon: Share },
];

const SYSTEM_ITEMS: DrawerMenuItem[] = [
  { id: "help", label: "Help & Support", icon: LifeBuoy },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "logout", label: "Log out", icon: LogOut, danger: true, action: "logout" },
];

export function MobileMenuDrawer({
  open,
  onClose,
  onNotify,
}: MobileMenuDrawerProps) {
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);
  const coinsBalance = useWalletStore((s) => s.coinsBalance);
  const unreadNotifications = useNotificationStore((s) => s.unreadCount());

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const handleItemClick = (item: DrawerMenuItem) => {
    onClose();
    if (item.action === "creator" || item.id === "become-creator") {
      useCreatorStore.getState().openModal();
    } else if (item.path) {
      navigate(item.path);
    } else if (item.action === "wallet") {
      onNotify?.("Opening Wallet top-up sheet");
    } else if (item.action === "logout") {
      onNotify?.("Logged out");
    } else {
      onNotify?.(`${item.label} is coming soon`);
    }
  };

  const renderGroup = (items: DrawerMenuItem[]) => (
    <div className="space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const badgeCount =
          item.id === "notifications" && unreadNotifications > 0
            ? unreadNotifications
            : item.badge;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleItemClick(item)}
            className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-[14px] font-semibold transition-all duration-150 cursor-pointer ${
              item.danger
                ? "text-rose hover:bg-rose-50"
                : "text-ink hover:bg-paper active:scale-98"
            }`}
          >
            <span className="relative grid h-8 w-8 place-items-center rounded-full bg-paper text-ink-soft transition-transform group-hover:scale-105 group-hover:bg-surface group-hover:shadow-xs">
              <Icon
                className="h-4 w-4"
                strokeWidth={2}
              />
              {item.live && (
                <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-rose animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose" />
                </span>
              )}
            </span>

            <span className="flex-1 text-left truncate">{item.label}</span>

            {badgeCount !== undefined && badgeCount > 0 && (
              <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                {badgeCount}
              </span>
            )}

            <ChevronRight className="h-4 w-4 text-faint opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 md:hidden pointer-events-none">
      {/* Backdrop — covers the viewport beneath the z-50 sticky header */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="pointer-events-auto fixed inset-0 z-30 bg-ink/40 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Slide-down / Dropdown Drawer Panel sitting directly below the 56px top bar */}
      <div
        ref={drawerRef}
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className="pointer-events-auto fixed inset-x-0 top-14 bottom-0 z-40 flex flex-col overflow-hidden"
      >
        <div className="flex max-h-[calc(100dvh-72px)] w-full flex-col overflow-hidden rounded-b-[28px] border-b border-line bg-surface shadow-pop animate-scale-in">
          {/* User Profile Header Card */}
          <div className="flex items-center justify-between border-b border-line bg-paper/75 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Avatar src={ME.avatar} alt={ME.name} size={40} />
              <div>
                <span className="block text-[14.5px] font-bold tracking-[-0.01em] text-ink">
                  {ME.name}
                </span>
                <span className="block text-[12px] font-medium text-muted">
                  @{ME.handle}
                </span>
              </div>
            </div>

            {/* Quick Wallet Balance Pill */}
            <div
              onClick={() => {
                onNotify?.(`Wallet Balance: ${coinsBalance.toLocaleString()} Coins — Top-up available`);
              }}
              title="Coins Balance & Top Up"
              className="flex items-center gap-1.5 rounded-full border border-[#e9d6ab] bg-gold-soft px-3 py-1.5 text-gold-deep cursor-pointer active:scale-95 transition-transform select-none"
            >
              <Coins className="h-3.5 w-3.5 stroke-[2.2]" />
              <span className="text-[12.5px] font-extrabold">{coinsBalance.toLocaleString()}</span>
            </div>
          </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 quiet-scroll">
          {/* Group 1: Primary Navigation */}
          <div>
            <div className="mb-1.5 px-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink/40">
              Navigation
            </div>
            {renderGroup(PRIMARY_ITEMS)}
          </div>

          {/* Group 2: For Fans */}
          <div>
            <div className="mb-1.5 px-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink/40">
              For Fans
            </div>
            {renderGroup(FANS_ITEMS)}
          </div>

          {/* Group 3: System & Account */}
          <div>
            <div className="mb-1.5 px-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink/40">
              Account &amp; System
            </div>
            {renderGroup(SYSTEM_ITEMS)}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
