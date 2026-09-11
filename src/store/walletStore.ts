import { create } from 'zustand';

export interface LedgerTransaction {
  id: string;
  type: 'purchase_coins' | 'unlock_post' | 'subscription' | 'tip_gift' | 'call_meter' | 'payout';
  amountCoins?: number;
  amountCents?: number;
  creatorName?: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletState {
  // Fan side currency
  coinsBalance: number;
  // Creator side currency
  pendingCredits: number;
  availableCredits: number;
  lifetimeEarned: number;
  transactions: LedgerTransaction[];
  topUpCoins: (coins: number) => void;
  deductCoins: (coins: number, reason: string) => boolean;
  requestPayout: (credits: number) => boolean;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  coinsBalance: 450,
  pendingCredits: 1250,
  availableCredits: 8420,
  lifetimeEarned: 34500,
  transactions: [
    {
      id: 'tx_01',
      type: 'purchase_coins',
      amountCoins: 500,
      amountCents: 499,
      date: 'Today, 2:30 PM',
      status: 'completed',
    },
    {
      id: 'tx_02',
      type: 'unlock_post',
      amountCoins: 50,
      creatorName: 'Sophie Lane',
      date: 'Yesterday, 8:15 PM',
      status: 'completed',
    },
    {
      id: 'tx_03',
      type: 'subscription',
      amountCoins: 100,
      creatorName: 'Luna Rose',
      date: 'Sep 08, 2026',
      status: 'completed',
    },
  ],
  topUpCoins: (coins) =>
    set((state) => ({
      coinsBalance: state.coinsBalance + coins,
      transactions: [
        {
          id: `tx_${Date.now()}`,
          type: 'purchase_coins',
          amountCoins: coins,
          date: 'Just now',
          status: 'completed',
        },
        ...state.transactions,
      ],
    })),
  deductCoins: (coins, reason) => {
    const current = get().coinsBalance;
    if (current < coins) return false;
    set((state) => ({
      coinsBalance: state.coinsBalance - coins,
      transactions: [
        {
          id: `tx_${Date.now()}`,
          type: 'unlock_post',
          amountCoins: coins,
          creatorName: reason,
          date: 'Just now',
          status: 'completed',
        },
        ...state.transactions,
      ],
    }));
    return true;
  },
  requestPayout: (credits) => {
    const available = get().availableCredits;
    if (available < credits) return false;
    set((state) => ({
      availableCredits: state.availableCredits - credits,
      transactions: [
        {
          id: `tx_${Date.now()}`,
          type: 'payout',
          amountCoins: credits,
          date: 'Just now',
          status: 'pending',
        },
        ...state.transactions,
      ],
    }));
    return true;
  },
}));
