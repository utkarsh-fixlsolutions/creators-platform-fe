import { Bell, Compass, Crown, Plus, Users } from "lucide-react";
import type { FeedTab } from "../data";
import { ME } from "../data";
import { cn } from "../utils/cn";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";
import { navIdForTab, type NavItem } from "./Sidebar";

interface Props {
  activeTab: FeedTab;
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
            {/* Animated Radar Beacon Dot */}
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                  isLiveActive ? "bg-white" : "bg-rose"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex h-2 w-2 rounded-full ring-1.5",
                  isLiveActive ? "bg-white ring-rose" : "bg-rose ring-surface"
                )}
              />
            </span>

            {/* Label + Dynamic Equalizer Animation */}
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "text-[11px] font-extrabold tracking-[0.05em] uppercase",
                  isLiveActive ? "text-white" : "text-ink group-hover:text-rose transition-colors"
                )}
              >
                Live
              </span>

              {/* 3 Animated Soundwave/Equalizer Bars */}
              <div className="flex h-2.5 items-end gap-[1.5px]" aria-hidden="true">
                <span
                  className={cn(
                    "w-[1.8px] rounded-full animate-eq-1",
                    isLiveActive ? "bg-white" : "bg-rose"
                  )}
                />
                <span
                  className={cn(
                    "w-[1.8px] rounded-full animate-eq-2",
                    isLiveActive ? "bg-white" : "bg-rose"
                  )}
                />
                <span
                  className={cn(
                    "w-[1.8px] rounded-full animate-eq-3",
                    isLiveActive ? "bg-white" : "bg-rose"
                  )}
                />
              </div>

              {/* Count Badge */}
              <span
                className={cn(
                  "flex items-center rounded-full px-1.5 py-0 text-[10px] font-bold",
                  isLiveActive
                    ? "bg-white/25 text-white"
                    : "bg-rose-soft text-rose"
                )}
              >
                3
              </span>
            </div>
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

const MOBILE_ITEMS: NavItem[] = [
  { id: "foryou", label: "Discover", icon: Compass, tab: "foryou" },
  { id: "following", label: "Following", icon: Users, tab: "following" },
  { id: "exclusive", label: "Exclusive", icon: Crown, tab: "exclusive" },
];

/** Floating Capsule Bottom Navigation — Mobile Mode */
export function MobileBottomNav({ activeTab, onNavigate, onCreate }: Omit<Props, "onNotify">) {
  const [discover, following, exclusive] = MOBILE_ITEMS;

  const NavPill = ({ item }: { item: NavItem }) => {
    const active = item.tab ? item.tab === activeTab : item.id === activeTab;
    const Icon = item.icon;

    return (
      <button
        type="button"
        onClick={() => onNavigate(item)}
        aria-current={active ? "page" : undefined}
        aria-label={item.label}
        className={cn(
          "group relative flex items-center justify-center transition-all duration-300 ease-out select-none",
          active
            ? "h-11 rounded-full bg-ink px-4 text-white shadow-ink"
            : "h-11 w-11 rounded-full text-muted hover:bg-paper/80 hover:text-ink active:scale-95"
        )}
      >
        <Icon
          className={cn(
            "transition-transform duration-300",
            active ? "h-[19px] w-[19px]" : "h-[20px] w-[20px] group-hover:scale-105"
          )}
          strokeWidth={active ? 2.3 : 1.9}
        />
        {active && (
          <span className="ml-2 text-[13.5px] font-semibold tracking-[-0.01em] whitespace-nowrap animate-fade-in">
            {item.label}
          </span>
        )}
      </button>
    );
  };

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-5 inset-x-0 z-40 mx-auto flex w-fit min-w-[340px] max-w-[calc(100%-2rem)] items-center justify-between rounded-full border border-line/80 bg-surface/90 px-2.5 py-1.5 shadow-[0_16px_40px_-10px_rgba(18,18,24,0.25)] ring-1 ring-white/80 backdrop-blur-2xl md:hidden"
    >
      <div className="flex w-full items-center justify-between gap-1.5 sm:gap-2">
        {/* Discover */}
        <NavPill item={discover} />

        {/* Following */}
        <NavPill item={following} />

        {/* Create Action Button */}
        <button
          type="button"
          onClick={onCreate}
          aria-label="Create new post"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white shadow-brand transition-all duration-300 hover:bg-brand-deep hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" strokeWidth={2.4} />
        </button>

        {/* Exclusive */}
        <NavPill item={exclusive} />

        {/* Profile */}
        <button
          type="button"
          onClick={() => onNavigate({ id: "profile", label: "Profile", icon: Users })}
          aria-label="Profile"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted hover:bg-paper/80 hover:text-ink active:scale-95 transition-all duration-300"
        >
          <Avatar src={ME.avatar} alt={ME.name} size={30} />
        </button>
      </div>
    </nav>
  );
}
