import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import { deriveExperienceFromPathname, normalizeNavigationPath } from '@/src/features/navigation/navigation.helpers';
import { EXPERIENCE_NAVIGATION } from '@/src/features/navigation/navigation.config';
import { layout, useThemeTokens } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type TabLayout = {
  x: number;
  width: number;
};

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

export function BottomPillBar() {
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const { width: viewportWidth } = useWindowDimensions();
  const styles = createStyles(theme);
  const pathname = usePathname();
  const normalizedPathname = normalizeNavigationPath(pathname);
  const routeExperience = deriveExperienceFromPathname(pathname);
  const config = EXPERIENCE_NAVIGATION[routeExperience];
  const tabs = config.tabs;
  const isDenseLayout = tabs.length >= 5;
  const isNativeLargeScreen = Platform.OS !== 'web' && viewportWidth >= 768;
  const responsiveBarWidth = Math.min(
    isNativeLargeScreen ? 420 : 335,
    Math.max(240, viewportWidth - (isNativeLargeScreen ? 44 : 28))
  );
  const barHorizontalPadding = theme.spacing.xs;
  const tabHorizontalPadding = isDenseLayout ? theme.spacing.xs : theme.spacing.sm;
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});
  const [barWidth, setBarWidth] = useState(0);
  const hasInitializedIndicatorRef = useRef(false);

  const activeIndex = useMemo(() => {
    const exactIndex = tabs.findIndex((item) => {
      const normalizedRoute = normalizeNavigationPath(item.route);
      return normalizedPathname === normalizedRoute;
    });

    if (exactIndex >= 0) {
      return exactIndex;
    }

    let bestPrefixMatchIndex = -1;
    let bestPrefixLength = -1;

    tabs.forEach((item, index) => {
      const normalizedRoute = normalizeNavigationPath(item.route);
      if (normalizedRoute === '/') return;

      if (
        normalizedPathname.startsWith(`${normalizedRoute}/`) &&
        normalizedRoute.length > bestPrefixLength
      ) {
        bestPrefixLength = normalizedRoute.length;
        bestPrefixMatchIndex = index;
      }
    });

    return bestPrefixMatchIndex;
  }, [normalizedPathname, tabs]);
  // When no tab matches (for example a detail route outside this tab set),
  // keep the active index empty instead of forcing index 0.
  const selectedIndex = activeIndex >= 0 ? activeIndex : -1;
  const selectedTab = selectedIndex >= 0 ? tabs[selectedIndex] : tabs[0];
  const selectedTabLayout = selectedIndex >= 0 ? tabLayouts[selectedTab.key] : undefined;

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  useEffect(() => {
    const layoutForActive = selectedTabLayout;

    // No matching tab — hide the indicator cleanly.
    if (!layoutForActive || selectedIndex < 0) {
      indicatorOpacity.value = withTiming(0, { duration: 150 });
      return;
    }

    const targetWidth = Math.max(
      theme.layout.minTouchTarget,
      layoutForActive.width - theme.spacing.xs * 2
    );
    const targetX = layoutForActive.x + (layoutForActive.width - targetWidth) / 2;
    const minX = theme.spacing.xs;
    const maxX = barWidth
      ? Math.max(minX, barWidth - targetWidth - theme.spacing.xs)
      : Math.max(minX, targetX);
    const clampedX = clamp(targetX, minX, maxX);

    if (!hasInitializedIndicatorRef.current) {
      hasInitializedIndicatorRef.current = true;
      indicatorX.value = clampedX;
      indicatorWidth.value = targetWidth;
      indicatorOpacity.value = 1;
      return;
    }

    indicatorX.value = withTiming(clampedX, {
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
    selectedIndex,
    selectedTabLayout,
    barWidth,
    theme.layout.minTouchTarget,
    theme.spacing.xs,
    tabs,
    tabLayouts,
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

    const normalizedRoute = normalizeNavigationPath(route);
    if (normalizedPathname === normalizedRoute) {
      return;
    }

    router.navigate(route as any);
  }

  return (
    <View
      style={[
        styles.wrapper,
        {
          left: 0,
          right: 0,
          bottom: layout.bottomBarOffset + insets.bottom,
        },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            width: responsiveBarWidth,
            paddingHorizontal: barHorizontalPadding,
          },
        ]}
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
      >
        <LinearGradient
          pointerEvents="none"
          colors={
            theme.isDark
              ? ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0)']
              : ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.26)', 'rgba(255,255,255,0)']
          }
          locations={[0, 0.36, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.containerGlass}
        />
        <View pointerEvents="none" style={styles.topSheen} />
        <Animated.View pointerEvents="none" style={[styles.activePill, indicatorStyle]} />
        {tabs.map((item) => {
          const active = selectedIndex >= 0 && tabs[selectedIndex]?.key === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => handleTabPress(item.route)}
              android_ripple={{ color: theme.colors.accentSoft, borderless: false }}
              onLayout={(event) => {
                const { x, width } = event.nativeEvent.layout;
                handleTabLayout(item.key, x, width);
              }}
              style={({ pressed }) => [
                styles.item,
                { paddingHorizontal: tabHorizontalPadding },
                pressed ? styles.itemPressed : undefined,
              ]}
            >
              <BottomTabItem
                icon={item.icon}
                label={item.label}
                active={active}
                styles={styles}
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
  styles,
}: {
  icon: Parameters<typeof AppIcon>[0]['name'];
  label: string;
  active: boolean;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.itemContent}>
      <AppIcon
        name={icon}
        size="sm"
        variant="plain"
        tone={active ? 'inverse' : 'secondary'}
        stroke="regular"
      />

      <View style={styles.labelWrap}>
        <AppText
          variant="bodySmall"
          tone={active ? 'primary' : 'secondary'}
          numberOfLines={1}
          style={[styles.labelText, active ? styles.activeLabel : undefined]}
        >
          {label}
        </AppText>
      </View>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    wrapper: {
      position: 'absolute',
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
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      ...theme.shadows.md,
    },
    containerGlass: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: theme.radius.pill,
    },
    topSheen: {
      position: 'absolute',
      top: 0,
      left: theme.spacing.md,
      right: theme.spacing.md,
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.82)',
      zIndex: 0,
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
    itemPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.985 }],
    },
    itemContent: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: theme.layout.minTouchTarget,
      gap: 2,
      paddingHorizontal: theme.spacing.xs,
      width: '100%',
    },
    labelWrap: {
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: '100%',
      minHeight: 12,
    },
    labelText: {
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 0,
      textTransform: 'none',
      color: theme.colors.textMuted,
      textAlign: 'center',
      maxWidth: '100%',
    },
    activeLabel: {
      color: theme.colors.textOnAccent,
    },
  });
}
