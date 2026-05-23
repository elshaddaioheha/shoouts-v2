import { useThemeTokens } from '@/src/theme';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const BAR_HEIGHTS = [9, 16, 12, 22, 18, 28, 14, 34, 20, 13, 24, 17, 11, 29, 15, 22, 10, 18, 12];

type WaveformMeterProps = {
  progress: number;
  compact?: boolean;
  onMedia?: boolean;
  onSeek?: (fraction: number) => void;
};

export function WaveformMeter({ progress, compact = false, onMedia = false, onSeek }: WaveformMeterProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme, compact, onMedia);
  const activeIndex = Math.round(progress * (BAR_HEIGHTS.length - 1));
  const containerWidthRef = useRef(0);

  return (
    <View
      style={styles.container}
      pointerEvents={onSeek ? 'auto' : 'none'}
      onLayout={(e) => { containerWidthRef.current = e.nativeEvent.layout.width; }}
    >
      {BAR_HEIGHTS.map((height, index) => (
        <View
          key={`${height}-${index}`}
          style={[
            styles.bar,
            {
              height: compact ? Math.max(5, height * 0.58) : height,
            },
            index <= activeIndex ? styles.activeBar : undefined,
            index === activeIndex ? styles.cursorBar : undefined,
          ]}
        />
      ))}
      {onSeek ? (
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={(e) => {
            const w = containerWidthRef.current;
            if (w <= 0) return;
            const fraction = Math.min(Math.max(e.nativeEvent.locationX / w, 0), 1);
            onSeek(fraction);
          }}
        />
      ) : null}
    </View>
  );
}

function createStyles(
  theme: ReturnType<typeof useThemeTokens>,
  compact: boolean,
  onMedia: boolean
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      minWidth: compact ? 76 : 132,
      maxWidth: compact ? 116 : 240,
      height: compact ? 28 : 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: compact ? 2 : 3,
      overflow: 'hidden',
    },
    bar: {
      width: compact ? 2 : 3,
      borderRadius: theme.radius.pill,
      backgroundColor: onMedia ? theme.colors.textOnMediaMuted : theme.colors.textMuted,
    },
    activeBar: {
      backgroundColor: onMedia ? theme.colors.textOnMedia : theme.colors.textSecondary,
    },
    cursorBar: {
      width: compact ? 3 : 4,
      backgroundColor: theme.colors.accent,
    },
  });
}
