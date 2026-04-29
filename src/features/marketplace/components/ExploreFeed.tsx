import { useMemo } from 'react';
import { FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import {
  getExploreItemsByTab,
  type ExploreFeedTab,
  type MockExploreItem,
} from '../data/mockExploreItems';
import { ExploreFeedItem } from './ExploreFeedItem';

type ExploreFeedProps = {
  activeTab: ExploreFeedTab;
};

export function ExploreFeed({ activeTab }: ExploreFeedProps) {
  const data = useMemo(() => getExploreItemsByTab(activeTab), [activeTab]);
  const { height } = useWindowDimensions();

  return (
    <FlatList<MockExploreItem>
      data={data}
      key={height}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ExploreFeedItem item={item} pageHeight={height} />}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={height}
      decelerationRate="fast"
      getItemLayout={(_, index) => ({
        length: height,
        offset: height * index,
        index,
      })}
      style={styles.list}
      bounces={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});
