import { create } from 'zustand';
import type { AuthUser, StartupStatus } from './auth.types';

type AuthState = {
  ready: boolean;
  user: AuthUser | null;
  isAuthenticated: boolean;
  startupStatus: StartupStatus;
  startupMessage: string | null;
  setReady: (ready: boolean) => void;
  setSession: (user: AuthUser) => void;
  clearSession: () => void;
  setStartupState: (status: StartupStatus, message?: string | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  ready: false,
  user: null,
  isAuthenticated: false,
  startupStatus: 'ready',
  startupMessage: null,

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

  setStartupState: (startupStatus, startupMessage = null) =>
    set({
      startupStatus,
      startupMessage,
    }),
}));
