import {
  canAccessExperience,
  canPreviewExperience,
  getDefaultExperience,
} from '@/src/features/access/access.helpers';
import type { AppExperience, UserRole } from '@/src/features/access/access.types';
import { create } from 'zustand';
import type { AccountProfile } from './account.types';

type AccountState = {
  profile: AccountProfile | null;
  role: UserRole;
  activeExperience: AppExperience;
  previewExperience: AppExperience | null;

  setProfile: (profile: AccountProfile | null) => void;
  setRole: (role: UserRole) => void;
  setActiveExperience: (experience: AppExperience) => void;
  setPreviewExperience: (experience: AppExperience | null) => void;
  resetAccount: () => void;
};

export const useAccountStore = create<AccountState>((set) => ({
  profile: null,
  role: 'shoouts',
  activeExperience: 'shoouts',
  previewExperience: null,

  setProfile: (profile) => {
    const role = profile?.role ?? 'shoouts';
    const requestedExperience = profile?.activeExperience ?? getDefaultExperience(role);
    const activeExperience = canAccessExperience(role, requestedExperience)
      ? requestedExperience
      : getDefaultExperience(role);

    set({
      profile: profile
        ? {
            ...profile,
            activeExperience,
          }
        : null,
      role,
      activeExperience,
      previewExperience: null,
    });
  },

  setRole: (role) =>
    set((state) => {
      const currentExperience = state.activeExperience;
      const nextExperience = canAccessExperience(role, currentExperience)
        ? currentExperience
        : getDefaultExperience(role);

      return {
        role,
        activeExperience: nextExperience,
        previewExperience:
          state.previewExperience && canPreviewExperience(role, state.previewExperience)
            ? state.previewExperience
            : null,
        profile: state.profile
          ? {
              ...state.profile,
              role,
              activeExperience: canAccessExperience(role, nextExperience)
                ? nextExperience
                : getDefaultExperience(role),
              subscriptionTier: role,
            }
          : null,
      };
    }),

  setActiveExperience: (activeExperience) =>
    set((state) => {
      const nextExperience = canAccessExperience(state.role, activeExperience)
        ? activeExperience
        : getDefaultExperience(state.role);

      return {
        activeExperience: nextExperience,
        previewExperience: null,
        profile: state.profile
          ? {
              ...state.profile,
              activeExperience: canAccessExperience(state.role, nextExperience)
                ? nextExperience
                : getDefaultExperience(state.role),
            }
          : null,
      };
    }),

  setPreviewExperience: (previewExperience) =>
    set((state) => ({
      previewExperience:
        previewExperience &&
        !canAccessExperience(state.role, previewExperience) &&
        canPreviewExperience(state.role, previewExperience)
          ? previewExperience
          : null,
    })),

  resetAccount: () =>
    set({
      profile: null,
      role: 'shoouts',
      activeExperience: 'shoouts',
      previewExperience: null,
    }),
}));
