import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import { useAccountStore } from '@/src/features/account/account.store';
import { useThemeTokens } from '@/src/theme';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ExploreHeaderProps = {
  onSearchPress: () => void;
};

export function ExploreHeader({ onSearchPress }: ExploreHeaderProps) {
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const profile = useAccountStore((state) => state.profile);
  const styles = createStyles(theme);
  const displayName = profile?.displayName?.trim() || 'Shoouts';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View style={[styles.wrapper, { top: insets.top + 8 }]}>
      <View style={styles.container}>
        <View style={styles.avatar}>
          <AppText variant="title" style={styles.avatarText}>
            {initial}
          </AppText>
        </View>

        <AppText variant="sectionHeading" style={styles.title}>
          Explore
        </AppText>

        <Pressable style={styles.searchButton} onPress={onSearchPress}>
          <AppIcon name="market" size="md" tone="inverse" stroke="medium" />
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    wrapper: {
      position: 'absolute',
      top: 48,
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      zIndex: 20,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.overlay,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
      paddingLeft: theme.spacing.xs,
      paddingRight: theme.spacing.xs,
    },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    avatarText: {
      color: theme.colors.textOnAccent,
    },
    title: {
      color: theme.colors.textOnMedia,
      flex: 1,
    },
    searchButton: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
    },
  });
}
