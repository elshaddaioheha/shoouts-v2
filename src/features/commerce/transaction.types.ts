export type CommerceAccessType = 'free' | 'paid';
export type CommerceCheckoutState = 'review_only';
export type CommerceAvailabilityStatus = 'available' | 'processing' | 'restricted';
export type CommercePaymentStatus =
  | 'not_started'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';
export type CommerceEntitlementStatus =
  | 'not_granted'
  | 'pending'
  | 'granted'
  | 'restricted';
export type CommerceDeliveryStatus = 'not_ready' | 'ready' | 'restricted';

export type CommerceStateModel = {
  accessType: CommerceAccessType;
  availabilityStatus: CommerceAvailabilityStatus;
  paymentStatus: CommercePaymentStatus;
  entitlementStatus: CommerceEntitlementStatus;
  deliveryStatus: CommerceDeliveryStatus;
};

export type CommerceSurface = 'cart' | 'library' | 'history';

export function formatCommercePrice(input: { price: number; currency: string }) {
  if (input.price <= 0) {
    return 'Free';
  }

  if (input.currency.toUpperCase() === 'NGN') {
    return `NGN ${input.price.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `$${input.price.toFixed(2)}`;
}

export function deriveCommerceAvailabilityStatus(
  input: Pick<
    CommerceStateModel,
    'accessType' | 'paymentStatus' | 'entitlementStatus' | 'deliveryStatus'
  >
): CommerceAvailabilityStatus {
  if (
    input.paymentStatus === 'failed' ||
    input.paymentStatus === 'refunded' ||
    input.entitlementStatus === 'restricted' ||
    input.deliveryStatus === 'restricted'
  ) {
    return 'restricted';
  }

  if (input.entitlementStatus === 'granted' && input.deliveryStatus === 'ready') {
    return 'available';
  }

  if (input.accessType === 'free' && input.entitlementStatus === 'granted') {
    return input.deliveryStatus === 'ready' ? 'available' : 'processing';
  }

  if (input.paymentStatus === 'paid' || input.paymentStatus === 'pending') {
    return 'processing';
  }

  return 'processing';
}

export function getCommerceStateCopy(
  input: CommerceStateModel,
  surface: CommerceSurface
) {
  if (surface === 'cart') {
    return {
      badge: input.accessType === 'free' ? 'Free review' : 'Purchase review',
      detail:
        input.accessType === 'free'
          ? 'This item is staged locally until secure entitlement and delivery checks go live.'
          : 'This item is staged locally until secure checkout, entitlement, and delivery checks go live.',
    };
  }

  if (input.availabilityStatus === 'restricted') {
    return {
      badge: 'Restricted',
      detail:
        surface === 'history'
          ? 'The transaction is recorded, but access is currently restricted.'
          : 'This item is recorded in your account, but access is currently restricted.',
    };
  }

  if (input.entitlementStatus === 'granted' && input.deliveryStatus === 'ready') {
    return {
      badge: 'Ready',
      detail:
        input.accessType === 'free'
          ? 'Free-access delivery is available for this item.'
          : 'Purchased delivery is available for this item.',
    };
  }

  if (input.paymentStatus === 'pending' || input.entitlementStatus === 'pending') {
    return {
      badge: 'Pending',
      detail:
        surface === 'history'
          ? 'The transaction is recorded and still being finalized.'
          : 'Access is recorded and still being finalized before delivery is enabled.',
    };
  }

  if (input.entitlementStatus === 'granted') {
    return {
      badge: 'Access recorded',
      detail:
        surface === 'history'
          ? 'Your transaction is complete, but protected delivery is not active yet.'
          : 'Your access is recorded, but protected delivery is not active yet.',
    };
  }

  return {
    badge: 'Recorded',
    detail:
      surface === 'history'
        ? 'The transaction is visible here, but delivery is not active yet.'
        : 'This item is visible here, but protected delivery is not active yet.',
  };
}
