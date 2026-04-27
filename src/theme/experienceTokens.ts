import type { AppExperience, UserRole } from '@/src/features/access/access.types';

export type ExperienceToken = {
  id: AppExperience | UserRole;
  label: string;
  accent: string;
  accentSoftDark: string;
  accentSoftLight: string;
  gradient: readonly [string, string];
};

export const experienceTokens: Record<AppExperience | UserRole, ExperienceToken> = {
  shoouts: {
    id: 'shoouts',
    label: 'Shoouts',
    accent: '#EC5C39',
    accentSoftDark: 'rgba(236,92,57,0.18)',
    accentSoftLight: 'rgba(236,92,57,0.12)',
    gradient: ['#EC5C39', '#FF8A5B'],
  },
  vault: {
    id: 'vault',
    label: 'Vault',
    accent: '#7C5CFF',
    accentSoftDark: 'rgba(124,92,255,0.2)',
    accentSoftLight: 'rgba(124,92,255,0.12)',
    gradient: ['#7C5CFF', '#B8A6FF'],
  },
  vault_pro: {
    id: 'vault_pro',
    label: 'Vault Pro',
    accent: '#9B6DFF',
    accentSoftDark: 'rgba(155,109,255,0.2)',
    accentSoftLight: 'rgba(155,109,255,0.12)',
    gradient: ['#9B6DFF', '#D0B8FF'],
  },
  studio: {
    id: 'studio',
    label: 'Studio',
    accent: '#4CAF50',
    accentSoftDark: 'rgba(76,175,80,0.18)',
    accentSoftLight: 'rgba(76,175,80,0.12)',
    gradient: ['#4CAF50', '#8AE68E'],
  },
  hybrid: {
    id: 'hybrid',
    label: 'Hybrid',
    accent: '#FFD700',
    accentSoftDark: 'rgba(255,215,0,0.18)',
    accentSoftLight: 'rgba(255,215,0,0.14)',
    gradient: ['#FFD700', '#FF9F1C'],
  },
};
