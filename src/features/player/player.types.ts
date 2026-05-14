export type PlayerSurface = 'marketplace' | 'vault';

export type PlayerTrack = {
  id: string;
  title: string;
  artist: string;
  sellerId?: string | null;
  projectTitle?: string | null;
  audioUrl: string | null;
  coverUrl?: string | null;
  artworkGradient?: readonly [string, string];
  surface: PlayerSurface;
};

export type PlayerSnapshot = {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isLoaded: boolean;
  isBuffering: boolean;
  errorMessage: string | null;
};
