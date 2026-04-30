import type { SellerVerificationStatus } from '@/src/features/account/account.types';
import type { UserRole } from '@/src/features/access/access.types';

export type MarketplaceListing = {
  id: string;
  sellerId: string;
  title: string;
  artist: string;
  price: number;
  currency: string;
  coverUrl?: string | null;
  genre?: string | null;
  bpm?: number | null;
  key?: string | null;
  description?: string | null;
  isFree: boolean;
  tags: string[];
  isPublished: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type SellerProfile = {
  id: string;
  displayName: string;
  photoURL?: string | null;
  bio?: string | null;
  role: UserRole;
  verificationStatus: SellerVerificationStatus;
  payoutsEnabled: boolean;
};

export function formatMarketplacePrice(
  listing: Pick<MarketplaceListing, 'price' | 'currency'>
) {
  if (listing.price <= 0) {
    return 'Free';
  }

  if (listing.currency.toUpperCase() === 'NGN') {
    return `NGN ${listing.price.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `$${listing.price.toFixed(2)}`;
}
