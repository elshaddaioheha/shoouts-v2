import { getFirebaseDb } from '@/src/config/firebase';
import {
  canAccessExperience,
  getDefaultExperience,
  getRoleConfig,
  normalizeRole,
} from '@/src/features/access/access.helpers';
import type {
  AppExperience,
  SubscriptionStatus,
  UserRole,
} from '@/src/features/access/access.types';
import type { AuthUser } from '@/src/features/auth/auth.types';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type {
  AccountDataHealth,
  AccountDocumentState,
  AccountProfile,
  SellerVerificationStatus,
} from './account.types';

const USERS_COLLECTION = 'users';
const SUBSCRIPTION_COLLECTION = 'subscription';
const CURRENT_SUBSCRIPTION_DOCUMENT = 'current';

type SubscriptionDocumentResult = {
  exists: boolean;
  data: Record<string, unknown>;
  note?: string;
};

export function buildFallbackAccountProfile(
  user: AuthUser,
  healthOverrides?: Partial<AccountDataHealth>
): AccountProfile {
  const role: UserRole = 'shoouts';

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: null,
    role,
    activeExperience: getDefaultExperience(role),
    subscriptionStatus: 'free',
    subscriptionTier: role,
    isSubscribed: false,
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
    dataHealth: {
      profileSource: healthOverrides?.profileSource ?? 'fallback',
      userDocState: healthOverrides?.userDocState ?? 'missing',
      subscriptionDocState: healthOverrides?.subscriptionDocState ?? 'missing',
      missingFields: healthOverrides?.missingFields ?? ['users/{uid}'],
      notes: healthOverrides?.notes ?? ['Account is using auth-only fallback data.'],
    },
  };
}

export async function fetchAccountProfile(user: AuthUser): Promise<AccountProfile> {
  const db = getFirebaseDb();
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const subscriptionResult = await fetchCurrentSubscriptionDoc(user.uid);
    const subscriptionStatus = normalizeSubscriptionStatus(subscriptionResult.data.status);
    const subscriptionTier = resolveSubscriptionTier(
      subscriptionResult.data.tier,
      null,
      null,
      null
    );
    const fallbackRole = isEntitledSubscriptionStatus(subscriptionStatus)
      ? subscriptionTier
      : 'shoouts';
    const fallbackProfile = buildFallbackAccountProfile(user, {
      subscriptionDocState: normalizeDocumentState(
        subscriptionResult.exists,
        subscriptionResult.exists ? [] : ['subscription/current']
      ),
      notes: [
        'users/{uid} is missing. Using auth session defaults until the profile document is created.',
        ...(subscriptionResult.note ? [subscriptionResult.note] : []),
      ],
      missingFields: ['users/{uid}'],
    });

    return {
      ...fallbackProfile,
      role: fallbackRole,
      activeExperience: getDefaultExperience(fallbackRole),
      subscriptionStatus,
      subscriptionTier,
      isSubscribed: isEntitledSubscriptionStatus(subscriptionStatus),
      onboarding: {
        ...fallbackProfile.onboarding,
        selectedRole: fallbackRole === 'shoouts' ? null : fallbackRole,
      },
    };
  }

  const raw = snapshot.data();
  const subscriptionResult = await fetchCurrentSubscriptionDoc(user.uid);
  const onboarding = asRecord(raw.onboarding);
  const seller = asRecord(raw.seller);
  const usage = asRecord(raw.usage);
  const embeddedSubscription = asRecord(raw.subscription);
  const subscription = {
    ...embeddedSubscription,
    ...subscriptionResult.data,
  };
  const selectedRole = normalizeOptionalRole(
    onboarding.selectedRole ?? raw.selectedRole ?? raw.role
  );
  const subscriptionStatus = normalizeSubscriptionStatus(
    subscription.status ?? raw.subscriptionStatus
  );
  const subscriptionTier = resolveSubscriptionTier(
    subscription.tier,
    raw.subscriptionTier,
    raw.plan,
    selectedRole
  );
  const declaredRole = normalizeOptionalRole(raw.role);
  const role = resolveEffectiveRole({
    declaredRole,
    selectedRole,
    subscriptionTier,
    subscriptionStatus,
  });
  const requestedExperience = normalizeExperience(
    raw.activeExperience ?? raw.lastExperience ?? raw.workspace,
    getDefaultExperience(role)
  );
  const activeExperience = canAccessExperience(role, requestedExperience)
    ? requestedExperience
    : getDefaultExperience(role);
  const missingFields = collectMissingAccountFields({
    raw,
    onboarding,
    seller,
    usage,
    declaredRole,
    selectedRole,
    activeExperience,
    subscriptionStatus,
    subscriptionTier,
  });
  const notes: string[] = [];

  if (!declaredRole && selectedRole) {
    notes.push('Account role was inferred from onboarding selection.');
  }

  if (
    declaredRole &&
    getRoleConfig(declaredRole).isPaid &&
    isRestrictedSubscriptionStatus(subscriptionStatus)
  ) {
    notes.push(
      `Paid role "${declaredRole}" is paired with "${subscriptionStatus}" subscription status.`
    );
  }

  if (!subscriptionResult.exists) {
    notes.push(
      'users/{uid}/subscription/current is missing, so subscription precedence falls back to embedded account fields.'
    );
  } else if (subscriptionResult.note) {
    notes.push(subscriptionResult.note);
  }

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
    subscriptionStatus,
    subscriptionTier,
    isSubscribed:
      asBoolean(subscription.isSubscribed) ??
      (subscriptionStatus === 'active' || subscriptionStatus === 'trial'),
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
    dataHealth: {
      profileSource: 'firestore',
      userDocState: normalizeDocumentState(true, missingFields),
      subscriptionDocState: normalizeDocumentState(
        subscriptionResult.exists,
        subscriptionResult.exists ? [] : ['subscription/current']
      ),
      missingFields,
      notes,
    },
  };
}

