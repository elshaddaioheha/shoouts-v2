import type { AppExperience } from '@/src/features/access/access.types';
import type { ExperienceNavigationConfig } from './navigation.types';

export const EXPERIENCE_NAVIGATION: Record<AppExperience, ExperienceNavigationConfig> = {
  shoouts: {
    experience: 'shoouts',
    label: 'Shoouts',
    defaultRoute: '/(tabs)',
    tabs: [
      { key: 'home', label: 'Home', route: '/(tabs)' },
      { key: 'marketplace', label: 'Market', route: '/(tabs)/marketplace' },
      { key: 'cart', label: 'Cart', route: '/(tabs)/cart' },
      { key: 'downloads', label: 'Downloads', route: '/(tabs)/downloads' },
      { key: 'more', label: 'More', route: '/(tabs)/more' },
    ],
  },
  vault: {
    experience: 'vault',
    label: 'Vault',
    defaultRoute: '/vault',
    tabs: [
      { key: 'vault', label: 'Vault', route: '/vault' },
      { key: 'folders', label: 'Folders', route: '/vault/folders' },
      { key: 'record', label: 'Record', route: '/vault/record' },
      { key: 'shared', label: 'Shared', route: '/vault/shared' },
      { key: 'more', label: 'More', route: '/vault/more' },
    ],
  },
  studio: {
    experience: 'studio',
    label: 'Studio',
    defaultRoute: '/studio',
    tabs: [
      { key: 'studio', label: 'Studio', route: '/studio' },
      { key: 'listings', label: 'Listings', route: '/studio/listings' },
      { key: 'upload', label: 'Upload', route: '/studio/upload' },
      { key: 'promote', label: 'Promote', route: '/studio/promote' },
      { key: 'analytics', label: 'Analytics', route: '/studio/analytics' },
    ],
  },
  hybrid: {
    experience: 'hybrid',
    label: 'Hybrid',
    defaultRoute: '/hybrid',
    tabs: [
      { key: 'hybrid', label: 'Dashboard', route: '/hybrid' },
      { key: 'vault', label: 'Vault', route: '/hybrid/vault' },
      { key: 'studio', label: 'Studio', route: '/hybrid/studio' },
      { key: 'upload', label: 'Publish', route: '/hybrid/publish' },
      { key: 'more', label: 'More', route: '/hybrid/more' },
    ],
  },
};
