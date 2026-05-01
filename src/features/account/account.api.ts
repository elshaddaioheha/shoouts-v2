import { getFirebaseDb } from '@/src/config/firebase';
import {
  getDefaultExperience,
  normalizeRole,
} from '@/src/features/access/access.helpers';
import type {
  AppExperience,
  SubscriptionStatus,
  UserRole,
} from '@/src/features/access/access.types';
import type { AuthUser } from '@/src/features/auth/auth.types';
import { doc, getDoc } from 'firebase/firestore';
import type { AccountProfile, SellerVerificationStatus } from './account.types';

const USERS_COLLECTION = 'users';

export function buildFallbackAccountProfile(user: AuthUser): AccountProfile {
  const role: UserRole = 'shoouts';

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: null,
    role,
    activeExperience: getDefaultExperience(role),
    subscriptionStatus: 'free',
    onboarding: {
      hasSeenOnboarding: true,
      needsRoleSelection: false,
      selectedRole: role,
      studioSetupCompletedAt: null,
    },
    seller: {
      verificationStatus: 'not_started',
      payoutsEnabled: false,
    },
    usage: {
      vaultStorageUsedBytes: 0,
      vaultUploadCount: 0,
    },
  };
}

export async function fetchAccountProfile(user: AuthUser): Promise<AccountProfile> {
  const db = getFirebaseDb();
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, user.uid));

  if (!snapshot.exists()) {
    return buildFallbackAccountProfile(user);
  }

  const raw = snapshot.data();
  const onboarding = asRecord(raw.onboarding);
  const seller = asRecord(raw.seller);
  const usage = asRecord(raw.usage);
  const subscription = asRecord(raw.subscription);
  const role = normalizeRole(
    asString(raw.role) ?? asString(onboarding.selectedRole) ?? 'shoouts'
  );
  const selectedRole = normalizeOptionalRole(
    onboarding.selectedRole ?? raw.selectedRole ?? raw.role
  );
  const activeExperience = normalizeExperience(
    raw.activeExperience ?? raw.lastExperience ?? raw.workspace,
    getDefaultExperience(role)
  );

  return {
    uid: user.uid,
    email: asNullableString(raw.email) ?? user.email,
    displayName:
      asNullableString(raw.displayName) ??
      asNullableString(raw.username) ??
      user.displayName,
    photoURL:
      asNullableString(raw.photoURL) ??
      asNullableString(raw.avatarUrl) ??
      asNullableString(raw.profileImageUrl),
    role,
    activeExperience,
    subscriptionStatus: normalizeSubscriptionStatus(
      raw.subscriptionStatus ?? subscription.status
    ),
    onboarding: {
      hasSeenOnboarding: asBoolean(onboarding.hasSeenOnboarding) ?? true,
      needsRoleSelection:
        asBoolean(onboarding.needsRoleSelection) ?? selectedRole === null,
      selectedRole,
      studioSetupCompletedAt: toIsoString(onboarding.studioSetupCompletedAt ?? raw.studioSetupCompletedAt),
    },
    seller: {
      verificationStatus: normalizeVerificationStatus(
        seller.verificationStatus ?? raw.verificationStatus
      ),
      payoutsEnabled: asBoolean(seller.payoutsEnabled ?? raw.payoutsEnabled) ?? false,
    },
    usage: {
      vaultStorageUsedBytes: asNumber(usage.vaultStorageUsedBytes ?? raw.vaultStorageUsedBytes) ?? 0,
      vaultUploadCount: asNumber(usage.vaultUploadCount ?? raw.vaultUploadCount) ?? 0,
    },
  };
}

function normalizeSubscriptionStatus(value: unknown): SubscriptionStatus {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  if (
    normalized === 'free' ||
    normalized === 'trial' ||
    normalized === 'active' ||
    normalized === 'past_due' ||
    normalized === 'cancelled' ||
    normalized === 'expired'
  ) {
    return normalized;
  }

  return 'free';
}

function normalizeExperience(
  value: unknown,
  fallback: AppExperience
): AppExperience {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  if (
    normalized === 'shoouts' ||
    normalized === 'vault' ||
    normalized === 'studio' ||
    normalized === 'hybrid'
  ) {
    return normalized;
  }

  return fallback;
}

function normalizeOptionalRole(value: unknown): UserRole | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return normalizeRole(String(value));
}

function normalizeVerificationStatus(value: unknown): SellerVerificationStatus {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  if (
    normalized === 'not_started' ||
    normalized === 'pending' ||
    normalized === 'verified' ||
    normalized === 'rejected'
  ) {
    return normalized;
  }

  return 'not_started';
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() || null : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function toIsoString(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return new Date(value).toISOString();
  }

  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    try {
      const maybeTimestamp = value as { toDate?: () => unknown };
      const date = maybeTimestamp.toDate?.();
      return date instanceof Date ? date.toISOString() : null;
    } catch {
      return null;
    }
  }

  return null;
}
