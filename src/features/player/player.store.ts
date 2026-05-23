import { create } from 'zustand';
import type {
  PlayerLoadOptions,
  PlayerRepeatMode,
  PlayerSnapshot,
  PlayerTrack,
} from './player.types';

type PlayerControlCommand =
  | { id: number; type: 'seek_to_start' }
  | { id: number; type: 'seek_by'; seconds: number }
  | { id: number; type: 'seek_to_fraction'; fraction: number };

type PlayerState = {
  track: PlayerTrack | null;
  visible: boolean;
  requestedPlaying: boolean;
  fullPlayerOpen: boolean;
  snapshot: PlayerSnapshot;
  queue: PlayerTrack[];
  queueIndex: number;
  history: PlayerTrack[];
  repeatMode: PlayerRepeatMode;
  controlCommand: PlayerControlCommand | null;
  commandCounter: number;
  isSuppressed: boolean;
  preSuppressionPlaying: boolean;
  loadTrack: (track: PlayerTrack, options?: PlayerLoadOptions) => void;
  togglePlayback: () => void;
  requestPlay: () => void;
  requestPause: () => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  setSnapshot: (snapshot: Partial<PlayerSnapshot>) => void;
  clearError: () => void;
  toggleRepeatMode: () => void;
  requestSeekToStart: () => void;
  requestSeekBy: (seconds: number) => void;
  requestSeekToFraction: (fraction: number) => void;
  clearControlCommand: (id: number) => void;
  playNextTrack: (randomPool?: PlayerTrack[]) => void;
  playPreviousTrack: () => void;
  suppress: () => void;
  unsuppress: () => void;
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

const MAX_HISTORY = 30;

function isPlayableTrack(track: PlayerTrack | null | undefined): track is PlayerTrack {
  return Boolean(track?.audioUrl);
}

function dedupeQueue(tracks: PlayerTrack[]) {
  const map = new Map<string, PlayerTrack>();
  tracks.forEach((track) => {
    map.set(`${track.id}:${track.audioUrl ?? ''}`, track);
  });
  return Array.from(map.values());
}

function resolveQueue(optionsQueue: PlayerTrack[] | undefined, track: PlayerTrack) {
  const baseQueue = optionsQueue && optionsQueue.length > 0 ? optionsQueue : [track];
  const deduped = dedupeQueue(baseQueue);
  return deduped.length > 0 ? deduped : [track];
}

function resolveQueueIndex(queue: PlayerTrack[], track: PlayerTrack, startIndex?: number) {
  if (
    typeof startIndex === 'number' &&
    Number.isInteger(startIndex) &&
    startIndex >= 0 &&
    startIndex < queue.length
  ) {
    return startIndex;
  }

  const located = queue.findIndex((item) => item.id === track.id);
  return located >= 0 ? located : 0;
}

function findNextPlayableIndex(queue: PlayerTrack[], currentIndex: number, direction: 1 | -1) {
  if (queue.length <= 1) {
    return currentIndex;
  }

  for (let step = 1; step <= queue.length; step += 1) {
    const next = (currentIndex + direction * step + queue.length) % queue.length;
    if (isPlayableTrack(queue[next])) {
      return next;
    }
  }

  return currentIndex;
}

function pushHistory(history: PlayerTrack[], track: PlayerTrack | null) {
  if (!track) {
    return history;
  }

  return [track, ...history].slice(0, MAX_HISTORY);
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  visible: false,
  requestedPlaying: false,
  fullPlayerOpen: false,
  snapshot: defaultSnapshot,
  queue: [],
  queueIndex: 0,
  history: [],
  repeatMode: 'off',
  controlCommand: null,
  commandCounter: 0,
  isSuppressed: false,
  preSuppressionPlaying: false,

  loadTrack: (track, options) =>
    set((state) => {
      const queue = resolveQueue(options?.queue, track);
      const queueIndex = resolveQueueIndex(queue, track, options?.startIndex);
      const nextTrack = queue[queueIndex] ?? track;
      const sameTrack =
        state.track?.id === nextTrack.id && state.track?.audioUrl === nextTrack.audioUrl;

      return {
        track: nextTrack,
        queue,
        queueIndex,
        history: [],
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

  toggleRepeatMode: () =>
    set((state) => ({
      repeatMode: state.repeatMode === 'off' ? 'one' : 'off',
    })),

  requestSeekToStart: () =>
    set((state) => ({
      commandCounter: state.commandCounter + 1,
      controlCommand: {
        id: state.commandCounter + 1,
        type: 'seek_to_start',
      },
    })),

  requestSeekBy: (seconds) =>
    set((state) => ({
      commandCounter: state.commandCounter + 1,
      controlCommand: {
        id: state.commandCounter + 1,
        type: 'seek_by',
        seconds,
      },
    })),

  requestSeekToFraction: (fraction) =>
    set((state) => ({
      commandCounter: state.commandCounter + 1,
      controlCommand: {
        id: state.commandCounter + 1,
        type: 'seek_to_fraction',
        fraction: Math.min(Math.max(fraction, 0), 1),
      },
    })),

  clearControlCommand: (id) =>
    set((state) => {
      if (!state.controlCommand || state.controlCommand.id !== id) {
        return state;
      }

      return { controlCommand: null };
    }),

  playNextTrack: (randomPool) =>
    set((state) => {
      const currentTrack = state.track;
      if (!currentTrack) {
        return state;
      }

      if (state.queue.length > 1) {
        const nextIndex = findNextPlayableIndex(state.queue, state.queueIndex, 1);
        if (nextIndex === state.queueIndex) {
          return state;
        }

        return {
          track: state.queue[nextIndex],
          queueIndex: nextIndex,
          history: pushHistory(state.history, currentTrack),
          visible: true,
          requestedPlaying: true,
          snapshot: defaultSnapshot,
        };
      }

      const pool = dedupeQueue((randomPool ?? []).filter(isPlayableTrack));
      const candidates = pool.filter((item) => item.id !== currentTrack.id);
      if (candidates.length === 0) {
        return state;
      }

      const selected = candidates[Math.floor(Math.random() * candidates.length)];
      return {
        track: selected,
        queue: [selected],
        queueIndex: 0,
        history: pushHistory(state.history, currentTrack),
        visible: true,
        requestedPlaying: true,
        snapshot: defaultSnapshot,
      };
    }),

  playPreviousTrack: () =>
    set((state) => {
      if (state.queue.length > 1) {
        const previousIndex = findNextPlayableIndex(state.queue, state.queueIndex, -1);
        if (previousIndex !== state.queueIndex) {
          return {
            track: state.queue[previousIndex],
            queueIndex: previousIndex,
            visible: true,
            requestedPlaying: true,
            snapshot: defaultSnapshot,
          };
        }
      }

      if (state.history.length === 0) {
        return state;
      }

      const [previousTrack, ...remainingHistory] = state.history;
      return {
        track: previousTrack,
        queue: [previousTrack],
        queueIndex: 0,
        history: remainingHistory,
        visible: true,
        requestedPlaying: true,
        snapshot: defaultSnapshot,
      };
    }),

  suppress: () =>
    set((state) => ({
      isSuppressed: true,
      preSuppressionPlaying: state.requestedPlaying,
      requestedPlaying: false,
      visible: false,
      fullPlayerOpen: false,
    })),

  unsuppress: () =>
    set((state) => {
      if (!state.track || !state.isSuppressed) return state;
      return {
        isSuppressed: false,
        visible: true,
        requestedPlaying: state.preSuppressionPlaying,
      };
    }),

  stop: () =>
    set({
      track: null,
      queue: [],
      queueIndex: 0,
      history: [],
      requestedPlaying: false,
      visible: false,
      fullPlayerOpen: false,
      snapshot: defaultSnapshot,
      controlCommand: null,
      isSuppressed: false,
      preSuppressionPlaying: false,
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
