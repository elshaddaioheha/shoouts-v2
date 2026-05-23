export type LibraryItemDeliveryStatus = 'local_only' | 'ready' | 'restricted';

export type LibraryItem = {
  id: string;
  listingId: string;
  title: string;
  artist: string;
  price: number;
  currency: string;
  accessType: 'free' | 'paid';
  coverUrl?: string;
  claimedAtMs: number;
  deliveryStatus: LibraryItemDeliveryStatus;
};
