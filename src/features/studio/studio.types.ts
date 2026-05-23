export type StudioListingLifecycle = 'draft' | 'published' | 'archived' | 'taken_down';

export type StudioListingLicenseType = 'lease' | 'exclusive' | 'non_exclusive';

export type StudioListing = {
  id: string;
  ownerId: string;
  title: string;
  audioUrl: string | null;
  coverUrl: string | null;
  priceInCents: number;
  genre: string | null;
  licenseType: StudioListingLicenseType | null;
  description: string | null;
  bpm: number | null;
  key: string | null;
  tags: string[];
  lifecycleStatus: StudioListingLifecycle;
  isPublic: boolean;
  listenCount: number;
  createdAtMs: number;
  updatedAtMs: number;
  publishedAtMs: number | null;
  takenDownAt: number | null;
  takenDownReason: string | null;
  vaultSourceId: string | null;
};

export type StreamDataPoint = {
  day: string;
  count: number;
};

export type StreamsTimeRange = '7d' | '30d' | 'all';
