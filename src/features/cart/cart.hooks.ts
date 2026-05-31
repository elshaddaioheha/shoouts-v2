import { fetchMarketplaceListingById } from '@/src/features/marketplace/marketplace.api';
import { useEffect, useRef, useState } from 'react';
import type { CartItem } from './cart.types';

export type CartItemStatus = 'ok' | 'price_changed' | 'unavailable';

type ValidationResult = {
  statusMap: Record<string, CartItemStatus>;
  isValidating: boolean;
};

export function useCartValidation(items: CartItem[]): ValidationResult {
  const [statusMap, setStatusMap] = useState<Record<string, CartItemStatus>>({});
  const [isValidating, setIsValidating] = useState(false);
  // Track the item-id set we last validated to avoid redundant fetches.
  const lastValidatedKey = useRef<string>('');

  useEffect(() => {
    if (items.length === 0) {
      setStatusMap({});
      lastValidatedKey.current = '';
      return;
    }

    const key = items.map((i) => `${i.id}:${i.price}`).join(',');
    if (key === lastValidatedKey.current) return;
    lastValidatedKey.current = key;

    let cancelled = false;
    setIsValidating(true);

    Promise.all(
      items.map(async (item): Promise<[string, CartItemStatus]> => {
        try {
          const listing = await fetchMarketplaceListingById(item.listingId);
          if (!listing || !listing.isPublic) {
            return [item.id, 'unavailable'];
          }
          if (listing.price !== item.price) {
            return [item.id, 'price_changed'];
          }
          return [item.id, 'ok'];
        } catch {
          // Don't block the cart on a validation read error.
          return [item.id, 'ok'];
        }
      })
    ).then((results) => {
      if (cancelled) return;
      setStatusMap(Object.fromEntries(results));
      setIsValidating(false);
    });

    return () => {
      cancelled = true;
    };
  }, [items]);

  return { statusMap, isValidating };
}
