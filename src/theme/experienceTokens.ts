import type { AppExperience, UserRole } from '@/src/features/access/access.types';

export type ExperienceTone = {
  id: AppExperience | UserRole;
  label: string;

  accent: string;
  accentHover: string;
  accentPressed: string;

  dark: {
    background: string;
    surface: string;
    surfaceElevated: string;
    accentSoft: string;
    accentBorder: string;
  };

  light: {
    background: string;
    surface: string;
    surfaceElevated: string;
    accentSoft: string;
    accentBorder: string;
  };

  gradient: readonly [string, string];
  mediaGradient?: readonly [string, string];
};

export const experienceTokens: Record<AppExperience | UserRole, ExperienceTone> = {
  shoouts: {
    id: 'shoouts',
    label: 'Shoouts',
    accent: '#EC5C39',
    accentHover: '#FF704D',
    accentPressed: '#C9472B',
    dark: {
      background: '#140F10',
      surface: '#1E1819',
      surfaceElevated: '#2A2022',
      accentSoft: 'rgba(236,92,57,0.16)',
      accentBorder: 'rgba(236,92,57,0.36)',
    },
    light: {
      background: '#FFF7F2',
      surface: '#FFFFFF',
      surfaceElevated: '#FFF1EA',
      accentSoft: 'rgba(236,92,57,0.11)',
      accentBorder: 'rgba(236,92,57,0.28)',
    },
    gradient: ['#EC5C39', '#FF8A5B'],
    mediaGradient: ['#522007', '#666666'],
  },

  vault: {
    id: 'vault',
    label: 'Vault',
    accent: '#E65AD4',
    accentHover: '#FF7BE1',
    accentPressed: '#B934A9',
    dark: {
      background: '#111111',
      surface: '#1A1A1A',
      surfaceElevated: '#242424',
      accentSoft: 'rgba(230,90,212,0.18)',
      accentBorder: 'rgba(230,90,212,0.36)',
    },
    light: {
      background: '#FFF5FC',
      surface: '#FFFFFF',
      surfaceElevated: '#FFE9F8',
      accentSoft: 'rgba(230,90,212,0.12)',
      accentBorder: 'rgba(230,90,212,0.28)',
    },
    gradient: ['#E65AD4', '#FFB7D6'],
  },

  vault_pro: {
    id: 'vault_pro',
    label: 'Vault Pro',
    accent: '#9B6DFF',
    accentHover: '#B48CFF',
    accentPressed: '#7446D8',
    dark: {
      background: '#130E1F',
      surface: '#1E1730',
      surfaceElevated: '#2A2140',
      accentSoft: 'rgba(155,109,255,0.18)',
      accentBorder: 'rgba(155,109,255,0.4)',
    },
    light: {
      background: '#FAF6FF',
      surface: '#FFFFFF',
      surfaceElevated: '#F2E9FF',
      accentSoft: 'rgba(155,109,255,0.12)',
      accentBorder: 'rgba(155,109,255,0.3)',
    },
    gradient: ['#9B6DFF', '#D0B8FF'],
  },

  studio: {
    id: 'studio',
    label: 'Studio',
    accent: '#22C55E',
    accentHover: '#3DDC78',
    accentPressed: '#159447',
    dark: {
      background: '#07140D',
      surface: '#102018',
      surfaceElevated: '#183326',
      accentSoft: 'rgba(34,197,94,0.16)',
      accentBorder: 'rgba(34,197,94,0.34)',
    },
    light: {
      background: '#F2FFF7',
      surface: '#FFFFFF',
      surfaceElevated: '#E9FFF1',
      accentSoft: 'rgba(34,197,94,0.11)',
      accentBorder: 'rgba(34,197,94,0.28)',
    },
    gradient: ['#22C55E', '#86EFAC'],
  },

  hybrid: {
    id: 'hybrid',
    label: 'Hybrid',
    accent: '#F5B700',
    accentHover: '#FFD24A',
    accentPressed: '#C88F00',
    dark: {
      background: '#171204',
      surface: '#241B08',
      surfaceElevated: '#33270B',
      accentSoft: 'rgba(245,183,0,0.17)',
      accentBorder: 'rgba(245,183,0,0.38)',
    },
    light: {
      background: '#FFFBEB',
      surface: '#FFFFFF',
      surfaceElevated: '#FFF4C7',
      accentSoft: 'rgba(245,183,0,0.13)',
      accentBorder: 'rgba(245,183,0,0.3)',
    },
    gradient: ['#F5B700', '#FF8A00'],
  },
};
