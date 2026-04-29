import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import { EXPERIENCE_NAVIGATION } from '@/src/features/navigation/navigation.config';
import { useExperienceNavigationStore } from '@/src/features/navigation/navigation.store';
import { layout, useThemeTokens } from '@/src/theme';
import { router, usePathname } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type TabLayout = {
  x: number;
  width: number;
};

type LabelMeasurements = Record<string, number>;

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

function normalizePath(path: string) {
  const withoutGroups = path.replace(/\/\([^/]+\)/g, '');
  const collapsed = withoutGroups.replace(/\/{2,}/g, '/');
  const trimmed = collapsed !== '/' ? collapsed.replace(/\/$/, '') : collapsed;
  return trimmed.length > 0 ? trimmed : '/';
}

export function BottomPillBar() {
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const pathname = usePathname();
  const normalizedPathname = normalizePath(pathname);
  const activeExperience = useExperienceNavigationStore((state) => state.activeExperience);
  const config = EXPERIENCE_NAVIGATION[activeExperience];
  const tabs = config.tabs;
  const isDenseLayout = tabs.length >= 5;
  const barEdgeInset = isDenseLayout ? theme.spacing.sm : theme.spacing.md;
  const barHorizontalPadding = theme.spacing.xs;
  const tabHorizontalPadding = isDenseLayout ? theme.spacing.xs : theme.spacing.sm;
  const pillHorizontalInset = isDenseLayout ? theme.spacing.xs : theme.spacing.sm;
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});
  const [labelWidths, setLabelWidths] = useState<LabelMeasurements>({});
  const [barWidth, setBarWidth] = useState(0);

  const activeIndex = useMemo(
    () =>
      tabs.findIndex(
        (item) => {
          const normalizedRoute = normalizePath(item.route);
          if (normalizedRoute === '/') {
            return normalizedPathname === '/';
          }
          return (
            normalizedPathname === normalizedRoute ||
            normalizedPathname.startsWith(`${normalizedRoute}/`)
          );
        }
      ),
    [normalizedPathname, tabs]
  );
  const selectedIndex = activeIndex >= 0 ? activeIndex : 0;
  const selectedTab = tabs[selectedIndex];
  const selectedTabLayout = tabLayouts[selectedTab.key];
  const selectedLabelWidth = labelWidths[selectedTab.key] ?? 0;
  const labelRevealWidth = Math.max(24, Math.ceil(selectedLabelWidth || 0));

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  useEffect(() => {
    const layoutForActive = selectedTabLayout;

    if (!layoutForActive) return;

    const iconWidth = 18;
    const horizontalInset = pillHorizontalInset;
    const contentWidth =
      iconWidth + labelRevealWidth + theme.spacing.xs + horizontalInset * 2;
    const maxWidthInsideBar = barWidth
      ? Math.max(44, barWidth - theme.spacing.sm * 2)
      : contentWidth;
    const targetWidth = Math.min(contentWidth, maxWidthInsideBar);
    const tabCenterX = layoutForActive.x + layoutForActive.width / 2;
    const unclampedX = tabCenterX - targetWidth / 2;
    const minX = theme.spacing.xs;
    const maxX = barWidth
      ? Math.max(minX, barWidth - targetWidth - theme.spacing.xs)
      : unclampedX;
    const targetX = clamp(unclampedX, minX, maxX);

    indicatorX.value = withTiming(targetX, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });

    indicatorWidth.value = withTiming(targetWidth, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });

    indicatorOpacity.value = withTiming(1, {
      duration: 180,
      easing: Easing.out(Easing.quad),
    });
  }, [
    indicatorOpacity,
    indicatorWidth,
    indicatorX,
    labelRevealWidth,
    selectedIndex,
    selectedTabLayout,
    tabLayouts,
    tabs,
    theme.spacing.xs,
    theme.spacing.sm,
    barWidth,
    pillHorizontalInset,
  ]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    width: indicatorWidth.value,
    transform: [{ translateX: indicatorX.value }],
  }));

  function handleTabLayout(tabKey: string, x: number, width: number) {
    setTabLayouts((current) => {
      const previous = current[tabKey];
      if (previous && previous.x === x && previous.width === width) {
        return current;
      }

      return {
        ...current,
        [tabKey]: { x, width },
      };
    });
  }

  function handleTabPress(route: string) {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => null);
    }

    router.replace(route as any);
  }

  function handleLabelLayout(tabKey: string, width: number) {
    setLabelWidths((current) => {
      const nextWidth = Math.ceil(width);
      if (!nextWidth || current[tabKey] === nextWidth) {
        return current;
      }

      return {
        ...current,
        [tabKey]: nextWidth,
      };
    });
  }

  return (
    <View
      style={[
        styles.wrapper,
        {
          left: barEdgeInset,
          right: barEdgeInset,
          bottom: layout.bottomBarOffset + insets.bottom,
        },
      ]}
    >
      <View
        style={[styles.container, { paddingHorizontal: barHorizontalPadding }]}
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
      >
        <Animated.View pointerEvents="none" style={[styles.activePill, indicatorStyle]} />
        {tabs.map((item) => {
          const active = tabs[selectedIndex]?.key === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => handleTabPress(item.route)}
              onLayout={(event) => {
                const { x, width } = event.nativeEvent.layout;
                handleTabLayout(item.key, x, width);
              }}
              style={[styles.item, { paddingHorizontal: tabHorizontalPadding }]}
            >
              <BottomTabItem
                icon={item.icon}
                label={item.label}
                active={active}
                labelGap={theme.spacing.xs}
                styles={styles}
                labelRevealWidth={labelRevealWidth}
                onLabelLayout={(width) => handleLabelLayout(item.key, width)}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function BottomTabItem({
  icon,
  label,
  active,
  labelGap,
  styles,
  labelRevealWidth,
  onLabelLayout,
}: {
  icon: Parameters<typeof AppIcon>[0]['name'];
  label: string;
  active: boolean;
  labelGap: number;
  styles: ReturnType<typeof createStyles>;
  labelRevealWidth: number;
  onLabelLayout: (width: number) => void;
}) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, progress]);

  const labelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    width: interpolate(progress.value, [0, 1], [0, labelRevealWidth], Extrapolation.CLAMP),
    marginLeft: interpolate(progress.value, [0, 1], [0, labelGap], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.itemContent}>
      <AppIcon
        name={icon}
        size="sm"
        variant="plain"
        tone={active ? 'inverse' : 'secondary'}
        stroke={active ? 'medium' : 'regular'}
      />

      <Animated.View style={[styles.labelWrap, labelStyle]}>
        <AppText
          variant="caption"
          tone={active ? 'primary' : 'secondary'}
          numberOfLines={1}
          onLayout={(event) => onLabelLayout(event.nativeEvent.layout.width)}
          style={active ? styles.activeLabel : undefined}
        >
          {label}
        </AppText>
      </Animated.View>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      bottom: layout.bottomBarOffset,
      alignItems: 'center',
    },
    container: {
      width: '100%',
      minHeight: layout.bottomBarHeight,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      ...theme.shadows.md,
    },
    activePill: {
      position: 'absolute',
      left: 0,
      top: theme.spacing.sm,
      bottom: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.accent,
    },
    item: {
      flex: 1,
      minHeight: theme.layout.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.sm,
      zIndex: 1,
      overflow: 'visible',
    },
    itemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: theme.layout.minTouchTarget,
      paddingHorizontal: theme.spacing.xs,
    },
    labelWrap: {
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    activeLabel: {
      color: '#FFFFFF',
    },
  });
}
