import { Alert } from 'react-native';
import {
  canAccessExperience,
  getRoleConfig,
  getUpgradeTarget,
} from '@/src/features/access/access.helpers';
import type { AppExperience, UserRole } from '@/src/features/access/access.types';
import type { AccountProfile } from '@/src/features/account/account.types';

export type WorkspaceCardStatus = 'available' | 'shell' | 'locked';

export function getWorkspaceCardStatus(
  role: UserRole,
  experience: AppExperience,
  isImplemented = false
): WorkspaceCardStatus {
  if (!canAccessExperience(role, experience)) {
    return 'locked';
  }

  return isImplemented ? 'available' : 'shell';
}

export function openWorkspaceGate(
  role: UserRole,
  experience: AppExperience,
  featureLabel: string,
  shellMessage: string
) {
  if (!canAccessExperience(role, experience)) {
    const upgradeTarget = getUpgradeTarget(role);
    const upgradeLabel = upgradeTarget ? getRoleConfig(upgradeTarget).label : 'a higher plan';
    Alert.alert(
      'Upgrade required',
      `${featureLabel} is gated in this workspace. Upgrade to ${upgradeLabel} to unlock ${experience}.`
    );
    return;
  }

  Alert.alert('Shell in progress', shellMessage);
}

export function buildAccountHealthNotice(
  profile: AccountProfile | null,
  workspaceLabel: string
) {
  if (!profile) {
    return {
      title: `${workspaceLabel} is waiting for account data`,
      description:
        'The shell is rendering without a resolved account profile yet, so counts and gating may stay conservative.',
    };
  }

  if (profile.dataHealth.profileSource === 'fallback') {
    return {
      title: `${workspaceLabel} is running on fallback profile data`,
      description:
        'The signed-in session is valid, but users/{uid} is missing or unreadable. Workspace metrics stay minimal until profile sync recovers.',
    };
  }

  if (profile.dataHealth.userDocState === 'partial') {
    const fieldList = profile.dataHealth.missingFields.slice(0, 3).join(', ');
    return {
      title: `${workspaceLabel} account data is partial`,
      description: fieldList
        ? `Some profile fields are missing or adjusted: ${fieldList}. The shell is using safe defaults where needed.`
        : 'Some profile fields are missing, so the shell is using safe defaults where needed.',
    };
  }

  return null;
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function getVaultCapacityRatio(profile: AccountProfile | null, role: UserRole) {
  const totalBytes = getRoleConfig(role).limits.vaultStorageGb * 1024 * 1024 * 1024;
  if (!profile || totalBytes <= 0) {
    return 0;
  }

  return Math.min(
    1,
    Math.max(0, profile.usage.vaultStorageUsedBytes / totalBytes)
  );
}
