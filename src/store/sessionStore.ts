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
  bio?: string;
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

export const DEMO_FAN_USER: UserSession = {
  id: 'usr_demo_fan',
  phone: '+1 (555) 019-2834',
  email: 'demo.fan@luxe.is',
  handle: 'maya.makes',
  displayName: 'Maya Chen',
  avatarUrl: 'https://images.pexels.com/photos/9489925/pexels-photo-9489925.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=160&h=160',
  role: 'fan',
  activeRole: 'fan',
  verificationStatus: 'verified',
  identityStrength: 'verified',
};

export const DEMO_CREATOR_USER: UserSession = {
  id: 'usr_demo_creator',
  phone: '+1 (555) 234-5678',
  email: 'creator@luxe.is',
  handle: 'lunarose',
  displayName: 'Luna Rose',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  role: 'creator',
  activeRole: 'creator',
  verificationStatus: 'verified',
  identityStrength: 'verified',
  bio: 'Ceramic artist & editorial photographer. Sharing studio days, behind-the-scenes, and exclusive drops.',
};

export const useSessionStore = create<SessionState>((set) => ({
  user: DEMO_FAN_USER,
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
