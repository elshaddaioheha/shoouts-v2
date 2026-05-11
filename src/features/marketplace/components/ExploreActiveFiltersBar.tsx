import { AppText } from '@/src/components/ui/AppText';
import { useThemeTokens } from '@/src/theme';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ExploreFeedFilters } from '../marketplace.types';

type ExploreActiveFiltersBarProps = {
  filters: ExploreFeedFilters;
  onClearAll: () => void;
  onRemoveQuery: () => void;
  onRemoveGenre: () => void;
  onResetPrice: () => void;
};

export function ExploreActiveFiltersBar({
  filters,
  onClearAll,
  onRemoveQuery,
  onRemoveGenre,
  onResetPrice,
}: ExploreActiveFiltersBarProps) {
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const query = filters.query.trim();
  const hasActiveFilters = query.length > 0 || filters.genre !== null || filters.price !== 'all';

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <View style={[styles.container, { top: insets.top + 94 }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {query.length > 0 ? (
          <FilterChip label={`Query: "${query}"`} onPress={onRemoveQuery} />
        ) : null}

        {filters.genre ? (
          <FilterChip label={`Genre: ${filters.genre}`} onPress={onRemoveGenre} />
        ) : null}

        {filters.price !== 'all' ? (
          <FilterChip
            label={`Price: ${filters.price === 'free' ? 'Free only' : 'Paid only'}`}
            onPress={onResetPrice}
          />
        ) : null}

        <Pressable style={styles.clearChip} onPress={onClearAll}>
          <AppText variant="caption" style={styles.clearLabel}>
            Clear all
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function FilterChip({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  return (
    <Pressable style={styles.chip} onPress={onPress}>
      <AppText variant="caption" style={styles.chipLabel}>
        {label} x
      </AppText>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      zIndex: 22,
    },
    row: {
      paddingRight: theme.spacing.lg,
      gap: theme.spacing.sm,
      alignItems: 'center',
    },
    chip: {
      minHeight: 30,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.overlay,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingHorizontal: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipLabel: {
      color: theme.colors.textOnMedia,
    },
    clearChip: {
      minHeight: 30,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.accent,
      paddingHorizontal: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clearLabel: {
      color: theme.colors.textOnAccent,
    },
  });
}
