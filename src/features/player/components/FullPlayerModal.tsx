import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import type { AppIconKey } from '@/src/components/ui/appIcons';
import { InterimFeatureSheet } from '@/src/components/ui/InterimFeatureSheet';
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
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WaveformMeter } from './WaveformMeter';

const SWIPE_DISMISS_DISTANCE = 120;

type TrackOption = {
  id: string;
  title: string;
  subtitle: string;
  icon: AppIconKey;
  onPress: () => void;
};

type PlayerNotice = {
  title: string;
  message: string;
};

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
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [notice, setNotice] = useState<PlayerNotice | null>(null);

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
              setOptionsOpen(false);
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
      setOptionsOpen(false);
      setNotice(null);
    }
  }, [dragY, fullPlayerOpen]);

  if (!track) {
    return null;
  }

  const progress = getPlayerProgress(snapshot);
  const PlayerIcon = snapshot.isPlaying ? Pause : Play;
  const trackId = track.id;
  const isMarketplaceTrack = track.surface === 'marketplace';
  const sellerId = track.sellerId?.trim() || null;
  const secondaryTitleLeft = isMarketplaceTrack ? 'Save to library' : 'Notes';
  const secondaryTitleRight = isMarketplaceTrack ? 'Purchase' : 'Edit';

  async function shareMessage(message: string) {
    try {
      await Share.share({ message });
    } catch (error) {
      setNotice({
        title: 'Share not available',
        message:
          error instanceof Error
            ? error.message
            : 'This device cannot open the share sheet right now.',
      });
    }
  }

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

  const options: TrackOption[] = (() => {
    if (isMarketplaceTrack) {
      return [
        {
          id: 'save-library',
          title: 'Save to library',
          subtitle: 'Open saved tracks and favorites.',
          icon: 'like',
          onPress: () => {
            setOptionsOpen(false);
            closeFullPlayer();
            router.push('/saved' as any);
          },
        },
        {
          id: 'buy-now',
          title: 'Buy now',
          subtitle: 'Go to listing purchase review.',
          icon: 'cart',
          onPress: () => {
            setOptionsOpen(false);
            closeFullPlayer();
            router.push({
              pathname: '/listing/[id]',
              params: { id: trackId },
            } as any);
          },
        },
        {
          id: 'seller-profile',
          title: 'View seller profile',
          subtitle: 'Open creator storefront details.',
          icon: 'profile',
          onPress: () => {
            setOptionsOpen(false);
            if (!sellerId) {
              setNotice({
                title: 'Seller profile unavailable',
                message: 'This track does not include seller identity yet.',
              });
              return;
            }

            closeFullPlayer();
            router.push({
              pathname: '/profile/[id]',
              params: { id: sellerId },
            } as any);
          },
        },
        {
          id: 'share-track',
          title: 'Share track',
          subtitle: 'Open native share sheet.',
          icon: 'share',
          onPress: () => {
            setOptionsOpen(false);
            shareMessage(`Check out "${track.title}" by ${track.artist} on Shoouts.`);
          },
        },
      ];
    }

    return [
      {
        id: 'rename-project',
        title: 'Rename project',
        subtitle: 'Project naming tools are next.',
        icon: 'settings',
        onPress: () => {
          setOptionsOpen(false);
          setNotice({
            title: 'Rename is next',
            message: 'Vault project rename will be connected with project writes.',
          });
        },
      },
      {
        id: 'move-folder',
        title: 'Move to folder',
        subtitle: 'Choose a target Vault folder.',
        icon: 'folders',
        onPress: () => {
          setOptionsOpen(false);
          closeFullPlayer();
          router.push('/vault/folders' as any);
        },
      },
      {
        id: 'duplicate-project',
        title: 'Duplicate project',
        subtitle: 'Copy this project as a new draft.',
        icon: 'add',
        onPress: () => {
          setOptionsOpen(false);
          setNotice({
            title: 'Duplicate is next',
            message: 'Project duplication will be connected with private Vault writes.',
          });
        },
      },
      {
        id: 'share-preview',
        title: 'Share preview',
        subtitle: 'Open native share sheet.',
        icon: 'share',
        onPress: () => {
          setOptionsOpen(false);
          shareMessage(`Preview "${track.title}" by ${track.artist} from my Vault.`);
        },
      },
    ];
  })();

  return (
    <>
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
                <Pressable
                  style={styles.iconButton}
                  onPress={() => shareMessage(`Check out "${track.title}" by ${track.artist}.`)}
                >
                  <Link2 size={22} color={theme.colors.textSecondary} />
                </Pressable>
                <Pressable style={styles.iconButton} onPress={() => setOptionsOpen(true)}>
                  <MoreVertical size={22} color={theme.colors.textSecondary} />
                </Pressable>
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

          {optionsOpen ? (
            <View style={styles.optionsLayer}>
              <Pressable style={styles.optionsBackdrop} onPress={() => setOptionsOpen(false)} />
              <View style={styles.optionsSheet}>
                <View style={styles.optionsHeader}>
                  <AppText variant="sectionHeading">Track options</AppText>
                  <AppText variant="caption" tone="secondary">
                    {isMarketplaceTrack ? 'Marketplace actions' : 'Vault actions'}
                  </AppText>
                </View>

                <View style={styles.optionsList}>
                  {options.map((option) => (
                    <Pressable
                      key={option.id}
                      style={styles.optionRow}
                      onPress={option.onPress}
                    >
                      <View style={styles.optionIconWrap}>
                        <AppIcon name={option.icon} size="sm" tone="accent" variant="soft" />
                      </View>
                      <View style={styles.optionCopy}>
                        <AppText variant="bodySmall" style={styles.optionTitle}>
                          {option.title}
                        </AppText>
                        <AppText variant="caption" tone="secondary">
                          {option.subtitle}
                        </AppText>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>

      <InterimFeatureSheet
        visible={Boolean(notice)}
        title={notice?.title ?? ''}
        message={notice?.message ?? ''}
        onClose={() => setNotice(null)}
      />
    </>
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
      borderRadius: theme.radius.pill,
    },
    topActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
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
    optionsLayer: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 40,
      justifyContent: 'flex-end',
    },
    optionsBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.overlay,
    },
    optionsSheet: {
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    optionsHeader: {
      gap: theme.spacing.xs,
    },
    optionsList: {
      gap: theme.spacing.sm,
    },
    optionRow: {
      minHeight: theme.layout.minTouchTarget + theme.spacing.sm,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    optionIconWrap: {
      width: 34,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionCopy: {
      flex: 1,
      gap: 2,
    },
    optionTitle: {
      color: theme.colors.textPrimary,
      fontWeight: '800',
    },
  });
}
