export type PlayerSurface = 'marketplace' | 'vault';
export type PlayerRepeatMode = 'off' | 'one';

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

export type PlayerLoadOptions = {
  autoPlay?: boolean;
  queue?: PlayerTrack[];
  startIndex?: number;
};

export type PlayerSnapshot = {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isLoaded: boolean;
  isBuffering: boolean;
  errorMessage: string | null;
};
