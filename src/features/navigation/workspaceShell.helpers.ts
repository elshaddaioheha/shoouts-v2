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
      `${featureLabel} needs ${upgradeLabel}. Upgrade your plan to unlock ${experience}.`
    );
    return;
  }

  Alert.alert('Coming soon', shellMessage);
}

export function buildAccountHealthNotice(
  profile: AccountProfile | null,
  workspaceLabel: string
) {
  if (!profile) {
    return {
      title: `${workspaceLabel} is getting your account ready`,
      description:
        'We are still loading your account details. Some counters and actions may look limited for now.',
    };
  }

  if (profile.dataHealth.profileSource === 'fallback') {
    return {
      title: `${workspaceLabel} is using basic account data`,
      description:
        'You are signed in, but full profile data has not synced yet. Workspace info stays minimal until sync completes.',
    };
  }

  if (profile.dataHealth.userDocState === 'partial') {
    const fieldList = profile.dataHealth.missingFields.slice(0, 3).join(', ');
    return {
      title: `${workspaceLabel} account details need a quick refresh`,
      description: fieldList
        ? `Some account fields are still incomplete (${fieldList}). Safe defaults are in use for now.`
        : 'Some account fields are still incomplete. Safe defaults are in use for now.',
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
