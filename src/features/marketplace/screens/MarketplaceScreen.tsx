import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ExploreFeed } from '../components/ExploreFeed';
import { ExploreHeader } from '../components/ExploreHeader';
import { ExploreTabs } from '../components/ExploreTabs';
import { SearchMarketplaceModal } from '../components/SearchMarketplaceModal';
import { useMarketplaceListings } from '../marketplace.hooks';
import type { ExploreFeedFilters, ExploreFeedTab } from '../marketplace.types';

const defaultFilters: ExploreFeedFilters = {
  query: '',
  genre: null,
  price: 'all',
};

export function MarketplaceScreen() {
  const [activeTab, setActiveTab] = useState<ExploreFeedTab>('forYou');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filters, setFilters] = useState<ExploreFeedFilters>(defaultFilters);
  const listingsQuery = useMarketplaceListings(48);
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

  return (
    <AppShell
      showSwitcher={false}
      reserveBottomBarSpace={false}
      showBottomBarBackdrop={false}
    >
      <View style={styles.container}>
        <ExploreFeed activeTab={activeTab} filters={filters} />
        <ExploreHeader onSearchPress={() => setSearchOpen(true)} />
        <ExploreTabs activeTab={activeTab} onChangeTab={setActiveTab} />

        <SearchMarketplaceModal
          visible={searchOpen}
          onClose={() => setSearchOpen(false)}
          filters={filters}
          onChangeFilters={setFilters}
          onClearFilters={() => setFilters(defaultFilters)}
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
