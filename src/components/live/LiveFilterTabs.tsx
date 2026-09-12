import { Crown, Radio, Ticket, Users, type LucideIcon } from "lucide-react";
import { TabButton } from "../FeedTabs";
import type { LiveFilterTab } from "../../store/liveStore";

interface LiveTabDef {
  id: LiveFilterTab;
  label: string;
  icon: LucideIcon;
}

export const LIVE_TABS: LiveTabDef[] = [
  { id: "all", label: "All live", icon: Radio },
  { id: "following", label: "Following", icon: Users },
  { id: "subs", label: "My members", icon: Crown },
  { id: "ticketed", label: "Ticketed", icon: Ticket },
];

export const LIVE_TAB_LABELS: Record<LiveFilterTab, string> = {
  all: "Everyone live",
  following: "Creators you follow",
  subs: "Rooms you're a member of",
  ticketed: "Ticketed shows",
};

interface LiveFilterTabsProps {
  active: LiveFilterTab;
  onChange: (tab: LiveFilterTab) => void;
}

export function LiveFilterTabs({ active, onChange }: LiveFilterTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Live stream filters"
      className="inline-flex max-w-full items-center gap-0 overflow-x-auto no-scrollbar rounded-full border border-line bg-surface p-1.5 shadow-card md:gap-0.5"
    >
      {LIVE_TABS.map((tab) => (
        <TabButton
          key={tab.id}
          id={`live-tab-${tab.id}`}
          label={tab.label}
          icon={tab.icon}
          active={active === tab.id}
          onClick={() => onChange(tab.id)}
          fillWhenActive={tab.id === "subs"}
        />
      ))}
    </div>
  );
}
