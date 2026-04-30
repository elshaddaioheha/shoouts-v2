import type { AppExperience } from '@/src/features/access/access.types';

export function normalizeNavigationPath(path: string) {
  const withoutGroups = path.replace(/\/\([^/]+\)/g, '');
  const collapsed = withoutGroups.replace(/\/{2,}/g, '/');
  const trimmed = collapsed !== '/' ? collapsed.replace(/\/$/, '') : collapsed;
  return trimmed.length > 0 ? trimmed : '/';
}

export function deriveExperienceFromPathname(pathname: string): AppExperience {
  const normalizedPath = normalizeNavigationPath(pathname);

  if (normalizedPath.startsWith('/vault')) {
    return 'vault';
  }

  if (normalizedPath.startsWith('/studio')) {
    return 'studio';
  }

  if (normalizedPath.startsWith('/hybrid')) {
    return 'hybrid';
  }

  return 'shoouts';
}
