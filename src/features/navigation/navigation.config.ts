import type { AppExperience } from '@/src/features/access/access.types';
import type { ExperienceNavigationConfig } from './navigation.types';

export const EXPERIENCE_NAVIGATION: Record<AppExperience, ExperienceNavigationConfig> = {
  shoouts: {
    experience: 'shoouts',
    label: 'Shoouts',
    defaultRoute: '/(tabs)',
    tabs: [
      { key: 'home', label: 'Home', route: '/(tabs)', icon: 'home' },
      { key: 'marketplace', label: 'Market', route: '/(tabs)/marketplace', icon: 'market' },
      { key: 'cart', label: 'Cart', route: '/(tabs)/cart', icon: 'cart' },
      { key: 'more', label: 'More', route: '/(tabs)/more', icon: 'more' },
    ],
  },
  vault: {
    experience: 'vault',
    label: 'Vault',
    defaultRoute: '/vault',
    tabs: [
      { key: 'vault', label: 'Vault', route: '/vault', icon: 'vault' },
      { key: 'folders', label: 'Folders', route: '/vault/folders', icon: 'folders' },
      { key: 'record', label: 'Record', route: '/vault/record', icon: 'record' },
      { key: 'shared', label: 'Shared', route: '/vault/shared', icon: 'shared' },
      { key: 'more', label: 'More', route: '/vault/more', icon: 'more' },
    ],
  },
  studio: {
    experience: 'studio',
    label: 'Studio',
    defaultRoute: '/studio',
    tabs: [
      { key: 'studio', label: 'Studio', route: '/studio', icon: 'studio' },
      { key: 'listings', label: 'Listings', route: '/studio/listings', icon: 'listings' },
      { key: 'upload', label: 'Upload', route: '/studio/upload', icon: 'upload' },
      { key: 'promote', label: 'Promote', route: '/studio/promote', icon: 'promote' },
      { key: 'analytics', label: 'Analytics', route: '/studio/analytics', icon: 'analytics' },
    ],
  },
  hybrid: {
    experience: 'hybrid',
    label: 'Hybrid',
    defaultRoute: '/hybrid',
    tabs: [
      { key: 'hybrid', label: 'Dashboard', route: '/hybrid', icon: 'hybrid' },
      { key: 'vault', label: 'Vault', route: '/hybrid/vault', icon: 'vault' },
      { key: 'studio', label: 'Studio', route: '/hybrid/studio', icon: 'studio' },
      { key: 'upload', label: 'Publish', route: '/hybrid/publish', icon: 'upload' },
      { key: 'more', label: 'More', route: '/hybrid/more', icon: 'more' },
    ],
  },
};
