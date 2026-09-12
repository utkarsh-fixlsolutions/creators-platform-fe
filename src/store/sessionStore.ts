import { create } from 'zustand';

export interface UserSession {
  id: string;
  phone?: string;
  email?: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  role: 'fan' | 'creator' | 'both';
  activeRole: 'fan' | 'creator';
  verificationStatus: 'none' | 'pending' | 'verified' | 'rejected';
  identityStrength: 'weak' | 'standard' | 'verified';
}

interface SessionState {
  user: UserSession | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  setUser: (user: UserSession | null) => void;
  switchActiveRole: (role: 'fan' | 'creator') => void;
  login: (user: UserSession, token: string) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: {
    id: 'usr_demo_01',
    phone: '+1 (555) 234-5678',
    email: 'creator@luxe.is',
    handle: 'lunarose',
    displayName: 'Luna Rose',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    role: 'both',
    activeRole: 'fan',
    verificationStatus: 'verified',
    identityStrength: 'verified',
  },
  isAuthenticated: true,
  accessToken: 'demo_jwt_token',
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  switchActiveRole: (activeRole) =>
    set((state) => ({
      user: state.user ? { ...state.user, activeRole } : null,
    })),
  login: (user, token) => set({ user, isAuthenticated: true, accessToken: token }),
  logout: () => set({ user: null, isAuthenticated: false, accessToken: null }),
}));
