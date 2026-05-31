import { getReadErrorCopy } from '@/src/config/backendStatus';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { usePlayerStore } from '@/src/features/player/player.store';
import { useThemeTokens } from '@/src/theme';
import { useCallback, useMemo, useRef } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View, type ViewToken } from 'react-native';
import {
  type ExploreFeedFilters,
  type ExploreFeedItemModel,
  type ExploreFeedTab,
} from '../marketplace.types';
import { MARKETPLACE_FEED_LIMIT, useExploreFeed } from '../marketplace.hooks';
import { MemoExploreFeedItem } from './ExploreFeedItem';

type ExploreFeedProps = {
  activeTab: ExploreFeedTab;
  filters: ExploreFeedFilters;
};

export function ExploreFeed({ activeTab, filters }: ExploreFeedProps) {
  const feedQuery = useExploreFeed(activeTab, MARKETPLACE_FEED_LIMIT, filters);
  const startupStatus = useAuthStore((state) => state.startupStatus);
  const data = useMemo(() => feedQuery.data ?? [], [feedQuery.data]);
  const { height } = useWindowDimensions();
  const theme = useThemeTokens();
  const mediaGradient = theme.experience.mediaGradient ?? theme.experience.gradient;
  const loadTrack = usePlayerStore((state) => state.loadTrack);
  const activeTrackId = usePlayerStore((state) => state.track?.id ?? null);
  const requestedPlaying = usePlayerStore((state) => state.requestedPlaying);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;

  // Pre-build the full ordered queue so skip-forward/back in the player follows
  // feed scroll order rather than picking at random.
  const feedQueue = useMemo(
    () =>
      data
        .filter((item) => item.audioUrl)
        .map((item) => ({
          id: item.listingId,
          title: item.title,
          artist: item.artist,
          sellerId: item.sellerId ?? null,
          projectTitle: item.genre ?? 'Marketplace preview',
          audioUrl: item.audioUrl!,
          coverUrl: item.coverUrl ?? null,
          artworkGradient: mediaGradient as readonly [string, string],
          surface: 'marketplace' as const,
        })),
    [data, mediaGradient]
  );

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems.find((v) => v.isViewable);
      if (!first) return;
      const item = first.item as ExploreFeedItemModel;
      if (!item.audioUrl) return;
      const track = {
        id: item.listingId,
        title: item.title,
        artist: item.artist,
        sellerId: item.sellerId ?? null,
        projectTitle: item.genre ?? 'Marketplace preview',
        audioUrl: item.audioUrl,
        coverUrl: item.coverUrl ?? null,
        artworkGradient: mediaGradient as readonly [string, string],
        surface: 'marketplace' as const,
      };
      const startIndex = feedQueue.findIndex((t) => t.id === item.listingId);
      loadTrack(track, {
        autoPlay: true,
        queue: feedQueue,
        startIndex: startIndex >= 0 ? startIndex : undefined,
      });
    },
    [feedQueue, loadTrack, mediaGradient]
  );

  const renderItem = useCallback(
    ({ item }: { item: ExploreFeedItemModel }) => {
      const isActive = activeTrackId === item.listingId;
      return (
        <MemoExploreFeedItem
          item={item}
          pageHeight={height}
          isActive={isActive}
          isPlaying={isActive && requestedPlaying}
        />
      );
    },
    [height, activeTrackId, requestedPlaying]
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
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={handleViewableItemsChanged}
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
