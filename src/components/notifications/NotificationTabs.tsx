import { MessageSquare, ShieldCheck, Sparkles, UserPlus, type LucideIcon } from "lucide-react";
import type { NotificationCategory } from "../../data";
import { TabButton } from "../FeedTabs";
import { cn } from "../../utils/cn";

export type NotificationTab = "all" | NotificationCategory;

export interface TabDef {
  id: NotificationTab;
  label: string;
  icon: LucideIcon;
}

export const NOTIFICATION_TABS: TabDef[] = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "follows", label: "Follows", icon: UserPlus },
  { id: "verified", label: "Verified", icon: ShieldCheck },
  { id: "comments", label: "Comments", icon: MessageSquare },
];

interface NotificationTabsProps {
  active: NotificationTab;
  onChange: (tab: NotificationTab) => void;
  counts?: Record<NotificationTab, number>;
  variant?: "mobile" | "desktop-panel";
}

export function NotificationTabs({
  active,
  onChange,
  counts,
  variant = "mobile",
}: NotificationTabsProps) {
  if (variant === "desktop-panel") {
    return (
      <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] px-4 py-2.5 border-b border-line">
        {NOTIFICATION_TABS.map((tab) => {
          const isActive = active === tab.id;
          const count = counts?.[tab.id] ?? 0;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all select-none cursor-pointer shrink-0",
                isActive
                  ? "bg-ink text-white border-ink shadow-sm"
                  : "bg-surface text-muted border-line hover:border-line-strong hover:text-ink"
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={isActive ? 2.3 : 1.9} />
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "text-[10.5px] font-bold ml-0.5",
                    isActive ? "text-white/70" : "text-brand"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  /* Default / Mobile Full-Page: Reuses TabButton pattern from FeedTabs */
  return (
    <div className="p-1 bg-paper">
      <div
        role="tablist"
        aria-label="Notification filters"
        className="inline-flex max-w-full items-center gap-0 rounded-full border border-line bg-surface p-1 shadow-card overflow-x-auto [scrollbar-width:none] md:gap-0.5"
      >
        {NOTIFICATION_TABS.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            active={active === tab.id}
            onClick={() => onChange(tab.id)}
            fillWhenActive={tab.id === "all"}
          />
        ))}
      </div>
    </div>
  );
}
