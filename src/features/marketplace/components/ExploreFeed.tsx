import { LoadingState } from '@/src/components/ui/LoadingState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { useMemo } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  type ExploreFeedItemModel,
  type ExploreFeedTab,
} from '../marketplace.types';
import { useExploreFeed } from '../marketplace.hooks';
import { ExploreFeedItem } from './ExploreFeedItem';

type ExploreFeedProps = {
  activeTab: ExploreFeedTab;
};

export function ExploreFeed({ activeTab }: ExploreFeedProps) {
  const feedQuery = useExploreFeed(activeTab, 24);
  const data = useMemo(() => feedQuery.data ?? [], [feedQuery.data]);
  const { height } = useWindowDimensions();

  if (feedQuery.isLoading) {
    return (
      <View style={styles.state}>
        <LoadingState label="Loading Explore..." />
      </View>
    );
  }

  if (feedQuery.isError) {
    return (
      <View style={styles.state}>
        <ErrorState
          title="Couldn't load Explore"
          message="Please check Firestore access and try again."
          onAction={() => feedQuery.refetch()}
        />
      </View>
    );
  }

  if (activeTab === 'following' && !feedQuery.hasFollowingSupport) {
    return (
      <View style={styles.state}>
        <ErrorState
          title="No followed creators yet"
          message="Following becomes active once creator-follow relationships are connected."
        />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.state}>
        <ErrorState
          title="No public uploads yet"
          message="Explore will fill in as soon as published uploads are available."
        />
      </View>
    );
  }

  return (
    <FlatList<ExploreFeedItemModel>
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
  state: {
    flex: 1,
  },
});
