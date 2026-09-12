import { create } from "zustand";
import { CREATORS } from "../data";
import { useWalletStore } from "./walletStore";

export type SubscriptionStatus = "active" | "renewing" | "expired";

export interface SubscriptionItem {
  id: string;
  creatorId: string;
  name: string;
  handle: string;
  verified?: boolean;
  avatar: string;
  tier: "Standard" | "Gold" | "VIP";
  price: number; // Coins/month
  status: SubscriptionStatus;
  renews: string;
}

interface SubscriptionState {
  subscriptions: SubscriptionItem[];
  filterTab: "active" | "expired";
  setFilterTab: (tab: "active" | "expired") => void;
  activeCount: () => number;
  totalMonthlySpend: () => number;
  cancelSubscription: (id: string) => void;
  renewSubscription: (id: string) => boolean;
  tipCreator: (creatorName: string, amount: number) => boolean;
}

const INITIAL_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: "sub_1",
    creatorId: "noor",
    name: "Noor Adeyemi",
    handle: "noor.clay",
    verified: true,
    avatar: "https://images.pexels.com/photos/35240848/pexels-photo-35240848.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=160&h=160",
    tier: "Gold",
    price: 5,
    status: "active",
    renews: "18 Sep",
  },
  {
    id: "sub_2",
    creatorId: "theo",
    name: "Theo Marchetti",
    handle: "theo.shoots",
    verified: true,
    avatar: "https://images.pexels.com/photos/14807440/pexels-photo-14807440.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=160&h=160",
    tier: "Standard",
    price: 8,
    status: "renewing",
    renews: "13 Sep",
  },
  {
    id: "sub_3",
    creatorId: "ines",
    name: "Inês Duarte",
    handle: "ines.draws",
    verified: true,
    avatar: "https://images.pexels.com/photos/14587417/pexels-photo-14587417.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=160&h=160",
    tier: "VIP",
    price: 15,
    status: "active",
    renews: "29 Sep",
  },
  {
    id: "sub_4",
    creatorId: "kofi",
    name: "Kofi Mensah",
    handle: "kofi.wav",
    verified: false,
    avatar: "https://images.pexels.com/photos/7562076/pexels-photo-7562076.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=160&h=160",
    tier: "Standard",
    price: 6,
    status: "expired",
    renews: "2 Sep",
  },
];

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: INITIAL_SUBSCRIPTIONS,
  filterTab: "active",

  setFilterTab: (filterTab) => set({ filterTab }),

  activeCount: () => {
    return get().subscriptions.filter((s) => s.status !== "expired").length;
  },

  totalMonthlySpend: () => {
    return get()
      .subscriptions.filter((s) => s.status !== "expired")
      .reduce((sum, s) => sum + s.price, 0);
  },

  cancelSubscription: (id) => {
    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.id === id ? { ...s, status: "expired" } : s
      ),
    }));
  },

  renewSubscription: (id) => {
    const sub = get().subscriptions.find((s) => s.id === id);
    if (!sub) return false;

    const success = useWalletStore
      .getState()
      .deductCoins(sub.price, `Renewed membership: ${sub.name}`);
    if (!success) return false;

    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.id === id ? { ...s, status: "active", renews: "Next month" } : s
      ),
    }));
    return true;
  },

  tipCreator: (creatorName, amount) => {
    return useWalletStore
      .getState()
      .deductCoins(amount, `Tip to ${creatorName}`);
  },
}));
