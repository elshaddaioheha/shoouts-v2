import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import { useThemeTokens } from '@/src/theme';
import { Pressable, StyleSheet, View } from 'react-native';

type ExploreHeaderProps = {
  onSearchPress: () => void;
};

export function ExploreHeader({ onSearchPress }: ExploreHeaderProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <AppText variant="title" style={styles.avatarText}>
          C
        </AppText>
      </View>

      <AppText variant="sectionHeading" style={styles.title}>
        Explore
      </AppText>

      <Pressable style={styles.searchButton} onPress={onSearchPress}>
        <AppIcon name="market" size="md" tone="inverse" stroke="medium" />
      </Pressable>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      top: 48,
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      zIndex: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    avatarText: {
      color: '#FFFFFF',
    },
    title: {
      color: '#FFFFFF',
      flex: 1,
    },
    searchButton: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.18)',
    },
  });
}
