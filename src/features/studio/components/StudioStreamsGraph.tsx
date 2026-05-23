import { AppText } from '@/src/components/ui/AppText';
import { useThemeTokens } from '@/src/theme';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import type { StreamDataPoint, StreamsTimeRange } from '../studio.types';

const RANGES: { label: string; value: StreamsTimeRange }[] = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: 'All', value: 'all' },
];

const GRAPH_H = 96;
const PAD_V = 6;
const LOGICAL_W = 300;

type Props = {
  data: StreamDataPoint[];
  range: StreamsTimeRange;
  onRangeChange: (range: StreamsTimeRange) => void;
};

export function StudioStreamsGraph({ data, range, onRangeChange }: Props) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppText variant="caption" tone="muted">
            Streams
          </AppText>
          <AppText variant="sectionHeading">{total.toLocaleString()}</AppText>
        </View>
        <View style={styles.rangePicker}>
          {RANGES.map((r) => (
            <Pressable
              key={r.value}
              onPress={() => onRangeChange(r.value)}
              style={[styles.rangeBtn, range === r.value && styles.rangeBtnActive]}
            >
              <AppText
                variant="caption"
                tone={range === r.value ? 'accent' : 'muted'}
              >
                {r.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.chartWrap}>
        <GraphLine
          data={data}
          accent={theme.colors.accent}
          height={GRAPH_H}
          padding={PAD_V}
        />
      </View>

      {total === 0 && (
        <AppText variant="caption" tone="muted" style={styles.emptyLabel}>
          No streams yet — streams will appear once your tracks are live
        </AppText>
      )}
    </View>
  );
}

function GraphLine({
  data,
  accent,
  height,
  padding,
}: {
  data: StreamDataPoint[];
  accent: string;
  height: number;
  padding: number;
}) {
  const innerH = height - padding * 2;

  if (data.length < 2 || data.every((d) => d.count === 0)) {
    const midY = height / 2;
    const dashD = Array.from({ length: 15 }, (_, i) => {
      const x = (i / 14) * LOGICAL_W;
      return `M${x.toFixed(1)},${midY} h8`;
    }).join(' ');

    return (
      <Svg
        width="100%"
        height={height}
        viewBox={`0 0 ${LOGICAL_W} ${height}`}
        preserveAspectRatio="none"
      >
        <Path d={dashD} stroke={accent} strokeWidth={1.5} opacity={0.25} />
      </Svg>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * LOGICAL_W,
    y: padding + (1 - d.count / maxCount) * innerH,
  }));

  const lineParts = points.map(
    (p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
  );
  const lineD = lineParts.join(' ');
  const areaD = `${lineD} L${LOGICAL_W},${height} L0,${height} Z`;
  const last = points[points.length - 1];

  return (
    <Svg
      width="100%"
      height={height}
      viewBox={`0 0 ${LOGICAL_W} ${height}`}
      preserveAspectRatio="none"
    >
      <Defs>
        <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={accent} stopOpacity={0.22} />
          <Stop offset="100%" stopColor={accent} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={areaD} fill="url(#areaGrad)" />
      <Path d={lineD} stroke={accent} strokeWidth={2} fill="none" />
      <Circle cx={last.x} cy={last.y} r={3.5} fill={accent} />
    </Svg>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    headerLeft: {
      gap: 2,
    },
    rangePicker: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: 2,
      gap: 2,
    },
    rangeBtn: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.radius.pill,
    },
    rangeBtnActive: {
      backgroundColor: theme.colors.accentSoft,
    },
    chartWrap: {
      borderRadius: theme.radius.md,
      overflow: 'hidden',
    },
    emptyLabel: {
      textAlign: 'center',
      paddingBottom: theme.spacing.xs,
    },
  });
}
