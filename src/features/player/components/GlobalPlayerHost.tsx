import {
  deriveExperienceFromPathname,
  normalizeNavigationPath,
} from '@/src/features/navigation/navigation.helpers';
import { layout, useThemeTokens } from '@/src/theme';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { usePathname } from 'expo-router';
import { useEffect } from 'react';
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
  const setSnapshot = usePlayerStore((state) => state.setSnapshot);
  const requestPause = usePlayerStore((state) => state.requestPause);
  const stop = usePlayerStore((state) => state.stop);
  const player = useAudioPlayer(track?.audioUrl ?? null, {
    updateInterval: 250,
  });
  const status = useAudioPlayerStatus(player);
  const shouldSuppressPlayer =
    normalizedPath === '/marketplace' || normalizedPath.startsWith('/settings');
  const showGlobalMiniPlayer =
    visible && routeExperience !== 'vault' && !shouldSuppressPlayer;
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
      requestPause();
      player.seekTo(0).catch(() => null);
    }
  }, [
    player,
    requestPause,
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
    if (!shouldSuppressPlayer) {
      return;
    }

    if (visible || fullPlayerOpen) {
      stop();
    }
  }, [fullPlayerOpen, shouldSuppressPlayer, stop, visible]);

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

      {shouldSuppressPlayer ? null : <FullPlayerModal />}
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
