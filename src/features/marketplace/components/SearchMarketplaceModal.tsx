import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import { useThemeTokens } from '@/src/theme';
import type {
  ExploreFeedFilters,
  ExploreFilterPreset,
  ExplorePriceFilter,
} from '../marketplace.types';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

type SearchMarketplaceModalProps = {
  visible: boolean;
  onClose: () => void;
  filters: ExploreFeedFilters;
  onChangeFilters: (next: ExploreFeedFilters) => void;
  onClearFilters: () => void;
  presets: ExploreFilterPreset[];
  onApplyPreset: (preset: ExploreFilterPreset) => void;
  onSavePreset: () => void | Promise<void>;
  onDeletePreset: (presetId: string) => void | Promise<void>;
  genreOptions: string[];
  helperLabel?: string | null;
};

const priceOptions: { label: string; value: ExplorePriceFilter }[] = [
  { label: 'All prices', value: 'all' },
  { label: 'Free only', value: 'free' },
  { label: 'Paid only', value: 'paid' },
];

export function SearchMarketplaceModal({
  visible,
  onClose,
  filters,
  onChangeFilters,
  onClearFilters,
  presets,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
  genreOptions,
  helperLabel,
}: SearchMarketplaceModalProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const hasActiveFilters =
    filters.query.trim().length > 0 ||
    filters.genre !== null ||
    filters.price !== 'all';

  function handleQueryChange(query: string) {
    onChangeFilters({
      ...filters,
      query,
    });
  }

  function handlePriceChange(price: ExplorePriceFilter) {
    onChangeFilters({
      ...filters,
      price,
    });
  }

  function handleGenreToggle(genre: string) {
    onChangeFilters({
      ...filters,
      genre: filters.genre === genre ? null : genre,
    });
  }

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="overFullScreen" transparent>
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <AppText variant="sectionHeading">Search Marketplace</AppText>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <AppIcon name="more" size="md" tone="secondary" />
            </Pressable>
          </View>

          <View style={styles.searchBox}>
            <AppIcon name="market" size="md" tone="muted" />
            <TextInput
              value={filters.query}
              onChangeText={handleQueryChange}
              placeholder="Search beats, songs, producers..."
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
              returnKeyType="search"
              autoCorrect={false}
            />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.filterSection}>
              <View style={styles.sectionHeader}>
                <AppText variant="caption" tone="muted">
                  Saved presets
                </AppText>
                <Pressable
                  style={[styles.savePresetButton, !hasActiveFilters && styles.savePresetButtonDisabled]}
                  disabled={!hasActiveFilters}
                  onPress={() => {
                    void onSavePreset();
                  }}
                >
                  <AppText variant="caption" style={styles.savePresetLabel}>
                    Save current
                  </AppText>
                </Pressable>
              </View>

              {presets.length === 0 ? (
                <View style={styles.emptyState}>
                  <AppText variant="bodySmall" tone="secondary">
                    Save your active filters to reuse them quickly.
                  </AppText>
                </View>
              ) : (
                <View style={styles.chipRow}>
                  {presets.map((preset) => (
                    <View key={preset.id} style={styles.presetChipWrap}>
                      <Pressable style={styles.chip} onPress={() => onApplyPreset(preset)}>
                        <AppText variant="caption" style={styles.chipLabel}>
                          {preset.name}
                        </AppText>
                      </Pressable>
                      <Pressable style={styles.removePresetButton} onPress={() => void onDeletePreset(preset.id)}>
                        <AppText variant="caption" style={styles.removePresetLabel}>
                          x
                        </AppText>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.filterSection}>
              <AppText variant="caption" tone="muted">
                Price
              </AppText>
              <View style={styles.chipRow}>
                {priceOptions.map((option) => {
                  const active = filters.price === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      style={[styles.chip, active ? styles.chipActive : undefined]}
                      onPress={() => handlePriceChange(option.value)}
                    >
                      <AppText
                        variant="caption"
                        style={active ? styles.chipLabelActive : styles.chipLabel}
                      >
                        {option.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.filterSection}>
              <AppText variant="caption" tone="muted">
                Genre
              </AppText>
              {genreOptions.length === 0 ? (
                <View style={styles.emptyState}>
                  <AppText variant="bodySmall" tone="secondary">
                    Genre options will appear once public listings include genre metadata.
                  </AppText>
                </View>
              ) : (
                <View style={styles.chipRow}>
                  {genreOptions.map((genre) => {
                    const active = filters.genre === genre;
                    return (
                      <Pressable
                        key={genre}
                        style={[styles.chip, active ? styles.chipActive : undefined]}
                        onPress={() => handleGenreToggle(genre)}
                      >
                        <AppText
                          variant="caption"
                          style={active ? styles.chipLabelActive : styles.chipLabel}
                        >
                          {genre}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {helperLabel ? (
              <View style={styles.helperCard}>
                <AppText variant="bodySmall" tone="secondary">
                  {helperLabel}
                </AppText>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.footerButton, styles.clearButton, !hasActiveFilters && styles.clearButtonDisabled]}
              onPress={onClearFilters}
              disabled={!hasActiveFilters}
            >
              <AppText variant="button" tone={hasActiveFilters ? 'secondary' : 'muted'}>
                Clear filters
              </AppText>
            </Pressable>

            <Pressable style={[styles.footerButton, styles.applyButton]} onPress={onClose}>
              <AppText variant="button" style={styles.applyLabel}>
                Apply
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    sheet: {
      maxHeight: '90%',
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    searchBox: {
      minHeight: 52,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    input: {
      flex: 1,
      color: theme.colors.textPrimary,
      ...theme.typography.input,
    },
    scrollContent: {
      gap: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    filterSection: {
      gap: theme.spacing.sm,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    savePresetButton: {
      borderRadius: theme.radius.pill,
      minHeight: 30,
      paddingHorizontal: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    savePresetButtonDisabled: {
      opacity: 0.55,
    },
    savePresetLabel: {
      color: theme.colors.textPrimary,
    },
    presetChipWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    chip: {
      minHeight: 34,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    chipActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    chipLabel: {
      color: theme.colors.textSecondary,
    },
    chipLabelActive: {
      color: theme.colors.textOnAccent,
    },
    removePresetButton: {
      width: 22,
      height: 22,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    removePresetLabel: {
      color: theme.colors.textMuted,
      lineHeight: 12,
    },
    emptyState: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
    },
    helperCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
    },
    footer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    footerButton: {
      flex: 1,
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    clearButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    clearButtonDisabled: {
      opacity: 0.55,
    },
    applyButton: {
      backgroundColor: theme.colors.accent,
    },
    applyLabel: {
      color: theme.colors.textOnAccent,
    },
  });
}
