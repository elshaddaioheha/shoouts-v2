import { create } from 'zustand';
import type { PlayerSnapshot, PlayerTrack } from './player.types';

type PlayerState = {
  track: PlayerTrack | null;
  visible: boolean;
  requestedPlaying: boolean;
  fullPlayerOpen: boolean;
  snapshot: PlayerSnapshot;
  loadTrack: (track: PlayerTrack, options?: { autoPlay?: boolean }) => void;
  togglePlayback: () => void;
  requestPlay: () => void;
  requestPause: () => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  setSnapshot: (snapshot: Partial<PlayerSnapshot>) => void;
  clearError: () => void;
  stop: () => void;
};

const defaultSnapshot: PlayerSnapshot = {
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  isLoaded: false,
  isBuffering: false,
  errorMessage: null,
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  visible: false,
  requestedPlaying: false,
  fullPlayerOpen: false,
  snapshot: defaultSnapshot,

  loadTrack: (track, options) =>
    set((state) => {
      const sameTrack = state.track?.id === track.id && state.track?.audioUrl === track.audioUrl;
      return {
        track,
        visible: true,
        requestedPlaying: options?.autoPlay ?? true,
        snapshot: sameTrack ? state.snapshot : defaultSnapshot,
      };
    }),

  togglePlayback: () =>
    set((state) => ({
      requestedPlaying: !state.requestedPlaying,
    })),

  requestPlay: () => set({ requestedPlaying: true }),

  requestPause: () => set({ requestedPlaying: false }),

  openFullPlayer: () => set({ fullPlayerOpen: true }),

  closeFullPlayer: () => set({ fullPlayerOpen: false }),

  setSnapshot: (snapshot) =>
    set((state) => ({
      snapshot: {
        ...state.snapshot,
        ...snapshot,
      },
    })),

  clearError: () =>
    set((state) => ({
      snapshot: {
        ...state.snapshot,
        errorMessage: null,
      },
    })),

  stop: () =>
    set({
      requestedPlaying: false,
      visible: false,
      fullPlayerOpen: false,
      snapshot: defaultSnapshot,
    }),
}));

export function getPlayerProgress(snapshot: PlayerSnapshot) {
  if (snapshot.duration <= 0) {
    return 0;
  }

  return Math.min(Math.max(snapshot.currentTime / snapshot.duration, 0), 1);
}

export function formatPlayerTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return '0:00';
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
