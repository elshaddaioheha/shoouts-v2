import { AppText } from '@/src/components/ui/AppText';
import { useThemeTokens } from '@/src/theme';
import { Music2, Search } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

export function MarketplaceHeader() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  return (
    <View style={styles.header}>
      <View style={styles.kickerRow}>
        <View style={styles.kickerIcon}>
          <Music2 size={16} color={theme.colors.accent} />
        </View>

        <AppText variant="caption" tone="accent">
          Shoouts Marketplace
        </AppText>
      </View>

      <AppText variant="pageHeading">Discover beats</AppText>

      <AppText variant="body" tone="secondary" style={styles.subtitle}>
        Stream previews, collect free beats, and purchase premium sounds from
        Studio creators.
      </AppText>

      <View style={styles.searchBar}>
        <Search size={16} color={theme.colors.textMuted} />
        <AppText variant="bodySmall" tone="muted" numberOfLines={1}>
          Search and genre filters coming soon
        </AppText>
      </View>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    header: {
      gap: theme.spacing.sm,
    },
    kickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    kickerIcon: {
      width: theme.spacing.xxl,
      height: theme.spacing.xxl,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subtitle: {
      maxWidth: 560,
    },
    searchBar: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
  });
}
