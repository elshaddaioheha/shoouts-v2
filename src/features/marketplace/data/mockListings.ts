export type MockMarketplaceListing = {
  id: string;
  sellerId: string;
  title: string;
  artist: string;
  price: number;
  coverUrl?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  description?: string;
  isFree?: boolean;
  tags?: string[];
};

export const mockMarketplaceListings: MockMarketplaceListing[] = [
  {
    id: 'demo-free-1',
    sellerId: 'seller-1',
    title: 'Free Demo Beat',
    artist: 'Shoout Producer',
    price: 0,
    genre: 'Afrobeats',
    bpm: 104,
    key: 'A minor',
    isFree: true,
    description:
      'A clean Afrobeats starter beat for testing the Shoouts marketplace flow.',
    tags: ['Afrobeats', 'Free', 'Demo'],
  },
  {
    id: 'demo-paid-1',
    sellerId: 'seller-2',
    title: 'Premium Studio Beat',
    artist: 'Studio Producer',
    price: 19.99,
    genre: 'Trap',
    bpm: 140,
    key: 'F minor',
    isFree: false,
    description:
      'A premium trap beat placeholder for validating cart, detail, and checkout UI.',
    tags: ['Trap', 'Premium', 'Studio'],
  },
  {
    id: 'demo-paid-2',
    sellerId: 'seller-3',
    title: 'Hybrid Creator Pack',
    artist: 'Hybrid Producer',
    price: 29.99,
    genre: 'R&B',
    bpm: 92,
    key: 'C major',
    isFree: false,
    description:
      'A smooth R&B-style placeholder listing for the future Hybrid publishing workflow.',
    tags: ['R&B', 'Hybrid', 'Smooth'],
  },
];

export function getMockListingById(id: string) {
  return mockMarketplaceListings.find((listing) => listing.id === id) ?? null;
}

