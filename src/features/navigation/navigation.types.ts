import type { AppExperience } from '@/src/features/access/access.types';

export type AppTabKey =
  | 'home'
  | 'marketplace'
  | 'cart'
  | 'downloads'
  | 'more'
  | 'vault'
  | 'folders'
  | 'record'
  | 'shared'
  | 'studio'
  | 'listings'
  | 'upload'
  | 'promote'
  | 'analytics'
  | 'hybrid';

export type BottomNavItem = {
  key: AppTabKey;
  label: string;
  route: string;
};

export type ExperienceNavigationConfig = {
  experience: AppExperience;
  label: string;
  defaultRoute: string;
  tabs: BottomNavItem[];
};
