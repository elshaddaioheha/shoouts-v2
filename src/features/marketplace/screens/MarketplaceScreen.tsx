import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ExploreActiveFiltersBar } from '../components/ExploreActiveFiltersBar';
import { ExploreFeed } from '../components/ExploreFeed';
import { ExploreHeader } from '../components/ExploreHeader';
import { MemoExploreTabs } from '../components/ExploreTabs';
import { SearchMarketplaceModal } from '../components/SearchMarketplaceModal';
import { MARKETPLACE_FEED_LIMIT, useMarketplaceListings } from '../marketplace.hooks';
import type {
  ExploreFeedFilters,
  ExploreFeedTab,
  ExploreFilterPreset,
} from '../marketplace.types';

const defaultFilters: ExploreFeedFilters = {
  query: '',
  genre: null,
  price: 'all',
};

const EXPLORE_PRESETS_KEY = 'shoouts.explore.filter-presets.v1';

export function MarketplaceScreen() {
  const [activeTab, setActiveTab] = useState<ExploreFeedTab>('forYou');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filters, setFilters] = useState<ExploreFeedFilters>(defaultFilters);
  const [presets, setPresets] = useState<ExploreFilterPreset[]>([]);
  const listingsQuery = useMarketplaceListings(MARKETPLACE_FEED_LIMIT);
  const genreOptions = useMemo(() => {
    const genres = (listingsQuery.data ?? [])
      .map((listing) => listing.genre?.trim())
      .filter((genre): genre is string => Boolean(genre && genre.length > 0));
    return Array.from(new Set(genres)).sort((a, b) => a.localeCompare(b));
  }, [listingsQuery.data]);

  const filteredCountLabel = useMemo(() => {
    const hasFilters =
      filters.query.trim().length > 0 ||
      filters.genre !== null ||
      filters.price !== 'all';
    if (!hasFilters) return null;

    const pieces: string[] = [];
    if (filters.query.trim().length > 0) pieces.push(`"${filters.query.trim()}"`);
    if (filters.genre) pieces.push(filters.genre);
    if (filters.price !== 'all') pieces.push(filters.price);

    return `Active filters: ${pieces.join(' - ')}`;
  }, [filters]);

  useEffect(() => {
    let mounted = true;

    async function loadPresets() {
      try {
        const raw = await AsyncStorage.getItem(EXPLORE_PRESETS_KEY);
        if (!mounted || !raw) return;
        const parsed = JSON.parse(raw) as ExploreFilterPreset[];
        if (!Array.isArray(parsed)) return;

        const sanitized = parsed
          .filter((item) => item && typeof item === 'object')
          .slice(0, 6)
          .map((item, index) => ({
            id: typeof item.id === 'string' ? item.id : `preset-${index}`,
            name: typeof item.name === 'string' ? item.name : `Preset ${index + 1}`,
            createdAt:
              typeof item.createdAt === 'number' && Number.isFinite(item.createdAt)
                ? item.createdAt
                : Date.now(),
            filters: {
              query: typeof item.filters?.query === 'string' ? item.filters.query : '',
              genre: typeof item.filters?.genre === 'string' ? item.filters.genre : null,
              price:
                item.filters?.price === 'free' ||
                item.filters?.price === 'paid' ||
                item.filters?.price === 'all'
                  ? item.filters.price
                  : 'all',
            },
          }));

        setPresets(sanitized);
      } catch (error) {
        if (__DEV__) console.warn('[marketplace] Failed to load saved filter presets.', error);
      }
    }

    void loadPresets();

    return () => {
      mounted = false;
    };
  }, []);

  async function persistPresets(nextPresets: ExploreFilterPreset[]) {
    setPresets(nextPresets);
    try {
      await AsyncStorage.setItem(EXPLORE_PRESETS_KEY, JSON.stringify(nextPresets));
    } catch (error) {
      if (__DEV__) console.warn('[marketplace] Failed to persist filter presets.', error);
    }
  }

  async function handleSavePreset() {
    const query = filters.query.trim();
    const hasActiveFilters = query.length > 0 || filters.genre !== null || filters.price !== 'all';
    if (!hasActiveFilters) return;

    const nameParts: string[] = [];
    if (query.length > 0) nameParts.push(query);
    if (filters.genre) nameParts.push(filters.genre);
    if (filters.price !== 'all') nameParts.push(filters.price);
    const name = nameParts.join(' - ').slice(0, 34) || 'Custom';

    const nextPreset: ExploreFilterPreset = {
      id: `${Date.now()}`,
      name,
      filters: {
        query: filters.query,
        genre: filters.genre,
        price: filters.price,
      },
      createdAt: Date.now(),
    };

    const nextPresets = [nextPreset, ...presets].slice(0, 6);
    await persistPresets(nextPresets);
  }

  async function handleDeletePreset(presetId: string) {
    const nextPresets = presets.filter((item) => item.id !== presetId);
    await persistPresets(nextPresets);
  }

  const handleChangeTab = useCallback((tab: ExploreFeedTab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  }, []);

  return (
    <AppShell
      showSwitcher={false}
      reserveBottomBarSpace={false}
      showBottomBarBackdrop={false}
      showStartupNotice={false}
    >
      <View style={styles.container}>
        <ExploreFeed activeTab={activeTab} filters={filters} />
        <ExploreHeader onSearchPress={() => setSearchOpen(true)} />
        <MemoExploreTabs activeTab={activeTab} onChangeTab={handleChangeTab} />
        <ExploreActiveFiltersBar
          filters={filters}
          onClearAll={() => setFilters(defaultFilters)}
          onRemoveQuery={() => setFilters((current) => ({ ...current, query: '' }))}
          onRemoveGenre={() => setFilters((current) => ({ ...current, genre: null }))}
          onResetPrice={() => setFilters((current) => ({ ...current, price: 'all' }))}
        />

        <SearchMarketplaceModal
          visible={searchOpen}
          onClose={() => setSearchOpen(false)}
          filters={filters}
          onChangeFilters={setFilters}
          onClearFilters={() => setFilters(defaultFilters)}
          presets={presets}
          onApplyPreset={(preset) => setFilters(preset.filters)}
          onSavePreset={handleSavePreset}
          onDeletePreset={handleDeletePreset}
          genreOptions={genreOptions}
          helperLabel={filteredCountLabel}
        />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
