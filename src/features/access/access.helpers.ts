import { ROLE_CONFIG } from './access.config';
import type {
  AppExperience,
  FeaturePermission,
  UserRole,
} from './access.types';

export function normalizeRole(role: string | null | undefined): UserRole {
  const normalized = String(role || '').trim().toLowerCase();

  if (
    normalized === 'shoouts' ||
    normalized === 'vault' ||
    normalized === 'vault_pro' ||
    normalized === 'studio' ||
    normalized === 'hybrid'
  ) {
    return normalized;
  }

  return 'shoouts';
}

export function getRoleConfig(role: string | null | undefined) {
  return ROLE_CONFIG[normalizeRole(role)];
}

export function can(
  role: string | null | undefined,
  permission: FeaturePermission
): boolean {
  return getRoleConfig(role).permissions.includes(permission);
}

export function canAccessExperience(
  role: string | null | undefined,
  experience: AppExperience
): boolean {
  return getRoleConfig(role).availableExperiences.includes(experience);
}

export function canPreviewExperience(
  role: string | null | undefined,
  experience: AppExperience
): boolean {
  const config = getRoleConfig(role);

  return (
    config.availableExperiences.includes(experience) ||
    config.previewExperiences.includes(experience)
  );
}

export function getDefaultExperience(
  role: string | null | undefined
): AppExperience {
  return getRoleConfig(role).defaultExperience;
}

export function getUpgradeTarget(role: string | null | undefined): UserRole | null {
  return getRoleConfig(role).upgradeTarget;
}

export function getVaultLimits(role: string | null | undefined) {
  return getRoleConfig(role).limits;
}