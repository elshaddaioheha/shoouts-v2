import type { SellerVerificationStatus } from '@/src/features/account/account.types';
import type { UserRole } from '@/src/features/access/access.types';

export type MarketplaceListing = {
  id: string;
  sourcePath?: string;
  sellerId: string;
  title: string;
  artist: string;
  uploaderName?: string | null;
  price: number;
  currency: string;
  audioUrl?: string | null;
  artworkUrl?: string | null;
  coverUrl?: string | null;
  genre?: string | null;
  assetType?: string | null;
  category?: string | null;
  bpm?: number | null;
  key?: string | null;
  description?: string | null;
  listenCount: number;
  lifecycleStatus?: string | null;
  isPublic: boolean;
  isFree: boolean;
  tags: string[];
  isPublished: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  publishedAtMs: number;
  createdAtMs: number;
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

export type ExploreFeedTab = 'following' | 'forYou';

export type ExplorePriceFilter = 'all' | 'free' | 'paid';

export type ExploreFeedFilters = {
  query: string;
  genre: string | null;
  price: ExplorePriceFilter;
};

export type ExploreFeedItemModel = {
  id: string;
  listingId: string;
  sellerId: string;
  title: string;
  artist: string;
  price: number;
  currency: string;
  coverUrl?: string | null;
  likesLabel?: string | null;
  genre?: string | null;
  bpm?: number | null;
  key?: string | null;
  tags: string[];
  artworkLabel?: string | null;
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

export function formatExplorePrice(
  item: Pick<ExploreFeedItemModel, 'price' | 'currency'>
) {
  return formatMarketplacePrice(item);
}
