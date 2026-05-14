import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import {
  formatPlayerTime,
  getPlayerProgress,
  usePlayerStore,
} from '@/src/features/player/player.store';
import { useThemeTokens } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ChevronLeft,
  Link2,
  MoreVertical,
  Pause,
  Play,
  Repeat2,
  Share2,
  SkipBack,
  SkipForward,
} from 'lucide-react-native';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WaveformMeter } from './WaveformMeter';

const SWIPE_DISMISS_DISTANCE = 120;

export function FullPlayerModal() {
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top, insets.bottom);
  const track = usePlayerStore((state) => state.track);
  const fullPlayerOpen = usePlayerStore((state) => state.fullPlayerOpen);
  const snapshot = usePlayerStore((state) => state.snapshot);
  const togglePlayback = usePlayerStore((state) => state.togglePlayback);
  const closeFullPlayer = usePlayerStore((state) => state.closeFullPlayer);
  const dragY = useRef(new Animated.Value(0)).current;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
          dragY.setValue(Math.max(0, gesture.dy));
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > SWIPE_DISMISS_DISTANCE || gesture.vy > 1.1) {
            Animated.timing(dragY, {
              toValue: 420,
              duration: 180,
              useNativeDriver: true,
            }).start(() => {
              dragY.setValue(0);
              closeFullPlayer();
            });
            return;
          }

          Animated.spring(dragY, {
            toValue: 0,
            speed: 20,
            bounciness: 0,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(dragY, {
            toValue: 0,
            speed: 20,
            bounciness: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [closeFullPlayer, dragY]
  );

  useEffect(() => {
    if (!fullPlayerOpen) {
      dragY.setValue(0);
    }
  }, [dragY, fullPlayerOpen]);

  if (!track) {
    return null;
  }

  const progress = getPlayerProgress(snapshot);
  const PlayerIcon = snapshot.isPlaying ? Pause : Play;
  const trackId = track.id;
  const isMarketplaceTrack = track.surface === 'marketplace';
  const secondaryTitleLeft = isMarketplaceTrack ? 'Save to library' : 'Notes';
  const secondaryTitleRight = isMarketplaceTrack ? 'Purchase' : 'Edit';

  function handleSecondaryLeft() {
    closeFullPlayer();
    if (isMarketplaceTrack) {
      router.push('/saved' as any);
      return;
    }

    router.push('/vault/shared' as any);
  }

  function handleSecondaryRight() {
    closeFullPlayer();
    if (isMarketplaceTrack) {
      router.push({
        pathname: '/listing/[id]',
        params: { id: trackId },
      } as any);
      return;
    }

    router.push('/vault/more' as any);
  }

  return (
    <Modal visible={fullPlayerOpen} transparent animationType="fade" onRequestClose={closeFullPlayer}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={closeFullPlayer} />

        <Animated.View style={[styles.modalContent, { transform: [{ translateY: dragY }] }]}>
          <View style={styles.dragHandleWrap} {...panResponder.panHandlers}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.topBar}>
            <Pressable style={styles.iconButton} onPress={closeFullPlayer}>
              <ChevronLeft size={28} color={theme.colors.textSecondary} />
            </Pressable>

            <View style={styles.topActions}>
              <Link2 size={22} color={theme.colors.textSecondary} />
              <MoreVertical size={22} color={theme.colors.textSecondary} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.heading}>
              <AppText variant="pageHeading" style={styles.trackTitle} numberOfLines={2}>
                {track.title}
              </AppText>
              <AppText variant="bodySmall" style={styles.trackSubtitle} numberOfLines={1}>
                {track.projectTitle ?? 'untitled project'} - {track.artist}
              </AppText>
            </View>

            <LinearGradient
              colors={track.artworkGradient ?? theme.experience.gradient}
              style={styles.artworkDisc}
            />

            <View style={styles.waveformWrap}>
              <WaveformMeter progress={progress} onMedia />
            </View>

            <AppText variant="button" style={styles.timeText}>
              {formatPlayerTime(snapshot.currentTime)} / {formatPlayerTime(snapshot.duration || 139)}
            </AppText>

            <View style={styles.controls}>
              <Pressable style={styles.controlButton}>
                <Share2 size={24} color={theme.colors.textOnMedia} strokeWidth={2.4} />
              </Pressable>
              <Pressable style={styles.controlButton}>
                <SkipBack size={30} color={theme.colors.textOnMedia} fill={theme.colors.textOnMedia} />
              </Pressable>
              <Pressable style={styles.mainControlButton} onPress={togglePlayback}>
                <PlayerIcon size={44} color={theme.colors.textOnMedia} fill={theme.colors.textOnMedia} />
              </Pressable>
              <Pressable style={styles.controlButton}>
                <SkipForward size={30} color={theme.colors.textOnMedia} fill={theme.colors.textOnMedia} />
              </Pressable>
              <Pressable style={styles.controlButton}>
                <Repeat2 size={25} color={theme.colors.textOnMedia} strokeWidth={2.4} />
              </Pressable>
            </View>
          </View>

          <View style={styles.secondaryActions}>
            <Pressable style={styles.secondaryAction} onPress={handleSecondaryLeft}>
              <AppIcon
                name={isMarketplaceTrack ? 'like' : 'listings'}
                size="lg"
                tone="secondary"
                variant="plain"
              />
              <AppText variant="bodySmall" style={styles.secondaryLabel}>
                {secondaryTitleLeft}
              </AppText>
            </Pressable>
            <View style={styles.verticalDivider} />
            <Pressable style={styles.secondaryAction} onPress={handleSecondaryRight}>
              <AppIcon
                name={isMarketplaceTrack ? 'cart' : 'settings'}
                size="lg"
                tone="secondary"
                variant="plain"
              />
              <AppText variant="bodySmall" style={styles.secondaryLabel}>
                {secondaryTitleRight}
              </AppText>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>, topInset: number, bottomInset: number) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.colors.overlay,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      paddingTop: Math.max(topInset, theme.spacing.md),
      paddingHorizontal: theme.spacing.md,
      paddingBottom: Math.max(bottomInset, theme.spacing.lg),
    },
    dragHandleWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
    },
    dragHandle: {
      width: 56,
      height: 5,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.borderStrong,
    },
    topBar: {
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    iconButton: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.lg,
      paddingRight: theme.spacing.sm,
    },
    card: {
      borderRadius: theme.radius.xxl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xxl,
      paddingBottom: theme.spacing.xxl,
      alignItems: 'center',
      gap: theme.spacing.xl,
    },
    heading: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      maxWidth: '92%',
    },
    trackTitle: {
      color: theme.colors.textPrimary,
      textAlign: 'center',
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: 0,
    },
    trackSubtitle: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontSize: 16,
      lineHeight: 21,
    },
    artworkDisc: {
      width: '76%',
      aspectRatio: 1,
      maxWidth: 268,
      borderRadius: 999,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    waveformWrap: {
      width: '100%',
      alignItems: 'center',
    },
    timeText: {
      color: theme.colors.textPrimary,
      letterSpacing: 0,
    },
    controls: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
    },
    controlButton: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mainControlButton: {
      width: 64,
      height: 64,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xxl,
      paddingTop: theme.spacing.xl,
    },
    secondaryAction: {
      minWidth: 132,
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    secondaryLabel: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      lineHeight: 20,
      textAlign: 'center',
    },
    verticalDivider: {
      width: StyleSheet.hairlineWidth,
      height: 92,
      backgroundColor: theme.colors.borderStrong,
    },
  });
}
