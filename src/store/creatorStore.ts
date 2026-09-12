import { create } from "zustand";

interface CreatorStoreState {
  isModalOpen: boolean;
  hasApplied: boolean;
  openModal: () => void;
  closeModal: () => void;
  apply: () => void;
  reset: () => void;
}

export const useCreatorStore = create<CreatorStoreState>((set) => ({
  isModalOpen: false,
  hasApplied: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  apply: () => set({ hasApplied: true }),
  reset: () => set({ isModalOpen: false, hasApplied: false }),
}));
