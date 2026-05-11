import {
  formatCommercePrice,
  getCommerceStateCopy,
  type CommerceAccessType,
  type CommerceCheckoutState,
} from '@/src/features/commerce/transaction.types';

export type CartItem = {
  id: string;
  listingId: string;
  title: string;
  artist: string;
  price: number;
  currency: string;
  accessType: CommerceAccessType;
  checkoutState: CommerceCheckoutState;
  coverUrl?: string;
};

export function formatCartPrice(item: Pick<CartItem, 'price' | 'currency'>) {
  return formatCommercePrice(item);
}

export function formatCartTotal(items: Pick<CartItem, 'price' | 'currency'>[]) {
  if (items.length === 0) {
    return 'No items';
  }

  const normalizedCurrencies = getCartCurrencies(items);

  if (normalizedCurrencies.length !== 1) {
    return `${items.length} items - mixed currencies`;
  }

  const total = items.reduce((sum, item) => sum + item.price, 0);
  return formatCommercePrice({
    price: total,
    currency: normalizedCurrencies[0],
  });
}

export function hasMixedCartCurrencies(items: Pick<CartItem, 'currency'>[]) {
  return getCartCurrencies(items).length > 1;
}

export function getCartItemStateCopy(item: Pick<CartItem, 'accessType' | 'checkoutState'>) {
  return getCommerceStateCopy(
    {
      accessType: item.accessType,
      availabilityStatus: 'processing',
      paymentStatus: item.accessType === 'free' ? 'paid' : 'not_started',
      entitlementStatus: 'not_granted',
      deliveryStatus: 'not_ready',
    },
    'cart'
  );
}

function getCartCurrencies(items: Pick<CartItem, 'currency'>[]) {
  return Array.from(
    new Set(items.map((item) => item.currency.trim().toUpperCase()).filter(Boolean))
  );
}
