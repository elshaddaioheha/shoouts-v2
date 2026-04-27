export type UserRole =
  | 'shoouts'
  | 'vault'
  | 'vault_pro'
  | 'studio'
  | 'hybrid';

export type AppExperience =
  | 'shoouts'
  | 'vault'
  | 'studio'
  | 'hybrid';

export type SubscriptionStatus =
  | 'free'
  | 'trial'
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'expired';

export type FeaturePermission =
  | 'marketplace.view'
  | 'marketplace.stream'
  | 'marketplace.cart'
  | 'marketplace.buy'
  | 'marketplace.download'

  | 'vault.preview'
  | 'vault.view'
  | 'vault.upload'
  | 'vault.record'
  | 'vault.folders'
  | 'vault.privatePlayback'
  | 'vault.sharePreviewLinks'
  | 'vault.upgradeStorage'

  | 'studio.preview'
  | 'studio.view'
  | 'studio.upload'
  | 'studio.publish'
  | 'studio.promote'
  | 'studio.analyticsBasic'
  | 'studio.payouts'
  | 'studio.kyc'

  | 'hybrid.view'
  | 'hybrid.publishFromVault'

  | 'chat.buyer'
  | 'chat.seller';

export type RoleLimits = {
  vaultStorageGb: number;
  vaultMaxUploads: number;
  vaultMaxFileSizeMb: number;
  studioMaxListings: number | 'unlimited';
};

export type RoleConfig = {
  id: UserRole;
  label: string;
  description: string;
  isPaid: boolean;
  defaultExperience: AppExperience;
  availableExperiences: AppExperience[];
  previewExperiences: AppExperience[];
  permissions: FeaturePermission[];
  limits: RoleLimits;
  upgradeTarget: UserRole | null;
};