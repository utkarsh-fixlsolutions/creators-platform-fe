import { create } from "zustand";

interface SidebarState {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const STORAGE_KEY = "creators_sidebar_collapsed";

const getInitialCollapsed = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "true";
  } catch {
    return false;
  }
};

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: getInitialCollapsed(),
  toggleSidebar: () =>
    set((state) => {
      const next = !state.isCollapsed;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return { isCollapsed: next };
    }),
  setCollapsed: (collapsed: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // ignore
    }
    set({ isCollapsed: collapsed });
  },
}));
