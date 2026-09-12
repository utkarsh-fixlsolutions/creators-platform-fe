import { create } from "zustand";
import {
  FEATURED_LIVE_ROOM,
  LIVE_ROOMS,
  ME,
  SEED_LIVE_CHAT,
  type LiveChatMessage,
  type LiveRoom,
} from "../data";
import { useWalletStore } from "./walletStore";

export type LiveFilterTab = "all" | "following" | "subs" | "ticketed";

export interface EmojiBurst {
  id: number;
  glyph: string;
  left: string;
  dx: string;
  size: string;
  dur: string;
}

interface LiveState {
  rooms: LiveRoom[];
  featuredRoom: LiveRoom;
  activeRoom: LiveRoom | null;
  filterTab: LiveFilterTab;
  chat: LiveChatMessage[];
  bursts: EmojiBurst[];
  selectedTip: number;

  // Actions
  setFilterTab: (tab: LiveFilterTab) => void;
  setActiveRoom: (room: LiveRoom | null) => void;
  setActiveRoomById: (id: string) => LiveRoom | undefined;
  setSelectedTip: (amount: number) => void;
  sendMessage: (text: string) => void;
  react: (glyph: string) => void;
  sendTip: (amount: number, creatorName?: string) => boolean;
  claimTicket: (roomId: string) => boolean;
  subscribe: (creatorId: string) => boolean;
  toggleEntitlement: (roomId: string) => void;
}

let burstSeq = 0;

export const useLiveStore = create<LiveState>((set, get) => ({
  rooms: LIVE_ROOMS,
  featuredRoom: FEATURED_LIVE_ROOM,
  activeRoom: null,
  filterTab: "all",
  chat: SEED_LIVE_CHAT,
  bursts: [],
  selectedTip: 120,

  setFilterTab: (filterTab) => set({ filterTab }),

  setActiveRoom: (activeRoom) => set({ activeRoom }),

  setActiveRoomById: (id) => {
    const state = get();
    if (state.featuredRoom.id === id || state.featuredRoom.creatorId === id) {
      set({ activeRoom: state.featuredRoom });
      return state.featuredRoom;
    }
    const found = state.rooms.find((r) => r.id === id || r.creatorId === id);
    if (found) {
      set({ activeRoom: found });
      return found;
    }
    // Fallback: create an ephemeral room or use featured
    set({ activeRoom: state.featuredRoom });
    return state.featuredRoom;
  },

  setSelectedTip: (selectedTip) => set({ selectedTip }),

  sendMessage: (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newMessage: LiveChatMessage = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      handle: ME.handle,
      avatar: ME.avatar,
      text: trimmed,
      isSubscriber: true,
    };
    set((s) => ({
      chat: [...s.chat, newMessage],
    }));
  },

  react: (glyph) => {
    const id = ++burstSeq;
    const b: EmojiBurst = {
      id,
      glyph,
      left: `${Math.round(Math.random() * 26)}px`,
      dx: `${Math.round(Math.random() * 46 - 30)}px`,
      size: `${17 + Math.round(Math.random() * 12)}px`,
      dur: `${(1.9 + Math.random() * 0.9).toFixed(2)}s`,
    };
    set((s) => ({ bursts: [...s.bursts, b] }));

    setTimeout(() => {
      set((s) => ({ bursts: s.bursts.filter((x) => x.id !== id) }));
    }, 2900);
  },

  sendTip: (amount, creatorName = "Creator") => {
    const deductOk = useWalletStore.getState().deductCoins(amount, `Tip to ${creatorName}`);
    if (!deductOk) return false;

    const tipMessage: LiveChatMessage = {
      id: `tip_${Date.now()}`,
      handle: ME.handle,
      avatar: ME.avatar,
      text: `sent ${amount} Coins! 🪙✨`,
      isSubscriber: true,
      isSystem: true,
    };

    set((s) => ({
      chat: [...s.chat, tipMessage],
    }));
    return true;
  },

  claimTicket: (roomId) => {
    const state = get();
    const targetRoom =
      state.featuredRoom.id === roomId
        ? state.featuredRoom
        : state.rooms.find((r) => r.id === roomId);
    const price = targetRoom?.ticketPrice || 120;

    const deductOk = useWalletStore.getState().deductCoins(price, `Ticket: ${targetRoom?.title || "Live show"}`);
    if (!deductOk) return false;

    set((s) => {
      const updatedRooms = s.rooms.map((r) =>
        r.id === roomId ? { ...r, viewerIsEntitled: true } : r
      );
      const updatedFeatured =
        s.featuredRoom.id === roomId
          ? { ...s.featuredRoom, viewerIsEntitled: true }
          : s.featuredRoom;
      const updatedActive =
        s.activeRoom?.id === roomId
          ? { ...s.activeRoom, viewerIsEntitled: true }
          : s.activeRoom;

      return {
        rooms: updatedRooms,
        featuredRoom: updatedFeatured,
        activeRoom: updatedActive,
      };
    });
    return true;
  },

  subscribe: (creatorId) => {
    const deductOk = useWalletStore.getState().deductCoins(5, `Membership: @${creatorId}`);
    if (!deductOk) return false;

    set((s) => {
      const updatedRooms = s.rooms.map((r) =>
        r.creatorId === creatorId ? { ...r, viewerIsEntitled: true } : r
      );
      const updatedFeatured =
        s.featuredRoom.creatorId === creatorId
          ? { ...s.featuredRoom, viewerIsEntitled: true }
          : s.featuredRoom;
      const updatedActive =
        s.activeRoom?.creatorId === creatorId
          ? { ...s.activeRoom, viewerIsEntitled: true }
          : s.activeRoom;

      return {
        rooms: updatedRooms,
        featuredRoom: updatedFeatured,
        activeRoom: updatedActive,
      };
    });
    return true;
  },

  toggleEntitlement: (roomId) => {
    set((s) => {
      const updatedRooms = s.rooms.map((r) =>
        r.id === roomId ? { ...r, viewerIsEntitled: !r.viewerIsEntitled } : r
      );
      const updatedFeatured =
        s.featuredRoom.id === roomId
          ? { ...s.featuredRoom, viewerIsEntitled: !s.featuredRoom.viewerIsEntitled }
          : s.featuredRoom;
      const updatedActive =
        s.activeRoom?.id === roomId
          ? { ...s.activeRoom, viewerIsEntitled: !s.activeRoom.viewerIsEntitled }
          : s.activeRoom;

      return {
        rooms: updatedRooms,
        featuredRoom: updatedFeatured,
        activeRoom: updatedActive,
      };
    });
  },
}));
