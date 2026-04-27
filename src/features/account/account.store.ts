import { getDefaultExperience } from '@/src/features/access/access.helpers';
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

  setProfile: (profile) =>
    set({
      profile,
      role: profile?.role ?? 'shoouts',
      activeExperience: profile?.activeExperience ?? getDefaultExperience(profile?.role),
    }),

  setRole: (role) =>
    set({
      role,
      activeExperience: getDefaultExperience(role),
    }),

  setActiveExperience: (activeExperience) => set({ activeExperience }),

  setPreviewExperience: (previewExperience) => set({ previewExperience }),

  resetAccount: () =>
    set({
      profile: null,
      role: 'shoouts',
      activeExperience: 'shoouts',
      previewExperience: null,
    }),
}));