import { create } from 'zustand';
import { storage } from '../utils/storage';
import { UserProfile } from '../types/api';

interface AuthState {
  accessToken: string | null;
  user: UserProfile | null;
  setAuth: (accessToken: string, refreshToken: string, user: UserProfile) => Promise<void>;
  setAccessToken: (token: string) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,

  setAuth: async (accessToken, refreshToken, user) => {
    await storage.set('refreshToken', refreshToken);
    await storage.set('user', JSON.stringify(user));
    set({ accessToken, user });
  },

  setAccessToken: (accessToken) => set({ accessToken }),

  logout: async () => {
    await storage.delete('refreshToken');
    await storage.delete('user');
    set({ accessToken: null, user: null });
  },

  hydrate: async () => {
    const userJson = await storage.get('user');
    if (userJson) {
      try {
        set({ user: JSON.parse(userJson) });
      } catch {
        await storage.delete('user');
      }
    }
  },
}));
