import { create } from 'zustand';
import { setAccessToken } from '../api/client';
import type { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, user: UserProfile) => void;
  setUser: (user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setAuth: (accessToken, user) => {
    setAccessToken(accessToken);
    localStorage.setItem('lb_session', '1');
    set({ user, isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    setAccessToken(null);
    localStorage.removeItem('lb_session');
    set({ user: null, isAuthenticated: false });
  },
}));
