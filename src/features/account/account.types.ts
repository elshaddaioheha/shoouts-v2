import type {
  AppExperience,
  SubscriptionStatus,
  UserRole,
} from '@/src/features/access/access.types';

export type SellerVerificationStatus =
  | 'not_started'
  | 'pending'
  | 'verified'
  | 'rejected';

export type AccountProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;

  role: UserRole;
  activeExperience: AppExperience;
  subscriptionStatus: SubscriptionStatus;

  onboarding: {
    hasSeenOnboarding: boolean;
    needsRoleSelection: boolean;
    selectedRole: UserRole | null;
    studioSetupCompletedAt: string | null;
  };

  seller: {
    verificationStatus: SellerVerificationStatus;
    payoutsEnabled: boolean;
  };

  usage: {
    vaultStorageUsedBytes: number;
    vaultUploadCount: number;
  };
};