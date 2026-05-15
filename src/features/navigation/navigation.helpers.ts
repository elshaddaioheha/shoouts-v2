import type { AppExperience } from '@/src/features/access/access.types';

const sharedExperiencePrefixes = ['/settings'];
const sharedExperiencePaths = new Set(['/messages', '/saved', '/purchases']);

export function normalizeNavigationPath(path: string) {
  const withoutGroups = path.replace(/\/\([^/]+\)/g, '');
  const collapsed = withoutGroups.replace(/\/{2,}/g, '/');
  const trimmed = collapsed !== '/' ? collapsed.replace(/\/$/, '') : collapsed;
  return trimmed.length > 0 ? trimmed : '/';
}

export function normalizeExperienceValue(value: unknown): AppExperience | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const normalizedValue = String(rawValue ?? '').trim().toLowerCase();

  if (
    normalizedValue === 'shoouts' ||
    normalizedValue === 'vault' ||
    normalizedValue === 'studio' ||
    normalizedValue === 'hybrid'
  ) {
    return normalizedValue;
  }

  return null;
}

export function isSharedExperienceRoute(pathname: string) {
  const normalizedPath = normalizeNavigationPath(pathname);

  return (
    sharedExperiencePaths.has(normalizedPath) ||
    sharedExperiencePrefixes.some(
      (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
    )
  );
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

export function deriveExperienceFromRouteContext(
  pathname: string,
  source?: unknown
): AppExperience {
  const sourceExperience = normalizeExperienceValue(source);

  if (sourceExperience && isSharedExperienceRoute(pathname)) {
    return sourceExperience;
  }

  return deriveExperienceFromPathname(pathname);
}
