import { useQuery } from '@tanstack/react-query';
import {
  fetchMarketplaceListingById,
  fetchMarketplaceListings,
  fetchSellerListings,
  fetchSellerProfile,
} from './marketplace.api';
import type {
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

export function useExploreFeed(tab: ExploreFeedTab, limitCount = 24) {
  const listingsQuery = useMarketplaceListings(limitCount);

  const data: ExploreFeedItemModel[] =
    tab === 'forYou'
      ? (listingsQuery.data ?? []).map(mapListingToExploreItem)
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
    artworkLabel: listing.genre ?? listing.title.split(' ')[0] ?? 'Beat',
  };
}
