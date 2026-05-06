import { useQuery } from '@tanstack/react-query';
import {
  fetchMarketplaceListingById,
  fetchMarketplaceListings,
  fetchSellerListings,
  fetchSellerProfile,
} from './marketplace.api';
import type {
  ExploreFeedFilters,
  ExploreFeedItemModel,
  ExploreFeedTab,
  MarketplaceListing,
} from './marketplace.types';

export function useMarketplaceListings(limitCount = 24) {
  return useQuery({
    queryKey: ['marketplace-listings', limitCount],
    queryFn: () => fetchMarketplaceListings(limitCount),
  });
}

export function useMarketplaceListingDetail(listingId: string | null) {
  return useQuery({
    queryKey: ['marketplace-listing-detail', listingId],
    enabled: Boolean(listingId),
    queryFn: () => fetchMarketplaceListingById(listingId!),
  });
}

export function useSellerProfile(sellerId: string | null) {
  return useQuery({
    queryKey: ['seller-profile', sellerId],
    enabled: Boolean(sellerId),
    queryFn: () => fetchSellerProfile(sellerId!),
  });
}

export function useSellerListings(sellerId: string | null, limitCount = 12) {
  return useQuery({
    queryKey: ['seller-listings', sellerId, limitCount],
    enabled: Boolean(sellerId),
    queryFn: () => fetchSellerListings(sellerId!, limitCount),
  });
}

export function useExploreFeed(
  tab: ExploreFeedTab,
  limitCount = 24,
  filters?: ExploreFeedFilters
) {
  const listingsQuery = useMarketplaceListings(limitCount);

  const data: ExploreFeedItemModel[] =
    tab === 'forYou'
      ? applyExploreFilters(
          (listingsQuery.data ?? []).map(mapListingToExploreItem),
          filters
        )
      : [];

  return {
    ...listingsQuery,
    data,
    hasFollowingSupport: false,
  };
}

function mapListingToExploreItem(listing: MarketplaceListing): ExploreFeedItemModel {
  return {
    id: listing.id,
    listingId: listing.id,
    sellerId: listing.sellerId,
    title: listing.title,
    artist: listing.artist,
    price: listing.price,
    currency: listing.currency,
    coverUrl: listing.coverUrl,
    likesLabel: listing.listenCount > 0 ? `${listing.listenCount.toLocaleString()} plays` : null,
    genre: listing.genre,
    bpm: listing.bpm,
    key: listing.key,
    tags: listing.tags,
    artworkLabel: listing.genre ?? listing.title.split(' ')[0] ?? 'Beat',
  };
}

function applyExploreFilters(
  items: ExploreFeedItemModel[],
  filters?: ExploreFeedFilters
) {
  if (!filters) {
    return items;
  }

  const normalizedQuery = filters.query.trim().toLowerCase();
  const normalizedGenre = filters.genre?.trim().toLowerCase() ?? null;

  return items.filter((item) => {
    if (filters.price === 'free' && item.price > 0) {
      return false;
    }

    if (filters.price === 'paid' && item.price <= 0) {
      return false;
    }

    if (normalizedGenre) {
      const itemGenre = item.genre?.trim().toLowerCase() ?? '';
      if (itemGenre !== normalizedGenre) {
        return false;
      }
    }

    if (normalizedQuery.length > 0) {
      const haystack = [
        item.title,
        item.artist,
        item.genre ?? '',
        item.key ?? '',
        ...item.tags,
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });
}
