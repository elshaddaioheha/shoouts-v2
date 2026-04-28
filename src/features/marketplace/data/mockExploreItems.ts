export type ExploreFeedTab = 'following' | 'forYou';

export type MockExploreItem = {
  id: string;
  listingId: string;
  sellerId: string;
  title: string;
  artist: string;
  price: number;
  currency: 'NGN' | 'USD';
  likes: string;
  genre?: string;
  bpm?: number;
  key?: string;
  artworkLabel?: string;
  tab: ExploreFeedTab;
};

export const mockExploreItems: MockExploreItem[] = [
  {
    id: 'explore-1',
    listingId: 'demo-paid-1',
    sellerId: 'seller-1',
    title: 'Shout By You',
    artist: 'Wizkid ft Him',
    price: 300000,
    currency: 'NGN',
    likes: '328.7K',
    genre: 'Afrobeats',
    bpm: 104,
    key: 'A minor',
    artworkLabel: 'Dominion',
    tab: 'forYou',
  },
  {
    id: 'explore-2',
    listingId: 'demo-free-1',
    sellerId: 'seller-2',
    title: 'Free Demo Beat',
    artist: 'Shoout Producer',
    price: 0,
    currency: 'NGN',
    likes: '18.2K',
    genre: 'Afro Fusion',
    bpm: 96,
    key: 'C major',
    artworkLabel: 'Free',
    tab: 'following',
  },
  {
    id: 'explore-3',
    listingId: 'demo-paid-2',
    sellerId: 'seller-3',
    title: 'Hybrid Creator Pack',
    artist: 'Hybrid Producer',
    price: 450000,
    currency: 'NGN',
    likes: '64.9K',
    genre: 'R&B',
    bpm: 92,
    key: 'F minor',
    artworkLabel: 'Hybrid',
    tab: 'forYou',
  },
];

export function getExploreItemsByTab(tab: ExploreFeedTab) {
  return mockExploreItems.filter((item) => item.tab === tab);
}

export function formatExplorePrice(item: MockExploreItem) {
  if (item.price <= 0) return 'Free';

  if (item.currency === 'NGN') {
    return `NGN ${item.price.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `$${item.price.toFixed(2)}`;
}
