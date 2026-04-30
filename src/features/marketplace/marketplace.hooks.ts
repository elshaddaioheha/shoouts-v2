import { useQuery } from '@tanstack/react-query';
import {
  fetchMarketplaceListingById,
  fetchMarketplaceListings,
  fetchSellerListings,
  fetchSellerProfile,
} from './marketplace.api';

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
