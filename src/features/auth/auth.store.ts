import { create } from 'zustand';
import type { AuthUser } from './auth.types';

type AuthState = {
  ready: boolean;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setReady: (ready: boolean) => void;
  setSession: (user: AuthUser) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  ready: false,
  user: null,
  isAuthenticated: false,

  setReady: (ready) => set({ ready }),

  setSession: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),

  clearSession: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));
