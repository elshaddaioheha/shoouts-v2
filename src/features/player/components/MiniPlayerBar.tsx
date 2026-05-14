import { AppText } from '@/src/components/ui/AppText';
import { getPlayerProgress, usePlayerStore } from '@/src/features/player/player.store';
import { useThemeTokens } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Pause, Play, Share2 } from 'lucide-react-native';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { WaveformMeter } from './WaveformMeter';

type MiniPlayerBarProps = {
  variant?: 'global' | 'vault';
  style?: StyleProp<ViewStyle>;
};

export function MiniPlayerBar({ variant = 'global', style }: MiniPlayerBarProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme, variant);
  const track = usePlayerStore((state) => state.track);
  const visible = usePlayerStore((state) => state.visible);
  const snapshot = usePlayerStore((state) => state.snapshot);
  const togglePlayback = usePlayerStore((state) => state.togglePlayback);
  const openFullPlayer = usePlayerStore((state) => state.openFullPlayer);

  if (!visible || !track) {
    return null;
  }

  const progress = getPlayerProgress(snapshot);
  const PlayerIcon = snapshot.isPlaying ? Pause : Play;
  const subtitle = track.projectTitle ?? track.artist;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed ? styles.containerPressed : undefined, style]}
      onPress={openFullPlayer}
    >
      <LinearGradient
        colors={track.artworkGradient ?? theme.experience.gradient}
        style={styles.playButton}
      >
        <Pressable
          style={styles.playButtonPressable}
          onPress={(event) => {
            event.stopPropagation?.();
            togglePlayback();
          }}
        >
          <PlayerIcon
            size={variant === 'vault' ? 18 : 20}
            color={theme.colors.textOnMedia}
            fill={theme.colors.textOnMedia}
          />
        </Pressable>
      </LinearGradient>

      <View style={styles.copy}>
        <AppText variant="button" style={styles.title} numberOfLines={1}>
          {track.title}
        </AppText>
        <AppText variant="caption" style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </AppText>
      </View>

      <WaveformMeter progress={progress} compact onMedia />

      <Pressable
        style={styles.shareButton}
        onPress={(event) => {
          event.stopPropagation?.();
          openFullPlayer();
        }}
      >
        <Share2 size={18} color={theme.colors.textOnMedia} strokeWidth={2.6} />
      </Pressable>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>, variant: 'global' | 'vault') {
  const compactVault = variant === 'vault';

  return StyleSheet.create({
    container: {
      minHeight: compactVault ? 64 : 66,
      borderRadius: theme.radius.pill,
      backgroundColor: compactVault ? theme.colors.surfaceElevated : theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      flexDirection: 'row',
      alignItems: 'center',
      gap: compactVault ? theme.spacing.sm : theme.spacing.md,
      paddingHorizontal: compactVault ? theme.spacing.sm : theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      overflow: 'hidden',
      ...theme.shadows.md,
    },
    containerPressed: {
      transform: [{ scale: 0.99 }],
      opacity: 0.95,
    },
    playButton: {
      width: compactVault ? 44 : 50,
      height: compactVault ? 44 : 50,
      borderRadius: theme.radius.pill,
      flexShrink: 0,
      overflow: 'hidden',
    },
    playButtonPressable: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    copy: {
      flex: 1,
      minWidth: compactVault ? 70 : 96,
      maxWidth: compactVault ? 118 : 154,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: compactVault ? 13 : 14,
      lineHeight: compactVault ? 16 : 18,
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: compactVault ? 11 : 12,
      lineHeight: compactVault ? 14 : 15,
    },
    shareButton: {
      width: compactVault ? 34 : 38,
      height: compactVault ? 34 : 38,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
  });
}
