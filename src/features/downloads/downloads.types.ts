import {
  formatCommercePrice,
  getCommerceStateCopy,
  type CommerceAccessType,
  type CommerceAvailabilityStatus,
  type CommerceDeliveryStatus,
  type CommerceEntitlementStatus,
  type CommercePaymentStatus,
  type CommerceSurface,
} from '@/src/features/commerce/transaction.types';

export type LibraryPurchase = {
  id: string;
  listingId: string;
  title: string;
  artist: string;
  price: number;
  currency: string;
  purchasedAt: string | null;
  coverUrl?: string | null;
  deliveryUrl?: string | null;
  accessType: CommerceAccessType;
  availabilityStatus: CommerceAvailabilityStatus;
  paymentStatus: CommercePaymentStatus;
  entitlementStatus: CommerceEntitlementStatus;
  deliveryStatus: CommerceDeliveryStatus;
};

export function formatLibraryPrice(purchase: Pick<LibraryPurchase, 'price' | 'currency'>) {
  return formatCommercePrice(purchase);
}

export function getLibraryPurchaseStateCopy(
  purchase: Pick<
    LibraryPurchase,
    | 'accessType'
    | 'availabilityStatus'
    | 'paymentStatus'
    | 'entitlementStatus'
    | 'deliveryStatus'
  >,
  surface: CommerceSurface = 'library'
) {
  return getCommerceStateCopy(purchase, surface);
}
