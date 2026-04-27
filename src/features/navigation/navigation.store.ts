import type { AppExperience } from '@/src/features/access/access.types';
import { create } from 'zustand';

type NavigationState = {
  activeExperience: AppExperience;
  setActiveExperience: (experience: AppExperience) => void;
};

export const useExperienceNavigationStore = create<NavigationState>((set) => ({
  activeExperience: 'shoouts',
  setActiveExperience: (activeExperience) => set({ activeExperience }),
}));
