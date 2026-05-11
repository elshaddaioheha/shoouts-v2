import { getReadErrorCopy } from '@/src/config/backendStatus';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  type ExploreFeedFilters,
  type ExploreFeedItemModel,
  type ExploreFeedTab,
} from '../marketplace.types';
import { useExploreFeed } from '../marketplace.hooks';
import { MemoExploreFeedItem } from './ExploreFeedItem';

type ExploreFeedProps = {
  activeTab: ExploreFeedTab;
  filters: ExploreFeedFilters;
};

export function ExploreFeed({ activeTab, filters }: ExploreFeedProps) {
  const feedQuery = useExploreFeed(activeTab, 24, filters);
  const startupStatus = useAuthStore((state) => state.startupStatus);
  const data = useMemo(() => feedQuery.data ?? [], [feedQuery.data]);
  const { height } = useWindowDimensions();
  const renderItem = useCallback(
    ({ item }: { item: ExploreFeedItemModel }) => (
      <MemoExploreFeedItem item={item} pageHeight={height} />
    ),
    [height]
  );
  const keyExtractor = useCallback((item: ExploreFeedItemModel) => item.id, []);

  if (feedQuery.isLoading) {
    return (
      <View style={styles.state}>
        <LoadingState label="Loading Explore..." />
      </View>
    );
  }

  if (feedQuery.isError) {
    const errorCopy = getReadErrorCopy(feedQuery.error, {
      subject: 'Explore',
      startupStatus,
    });

    return (
      <View style={styles.state}>
        <ErrorState
          title={errorCopy.title}
          message={errorCopy.message}
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
    const hasActiveFilters =
      filters.query.trim().length > 0 ||
      filters.genre !== null ||
      filters.price !== 'all';

    return (
      <View style={styles.state}>
        <ErrorState
          title={hasActiveFilters ? 'No results for current filters' : 'No public uploads yet'}
          message={
            hasActiveFilters
              ? 'Try clearing query, genre, or price filters to broaden results.'
              : 'Explore will fill in as soon as published uploads are available.'
          }
        />
      </View>
    );
  }

  return (
    <FlatList<ExploreFeedItemModel>
      data={data}
      key={height}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={height}
      decelerationRate="fast"
      windowSize={3}
      initialNumToRender={2}
      maxToRenderPerBatch={2}
      removeClippedSubviews
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
