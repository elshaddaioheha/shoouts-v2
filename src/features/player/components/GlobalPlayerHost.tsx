import {
  deriveExperienceFromPathname,
  normalizeNavigationPath,
} from '@/src/features/navigation/navigation.helpers';
import { layout, useThemeTokens } from '@/src/theme';
import { MARKETPLACE_FEED_LIMIT, useMarketplaceListings } from '@/src/features/marketplace/marketplace.hooks';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { usePathname } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from '../player.store';
import { FullPlayerModal } from './FullPlayerModal';
import { MiniPlayerBar } from './MiniPlayerBar';

export function GlobalPlayerHost() {
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const normalizedPath = normalizeNavigationPath(pathname);
  const { width } = useWindowDimensions();
  const routeExperience = deriveExperienceFromPathname(pathname);
  const track = usePlayerStore((state) => state.track);
  const visible = usePlayerStore((state) => state.visible);
  const fullPlayerOpen = usePlayerStore((state) => state.fullPlayerOpen);
  const requestedPlaying = usePlayerStore((state) => state.requestedPlaying);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const controlCommand = usePlayerStore((state) => state.controlCommand);
  const clearControlCommand = usePlayerStore((state) => state.clearControlCommand);
  const setSnapshot = usePlayerStore((state) => state.setSnapshot);
  const requestPause = usePlayerStore((state) => state.requestPause);
  const queue = usePlayerStore((state) => state.queue);
  const playNextTrack = usePlayerStore((state) => state.playNextTrack);
  const isSuppressed = usePlayerStore((state) => state.isSuppressed);
  const suppress = usePlayerStore((state) => state.suppress);
  const unsuppress = usePlayerStore((state) => state.unsuppress);
  const stop = usePlayerStore((state) => state.stop);
  const listingsQuery = useMarketplaceListings(MARKETPLACE_FEED_LIMIT);
  const randomPool = useMemo(() => {
    const mediaGradient = theme.experience.mediaGradient ?? theme.experience.gradient;
    return (listingsQuery.data ?? [])
      .filter((listing) => listing.audioUrl)
      .map((listing) => ({
        id: listing.id,
        title: listing.title,
        artist: listing.artist,
        sellerId: listing.sellerId,
        projectTitle: listing.genre ?? 'Marketplace preview',
        audioUrl: listing.audioUrl ?? null,
        coverUrl: listing.coverUrl,
        artworkGradient: mediaGradient as readonly [string, string],
        surface: 'marketplace' as const,
      }));
  }, [listingsQuery.data, theme.experience.gradient, theme.experience.mediaGradient]);

  const player = useAudioPlayer(track?.audioUrl ?? null, {
    updateInterval: 250,
  });
  const status = useAudioPlayerStatus(player);
  const shouldSuppressForRoute =
    normalizedPath === '/experience-welcome' ||
    normalizedPath.startsWith('/settings');
  const isVaultRoute = routeExperience === 'vault';
  const hasSurfaceMismatch =
    Boolean(track) &&
    ((isVaultRoute && track?.surface !== 'vault') ||
      (!isVaultRoute && track?.surface === 'vault'));
  const showGlobalMiniPlayer =
    visible &&
    track?.surface === 'marketplace' &&
    routeExperience !== 'vault' &&
    !shouldSuppressForRoute &&
    !hasSurfaceMismatch;
  const showFullPlayer = !shouldSuppressForRoute && !hasSurfaceMismatch;
  const miniPlayerWidth = Math.min(390, Math.max(280, width - theme.spacing.xl * 2));

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
      interruptionMode: 'duckOthers',
    }).catch(() => null);
  }, []);

  useEffect(() => {
    setSnapshot({
      currentTime: status.currentTime ?? 0,
      duration: status.duration ?? 0,
      isPlaying: Boolean(status.playing),
      isLoaded: Boolean(status.isLoaded),
      isBuffering: Boolean(status.isBuffering),
      errorMessage: track?.audioUrl ? null : 'No preview audio is attached to this track yet.',
    });

    if (status.didJustFinish) {
      if (repeatMode === 'one' && track?.audioUrl) {
        player
          .seekTo(0)
          .then(() => {
            if (requestedPlaying) {
              player.play();
            }
          })
          .catch(() => null);
        return;
      }

      // Auto-advance: use the existing ordered queue when available, otherwise
      // fall back to a random pick from marketplace listings (single-track queue).
      playNextTrack(queue.length <= 1 ? randomPool : undefined);
    }
  }, [
    repeatMode,
    player,
    playNextTrack,
    queue,
    randomPool,
    requestPause,
    requestedPlaying,
    setSnapshot,
    status.currentTime,
    status.didJustFinish,
    status.duration,
    status.isBuffering,
    status.isLoaded,
    status.playing,
    track?.audioUrl,
  ]);

  useEffect(() => {
    if (!controlCommand) {
      return;
    }
    const command: NonNullable<typeof controlCommand> = controlCommand;

    async function runControlCommand() {
      try {
        if (command.type === 'seek_to_start') {
          await player.seekTo(0);
          return;
        }

        if (command.type === 'seek_to_fraction') {
          const duration = status.duration ?? 0;
          await player.seekTo(command.fraction * duration);
          return;
        }

        const currentTime = status.currentTime ?? 0;
        const duration = status.duration ?? 0;
        const unclampedTarget = currentTime + command.seconds;
        const target =
          duration > 0
            ? Math.min(Math.max(unclampedTarget, 0), duration)
            : Math.max(unclampedTarget, 0);
        await player.seekTo(target);
      } catch (error) {
        setSnapshot({
          errorMessage: error instanceof Error ? error.message : 'Seek command failed.',
        });
      } finally {
        clearControlCommand(command.id);
      }
    }

    runControlCommand().catch(() => null);
  }, [
    clearControlCommand,
    controlCommand,
    player,
    setSnapshot,
    status.currentTime,
    status.duration,
  ]);

  useEffect(() => {
    if (shouldSuppressForRoute) {
      if (track && !isSuppressed) {
        suppress();
      }
    } else {
      if (isSuppressed) {
        unsuppress();
      }
    }
  }, [isSuppressed, shouldSuppressForRoute, suppress, track, unsuppress]);

  useEffect(() => {
    if (!hasSurfaceMismatch) return;
    if (visible || fullPlayerOpen || track) {
      stop();
    }
  }, [fullPlayerOpen, hasSurfaceMismatch, stop, track, visible]);

  useEffect(() => {
    if (!track?.audioUrl) {
      player.pause();
      return;
    }

    if (requestedPlaying) {
      try {
        player.play();
      } catch (error) {
        setSnapshot({
          errorMessage: error instanceof Error ? error.message : 'Preview playback failed.',
          isPlaying: false,
        });
      }
      return;
    }

    player.pause();
  }, [player, requestedPlaying, setSnapshot, track?.audioUrl]);

  return (
    <>
      {showGlobalMiniPlayer ? (
        <View
          pointerEvents="box-none"
          style={[
            styles.globalMiniPlayerWrap,
            {
              bottom:
                layout.bottomBarOffset +
                layout.bottomBarHeight +
                insets.bottom +
                theme.spacing.md,
            },
          ]}
        >
          <MiniPlayerBar
            style={{
              width: miniPlayerWidth,
            }}
          />
        </View>
      ) : null}

      {showFullPlayer ? <FullPlayerModal /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  globalMiniPlayerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: Platform.OS === 'web' ? 100 : 20,
  },
});
