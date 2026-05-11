import { AppText } from '@/src/components/ui/AppText';
import {
  formatPlayerTime,
  getPlayerProgress,
  usePlayerStore,
} from '@/src/features/player/player.store';
import { useThemeTokens } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  FileText,
  Link2,
  MoreVertical,
  Pause,
  Play,
  Repeat2,
  Share2,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
} from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WaveformMeter } from './WaveformMeter';

export function FullPlayerModal() {
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top, insets.bottom);
  const track = usePlayerStore((state) => state.track);
  const fullPlayerOpen = usePlayerStore((state) => state.fullPlayerOpen);
  const snapshot = usePlayerStore((state) => state.snapshot);
  const togglePlayback = usePlayerStore((state) => state.togglePlayback);
  const closeFullPlayer = usePlayerStore((state) => state.closeFullPlayer);

  if (!track) {
    return null;
  }

  const progress = getPlayerProgress(snapshot);
  const PlayerIcon = snapshot.isPlaying ? Pause : Play;

  return (
    <Modal visible={fullPlayerOpen} transparent animationType="slide" onRequestClose={closeFullPlayer}>
      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <Pressable style={styles.iconButton} onPress={closeFullPlayer}>
            <ChevronLeft size={28} color="rgba(255,255,255,0.62)" />
          </Pressable>

          <View style={styles.topActions}>
            <Link2 size={24} color="rgba(255,255,255,0.58)" />
            <MoreVertical size={24} color="rgba(255,255,255,0.58)" />
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
              <Share2 size={25} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
            <Pressable style={styles.controlButton}>
              <SkipBack size={31} color="#FFFFFF" fill="#FFFFFF" />
            </Pressable>
            <Pressable style={styles.mainControlButton} onPress={togglePlayback}>
              <PlayerIcon size={46} color="#FFFFFF" fill="#FFFFFF" />
            </Pressable>
            <Pressable style={styles.controlButton}>
              <SkipForward size={31} color="#FFFFFF" fill="#FFFFFF" />
            </Pressable>
            <Pressable style={styles.controlButton}>
              <Repeat2 size={27} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>

        <View style={styles.secondaryActions}>
          <Pressable style={styles.secondaryAction}>
            <FileText size={30} color="#FFFFFF" strokeWidth={2.2} />
            <AppText variant="bodySmall" style={styles.secondaryLabel}>
              notes
            </AppText>
          </Pressable>
          <View style={styles.verticalDivider} />
          <Pressable style={styles.secondaryAction}>
            <SlidersHorizontal size={30} color="#FFFFFF" strokeWidth={2.2} />
            <AppText variant="bodySmall" style={styles.secondaryLabel}>
              edit
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>, topInset: number, bottomInset: number) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: '#101010',
      paddingTop: Math.max(topInset, theme.spacing.lg),
      paddingHorizontal: theme.spacing.md,
      paddingBottom: Math.max(bottomInset, theme.spacing.lg),
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
      borderRadius: 24,
      backgroundColor: '#242424',
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
      color: '#FFFFFF',
      textAlign: 'center',
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: 0,
    },
    trackSubtitle: {
      color: 'rgba(255,255,255,0.58)',
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
      color: '#FFFFFF',
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
      paddingTop: theme.spacing.xxl,
    },
    secondaryAction: {
      minWidth: 112,
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    secondaryLabel: {
      color: '#FFFFFF',
      fontSize: 15,
      lineHeight: 20,
    },
    verticalDivider: {
      width: StyleSheet.hairlineWidth,
      height: 92,
      backgroundColor: 'rgba(255,255,255,0.14)',
    },
  });
}
