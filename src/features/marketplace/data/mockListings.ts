export type MockMarketplaceListing = {
  id: string;
  title: string;
  artist: string;
  price: number;
  coverUrl?: string;
  genre?: string;
  bpm?: number;
  isFree?: boolean;
};

export const mockMarketplaceListings: MockMarketplaceListing[] = [
  {
    id: 'demo-free-1',
    title: 'Free Demo Beat',
    artist: 'Shoout Producer',
    price: 0,
    genre: 'Afrobeats',
    bpm: 104,
    isFree: true,
  },
  {
    id: 'demo-paid-1',
    title: 'Premium Studio Beat',
    artist: 'Studio Producer',
    price: 19.99,
    genre: 'Trap',
    bpm: 140,
    isFree: false,
  },
  {
    id: 'demo-paid-2',
    title: 'Hybrid Creator Pack',
    artist: 'Hybrid Producer',
    price: 29.99,
    genre: 'R&B',
    bpm: 92,
    isFree: false,
  },
];
