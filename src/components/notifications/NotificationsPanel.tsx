import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck, SlidersHorizontal } from "lucide-react";
import { useNotificationStore } from "../../store/notificationStore";
import { NotificationRow } from "./NotificationRow";
import { NotificationTabs, type NotificationTab } from "./NotificationTabs";
import { useClickOutside } from "../../hooks/useClickOutside";
import type { NotificationItem } from "../../data";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateNotifications?: () => void;
  onNotify?: (msg: string) => void;
}

export function NotificationsPanel({
  isOpen,
  onClose,
  onNavigateNotifications,
  onNotify,
}: NotificationsPanelProps) {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<NotificationTab>("all");

  useClickOutside(panelRef, onClose, isOpen);

  const { items, toggleRead, dismiss, markAllRead } = useNotificationStore();

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (tab === "all") return true;
      return item.cat.includes(tab);
    });
  }, [items, tab]);

  const counts = useMemo(() => {
    return {
      all: items.filter((i) => i.unread).length,
      follows: items.filter((i) => i.unread && i.cat.includes("follows")).length,
      verified: items.filter((i) => i.unread && i.cat.includes("verified")).length,
      comments: items.filter((i) => i.unread && i.cat.includes("comments")).length,
    };
  }, [items]);

  const todayItems = useMemo(
    () => filteredItems.filter((i) => i.day === "today"),
    [filteredItems]
  );
  const earlierItems = useMemo(
    () => filteredItems.filter((i) => i.day === "earlier"),
    [filteredItems]
  );

  const handleAction = (item: NotificationItem) => {
    if (item.kind === "message") {
      navigate("/messages");
      onClose();
    } else if (item.kind === "live") {
      navigate("/app");
      onClose();
    } else if (item.action) {
      onNotify?.(`${item.action}: ${item.name}`);
    }
  };

  const handleViewAll = () => {
    if (onNavigateNotifications) {
      onNavigateNotifications();
    } else {
      navigate("/notifications");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 z-50 w-[436px] max-w-[calc(100vw-2rem)] rounded-3xl border border-line bg-surface shadow-float overflow-hidden flex flex-col max-h-[660px] animate-fade-in text-ink"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <h2 className="font-display text-[21px] font-bold text-ink">
          Notifications
        </h2>
        <button
          type="button"
          onClick={() => {
            markAllRead();
            onNotify?.("All notifications marked as read");
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line bg-paper text-[12px] font-bold text-ink-soft hover:bg-paper-warm hover:text-ink transition-colors cursor-pointer select-none"
        >
          <CheckCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
          <span>Mark all read</span>
        </button>
      </div>

      {/* Tabs */}
      <NotificationTabs
        active={tab}
        onChange={setTab}
        counts={counts}
        variant="desktop-panel"
      />

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none]">
        {filteredItems.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <h3 className="font-display text-[19px] font-bold text-ink">
              Nothing here yet
            </h3>
            <p className="text-[12.5px] text-muted mt-1.5">
              Switch filters to see the rest of your activity.
            </p>
          </div>
        ) : (
          <div>
            {/* TODAY Group */}
            {todayItems.length > 0 && (
              <div>
                <div className="px-5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink/40 bg-surface">
                  Today
                </div>
                {todayItems.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    compact
                    onToggleRead={toggleRead}
                    onDismiss={dismiss}
                    onAction={handleAction}
                  />
                ))}
              </div>
            )}

            {/* EARLIER Group */}
            {earlierItems.length > 0 && (
              <div>
                <div className="px-5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink/40 bg-surface">
                  Earlier
                </div>
                {earlierItems.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    compact
                    onToggleRead={toggleRead}
                    onDismiss={dismiss}
                    onAction={handleAction}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-line bg-paper">
        <button
          type="button"
          onClick={handleViewAll}
          className="text-[12.5px] font-bold text-brand hover:underline cursor-pointer"
        >
          View all activity
        </button>
        <button
          type="button"
          onClick={() => onNotify?.("Notification preferences")}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-ink transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2.1} />
          <span>Preferences</span>
        </button>
      </div>
    </div>
  );
}
