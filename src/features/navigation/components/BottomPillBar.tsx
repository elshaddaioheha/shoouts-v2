import { AppText } from '@/src/components/ui/AppText';
import { EXPERIENCE_NAVIGATION } from '@/src/features/navigation/navigation.config';
import { useExperienceNavigationStore } from '@/src/features/navigation/navigation.store';
import { useThemeTokens } from '@/src/theme';
import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

export function BottomPillBar() {
  const pathname = usePathname();
  const activeExperience = useExperienceNavigationStore((state) => state.activeExperience);
  const theme = useThemeTokens();
  const styles = createStyles(theme);
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
              <AppText
                variant="caption"
                tone={active ? 'primary' : 'secondary'}
                style={active && styles.activeLabel}
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
      left: 16,
      right: 16,
      bottom: 18,
      alignItems: 'center',
    },
    container: {
      width: '100%',
      minHeight: 58,
      borderRadius: 999,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    item: {
      flex: 1,
      minHeight: 42,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    activeItem: {
      backgroundColor: theme.experience.accent,
    },
    activeLabel: {
      color: '#FFFFFF',
    },
  });
}
