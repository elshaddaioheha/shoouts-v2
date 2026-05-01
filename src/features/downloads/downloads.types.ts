export type LibraryPurchase = {
  id: string;
  listingId: string;
  title: string;
  artist: string;
  price: number;
  currency: string;
  purchasedAt: string | null;
  coverUrl?: string | null;
  accessType: 'free' | 'paid';
  status: 'available' | 'processing' | 'restricted';
};

export function formatLibraryPrice(purchase: Pick<LibraryPurchase, 'price' | 'currency'>) {
  if (purchase.price <= 0) {
    return 'Free';
  }

  if (purchase.currency.toUpperCase() === 'NGN') {
    return `NGN ${purchase.price.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `$${purchase.price.toFixed(2)}`;
}
