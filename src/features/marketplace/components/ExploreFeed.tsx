import { useMemo } from 'react';
import { Dimensions, FlatList, StyleSheet } from 'react-native';
import {
  getExploreItemsByTab,
  type ExploreFeedTab,
  type MockExploreItem,
} from '../data/mockExploreItems';
import { ExploreFeedItem } from './ExploreFeedItem';

const { height: windowHeight } = Dimensions.get('window');

type ExploreFeedProps = {
  activeTab: ExploreFeedTab;
};

export function ExploreFeed({ activeTab }: ExploreFeedProps) {
  const data = useMemo(() => getExploreItemsByTab(activeTab), [activeTab]);

  return (
    <FlatList<MockExploreItem>
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ExploreFeedItem item={item} />}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={windowHeight}
      decelerationRate="fast"
      getItemLayout={(_, index) => ({
        length: windowHeight,
        offset: windowHeight * index,
        index,
      })}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});