export async function updateAccountRoleSelection(
  uid: string,
  role: UserRole
): Promise<void> {
  const db = getFirebaseDb();
  const activeExperience = getDefaultExperience(role);

  await setDoc(
    doc(db, USERS_COLLECTION, uid),
    {
      role,
      activeExperience,
      onboarding: {
        hasSeenOnboarding: true,
        needsRoleSelection: false,
        selectedRole: role,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateAccountActiveExperience(
  uid: string,
  activeExperience: AppExperience
): Promise<void> {
  const db = getFirebaseDb();

  await setDoc(
    doc(db, USERS_COLLECTION, uid),
    {
      activeExperience,
      lastExperience: activeExperience,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

async function fetchCurrentSubscriptionDoc(uid: string): Promise<SubscriptionDocumentResult> {
  try {
    const db = getFirebaseDb();
    const snapshot = await getDoc(
      doc(
        db,
        USERS_COLLECTION,
        uid,
        SUBSCRIPTION_COLLECTION,
        CURRENT_SUBSCRIPTION_DOCUMENT
      )
    );

    return {
      exists: snapshot.exists(),
      data: snapshot.exists() ? snapshot.data() : {},
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown subscription read error';
    console.warn(`[account] users/${uid}/subscription/current unavailable: ${message}`);
    return {
      exists: false,
      data: {},
      note: 'Subscription document could not be read. Falling back to user profile subscription fields.',
    };
  }
}

function resolveSubscriptionTier(
  subscriptionTier: unknown,
  rawSubscriptionTier: unknown,
  rawPlan: unknown,
  selectedRole: UserRole | null
): UserRole {
  const tier =
    asString(subscriptionTier) ??
    asString(rawSubscriptionTier) ??
    asString(rawPlan) ??
    (selectedRole ? String(selectedRole) : null) ??
    'shoouts';

  return normalizeRole(tier);
}

function resolveEffectiveRole({
  declaredRole,
  selectedRole,
  subscriptionTier,
  subscriptionStatus,
}: {
  declaredRole: UserRole | null;
  selectedRole: UserRole | null;
  subscriptionTier: UserRole;
  subscriptionStatus: SubscriptionStatus;
}): UserRole {
  if (declaredRole) {
    if (!getRoleConfig(declaredRole).isPaid) {
      return declaredRole;
    }

    if (!isRestrictedSubscriptionStatus(subscriptionStatus)) {
      return declaredRole;
    }
  }

  if (isEntitledSubscriptionStatus(subscriptionStatus)) {
    return subscriptionTier;
  }

  if (selectedRole) {
    return getRoleConfig(selectedRole).isPaid ? 'shoouts' : selectedRole;
  }

  return 'shoouts';
}

function collectMissingAccountFields({
  raw,
  onboarding,
  seller,
  usage,
  declaredRole,
  selectedRole,
  activeExperience,
  subscriptionStatus,
  subscriptionTier,
}: {
  raw: Record<string, unknown>;
  onboarding: Record<string, unknown>;
  seller: Record<string, unknown>;
  usage: Record<string, unknown>;
  declaredRole: UserRole | null;
  selectedRole: UserRole | null;
  activeExperience: AppExperience;
  subscriptionStatus: SubscriptionStatus;
  subscriptionTier: UserRole;
}) {
  const missingFields: string[] = [];

  if (!declaredRole) {
    missingFields.push('role');
  }

  if (!selectedRole) {
    missingFields.push('onboarding.selectedRole');
  }

  if (!hasValue(raw.activeExperience) && !hasValue(raw.lastExperience) && !hasValue(raw.workspace)) {
    missingFields.push('activeExperience');
  } else if (activeExperience === getDefaultExperience(declaredRole ?? selectedRole ?? 'shoouts')) {
    const requestedExperience = normalizeOptionalExperience(
      raw.activeExperience ?? raw.lastExperience ?? raw.workspace
    );
    if (requestedExperience && requestedExperience !== activeExperience) {
      missingFields.push('activeExperience.adjusted');
    }
  }

  if (!hasValue(raw.subscriptionStatus) && !hasValue(asRecord(raw.subscription).status)) {
    missingFields.push('subscriptionStatus');
  } else if (
    getRoleConfig(subscriptionTier).isPaid &&
    isRestrictedSubscriptionStatus(subscriptionStatus)
  ) {
    missingFields.push(`subscriptionStatus:${subscriptionStatus}`);
  }

  if (
    !hasValue(seller.verificationStatus) &&
    !hasValue(raw.verificationStatus)
  ) {
    missingFields.push('seller.verificationStatus');
  }

  if (
    !hasValue(usage.vaultStorageUsedBytes) &&
    !hasValue(raw.vaultStorageUsedBytes)
  ) {
    missingFields.push('usage.vaultStorageUsedBytes');
  }

  if (!hasValue(usage.vaultUploadCount) && !hasValue(raw.vaultUploadCount)) {
    missingFields.push('usage.vaultUploadCount');
  }

  return missingFields;
}

function normalizeDocumentState(
  exists: boolean,
  missingFields: string[]
): AccountDocumentState {
  if (!exists) {
    return 'missing';
  }

  return missingFields.length > 0 ? 'partial' : 'ready';
}

function isEntitledSubscriptionStatus(status: SubscriptionStatus) {
  return status === 'active' || status === 'trial';
}

function isRestrictedSubscriptionStatus(status: SubscriptionStatus) {
  return status === 'cancelled' || status === 'expired' || status === 'past_due';
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

function normalizeOptionalExperience(value: unknown): AppExperience | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const normalized = String(value)
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

  return null;
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

function hasValue(value: unknown) {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return true;
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
