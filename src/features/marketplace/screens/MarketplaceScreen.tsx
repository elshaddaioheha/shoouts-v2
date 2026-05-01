import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ExploreFeed } from '../components/ExploreFeed';
import { ExploreHeader } from '../components/ExploreHeader';
import { ExploreTabs } from '../components/ExploreTabs';
import { SearchMarketplaceModal } from '../components/SearchMarketplaceModal';
import type { ExploreFeedTab } from '../marketplace.types';

export function MarketplaceScreen() {
  const [activeTab, setActiveTab] = useState<ExploreFeedTab>('forYou');
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <AppShell
      showSwitcher={false}
      reserveBottomBarSpace={false}
      showBottomBarBackdrop={false}
    >
      <View style={styles.container}>
        <ExploreFeed activeTab={activeTab} />
        <ExploreHeader onSearchPress={() => setSearchOpen(true)} />
        <ExploreTabs activeTab={activeTab} onChangeTab={setActiveTab} />

        <SearchMarketplaceModal
          visible={searchOpen}
          onClose={() => setSearchOpen(false)}
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
