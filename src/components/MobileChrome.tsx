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

/** Sticky top bar — phones only */
export function MobileTopBar({ onNotify }: Pick<Props, "onNotify">) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/85 backdrop-blur-xl md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Logo />
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => onNotify("You're all caught up")}
            className="relative grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface"
          >
            <Bell className="h-[21px] w-[21px]" strokeWidth={1.9} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose ring-2 ring-paper" />
          </button>
          <button type="button" aria-label="Your profile" className="ml-1">
            <Avatar src={ME.avatar} alt={ME.name} size={34} />
          </button>
        </div>
      </div>
    </header>
  );
}

const MOBILE_ITEMS: NavItem[] = [
  { id: "discover", label: "Discover", icon: Compass, tab: "foryou" },
  { id: "following", label: "Following", icon: Users, tab: "following" },
  { id: "exclusive", label: "Exclusive", icon: Crown, tab: "exclusive" },
];

/** Fixed bottom navigation — phones only */
export function MobileBottomNav({ activeTab, onNavigate, onCreate }: Omit<Props, "onNotify">) {
  const activeId = navIdForTab(activeTab);
  const [discover, following, exclusive] = MOBILE_ITEMS;

  const Item = ({ item }: { item: NavItem }) => {
    const active = item.id === activeId;
    return (
      <button
        type="button"
        onClick={() => onNavigate(item)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-[10.5px] font-semibold tracking-wide transition-colors",
          active ? "text-ink" : "text-muted",
        )}
      >
        <span
          className={cn(
            "grid h-8 w-12 place-items-center rounded-full transition-all duration-300",
            active ? "bg-ink text-white shadow-ink" : "",
          )}
        >
          <item.icon className="h-[20px] w-[20px]" strokeWidth={active ? 2.2 : 1.9} />
        </span>
        {item.label}
      </button>
    );
  };

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line/80 bg-paper/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="flex items-end justify-between px-3 pt-1.5">
        <Item item={discover} />
        <Item item={following} />
        <button
          type="button"
          onClick={onCreate}
          aria-label="Create"
          className="-mt-5 mx-1 grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-brand transition-transform duration-200 active:scale-95"
        >
          <Plus className="h-6 w-6" strokeWidth={2.4} />
        </button>
        <Item item={exclusive} />
        <button
          type="button"
          onClick={() => onNavigate({ id: "profile", label: "Profile", icon: Users })}
          className="flex flex-1 flex-col items-center gap-1 py-1.5 text-[10.5px] font-semibold tracking-wide text-muted"
        >
          <span className="grid h-8 place-items-center">
            <Avatar src={ME.avatar} alt={ME.name} size={26} />
          </span>
          Profile
        </button>
      </div>
    </nav>
  );
}
