import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import { EXPERIENCE_NAVIGATION } from '@/src/features/navigation/navigation.config';
import { useExperienceNavigationStore } from '@/src/features/navigation/navigation.store';
import { layout, useThemeTokens } from '@/src/theme';
import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

export function BottomPillBar() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const pathname = usePathname();
  const activeExperience = useExperienceNavigationStore((state) => state.activeExperience);
  const config = EXPERIENCE_NAVIGATION[activeExperience];

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {config.tabs.map((item) => {
          const active =
            pathname === item.route ||
            (item.route !== '/(tabs)' && pathname.startsWith(item.route));

          return (
            <Pressable
              key={item.key}
              onPress={() => router.replace(item.route as any)}
              style={[styles.item, active && styles.activeItem]}
            >
              <AppIcon
                name={item.icon}
                size="sm"
                variant={active ? 'solid' : 'plain'}
                tone={active ? 'inverse' : 'secondary'}
                stroke={active ? 'medium' : 'regular'}
              />

              <AppText
                variant="caption"
                tone={active ? 'primary' : 'secondary'}
                numberOfLines={1}
                style={active ? styles.activeLabel : undefined}
              >
                {item.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      ...theme.shadows.md,
    },
    item: {
      flex: 1,
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    activeItem: {
      backgroundColor: theme.colors.accent,
    },
    activeLabel: {
      color: '#FFFFFF',
    },
  });
}
