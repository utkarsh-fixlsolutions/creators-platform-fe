import { create } from "zustand";
import { INITIAL_NOTIFICATIONS, type NotificationItem } from "../data";

interface NotificationState {
  items: NotificationItem[];
  unreadCount: () => number;
  toggleRead: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: INITIAL_NOTIFICATIONS,
  unreadCount: () => get().items.filter((i) => i.unread).length,
  toggleRead: (id) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, unread: !i.unread } : i)),
    })),
  markRead: (id) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, unread: false } : i)),
    })),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((i) => ({ ...i, unread: false })),
    })),
  dismiss: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),
}));
