import { AppIcon } from '@/src/components/ui/AppIcon';
import { InterimFeatureSheet } from '@/src/components/ui/InterimFeatureSheet';
import { AppText } from '@/src/components/ui/AppText';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { useCartStore } from '@/src/features/cart/cart.store';
import {
  useMarketplaceListings,
} from '@/src/features/marketplace/marketplace.hooks';
import { ListingArtwork } from '@/src/features/marketplace/components/ListingArtwork';
import {
  formatMarketplacePrice,
  type MarketplaceListing,
} from '@/src/features/marketplace/marketplace.types';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

type HomeTrack = MarketplaceListing & {
  color: string;
};

type HomeFeatureNotice = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

const HOME_CARD_COLORS = ['#8B7355', '#6C6F8F', '#6C7E62', '#5E615D', '#685452', '#4D5C70'];

export function HomeScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const addItem = useCartStore((state) => state.addItem);
  const isInCart = useCartStore((state) => state.isInCart);
  const listingsQuery = useMarketplaceListings(24);
  const tracks = useMemo<HomeTrack[]>(
    () =>
      (listingsQuery.data ?? []).map((listing, index) => ({
        ...listing,
        color: HOME_CARD_COLORS[index % HOME_CARD_COLORS.length],
      })),
    [listingsQuery.data]
  );
  const featuredTracks = useMemo(() => tracks.slice(0, 3), [tracks]);
  const releaseTracks = useMemo(() => tracks.slice(0, 6), [tracks]);
  const freeTracks = useMemo(() => tracks.filter((track) => track.price <= 0).slice(0, 6), [tracks]);
  const popularTracks = useMemo(() => {
    const nextSlice = tracks.slice(1, 5);
    return nextSlice.length > 0 ? nextSlice : tracks.slice(0, 4);
  }, [tracks]);
  const [featureNotice, setFeatureNotice] = useState<HomeFeatureNotice | null>(null);

  function openListing(trackId: string) {
    router.push({
      pathname: '/listing/[id]',
      params: { id: trackId },
    } as any);
  }

  function handleAddToCart(track: HomeTrack) {
    const cartId = `${track.id}-basic`;

    if (isInCart(cartId)) {
      Alert.alert('Already added', `${track.title} is already in your cart.`);
      return;
    }

    addItem({
      id: cartId,
      listingId: track.id,
      title: track.title,
      artist: track.artist,
      price: track.price,
      coverUrl: track.coverUrl ?? undefined,
    });

    Alert.alert('Added to cart', `${track.title} is now in your cart.`);
  }

  function handlePlay(track: HomeTrack) {
    setFeatureNotice({
      title: 'Preview player is next',
      message: `Playback for "${track.title}" will be connected in the next phase.`,
      actionLabel: 'Open listing',
      onAction: () => openListing(track.id),
    });
  }

  function handleTrackOptions(track: HomeTrack) {
    setFeatureNotice({
      title: 'More actions are next',
      message: `Extended actions for "${track.title}" will be connected in the next phase.`,
      actionLabel: 'Open listing',
      onAction: () => openListing(track.id),
    });
  }

  if (listingsQuery.isLoading) {
    return (
      <AppShell>
        <LoadingState label="Loading marketplace picks..." />
      </AppShell>
    );
  }

  if (listingsQuery.isError) {
    return (
      <AppShell>
        <ErrorState
          title="Couldn't load marketplace picks"
          message="Please check Firestore access and try again."
          onAction={() => listingsQuery.refetch()}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <AppText variant="pageHeading">Home</AppText>
          <AppText variant="bodySmall" tone="secondary">
            Curated picks, latest releases, and popular beats.
          </AppText>
        </View>

        {tracks.length === 0 ? (
          <View style={styles.emptyState}>
            <AppText variant="sectionHeading">No listings yet</AppText>
            <AppText variant="bodySmall" tone="secondary">
              Marketplace sections will fill in as soon as published listings are available in Firestore.
            </AppText>
          </View>
        ) : (
          <>
            <SectionHeader
              title="Featured Picks"
              actionLabel="Explore"
              onActionPress={() => router.push('/(tabs)/marketplace' as any)}
            />
            <FlatList
              data={featuredTracks}
              keyExtractor={(item) => `featured-${item.id}`}
              horizontal
              scrollEnabled
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: theme.spacing.md }} />}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <ListingArtwork
                  coverUrl={item.coverUrl}
                  fallbackColor={item.color}
                  overlay={Boolean(item.coverUrl)}
                  style={styles.featuredCard}
                >
                  <Pressable style={styles.featuredTapArea} onPress={() => openListing(item.id)}>
                    <View style={styles.featuredMeta}>
                      <AppText variant="title" style={styles.whiteText} numberOfLines={2}>
                        {item.title}
                      </AppText>
                      <AppText variant="bodySmall" style={styles.whiteMuted} numberOfLines={1}>
                        {item.artist}
                      </AppText>
                    </View>
                  </Pressable>
                  <Pressable style={styles.playButton} onPress={() => handlePlay(item)}>
                    <AppIcon name="play" size="sm" tone="inverse" stroke="bold" />
                  </Pressable>
                </ListingArtwork>
              )}
            />

            <SectionHeader
              title="Latest Releases"
              actionLabel="See All"
              onActionPress={() => router.push('/(tabs)/marketplace' as any)}
            />
            <FlatList
              data={releaseTracks}
              keyExtractor={(item) => `release-${item.id}`}
              horizontal
              scrollEnabled
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: theme.spacing.md }} />}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <Pressable style={styles.releaseCard} onPress={() => openListing(item.id)}>
                  <ListingArtwork
                    coverUrl={item.coverUrl}
                    fallbackColor={item.color}
                    label={item.genre ?? 'Beat'}
                    style={styles.releaseVisual}
                  />
                  <AppText variant="title" numberOfLines={1}>
                    {item.title}
                  </AppText>
                  <AppText variant="bodySmall" tone="secondary" numberOfLines={1}>
                    {item.genre ?? 'Marketplace'}
                  </AppText>
                  <AppText variant="bodySmall" tone="accent">
                    {formatMarketplacePrice(item)}
                  </AppText>
                </Pressable>
              )}
            />

            <SectionHeader
              title="Free Music"
              actionLabel="Browse"
              onActionPress={() => router.push('/(tabs)/marketplace' as any)}
            />
            <FlatList
              data={freeTracks}
              keyExtractor={(item) => `free-${item.id}`}
              horizontal
              scrollEnabled
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: theme.spacing.md }} />}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <View style={styles.freeCard}>
                  <Pressable style={styles.freeTapArea} onPress={() => openListing(item.id)}>
                    <ListingArtwork
                      coverUrl={item.coverUrl}
                      fallbackColor={item.color}
                      label={item.genre ?? 'Free'}
                      style={styles.freeVisual}
                    />
                    <AppText variant="title" numberOfLines={1}>
                      {item.title}
                    </AppText>
                    <AppText variant="bodySmall" tone="secondary" numberOfLines={1}>
                      {item.artist}
                    </AppText>
                  </Pressable>
                  <Pressable style={styles.inlineIconButton} onPress={() => handleAddToCart(item)}>
                    <AppIcon name="cart" size="sm" tone="accent" stroke="medium" />
                  </Pressable>
                </View>
              )}
            />

            <SectionHeader
              title="Popular Beats"
              actionLabel="More"
              onActionPress={() => router.push('/(tabs)/marketplace' as any)}
            />
            <View style={styles.popularList}>
              {popularTracks.map((track, index) => {
                const cartId = `${track.id}-basic`;
                const inCart = isInCart(cartId);
                const isLast = index === popularTracks.length - 1;

                return (
                  <View key={`popular-${track.id}-${index}`} style={styles.popularRow}>
                    <Pressable style={styles.popularTapArea} onPress={() => openListing(track.id)}>
                      <ListingArtwork
                        coverUrl={track.coverUrl}
                        fallbackColor={track.color}
                        label={track.genre ?? 'Beat'}
                        style={styles.popularArt}
                      />

                      <View style={styles.popularMeta}>
                        <AppText variant="title" numberOfLines={1}>
                          {track.title}
                        </AppText>
                        <AppText variant="bodySmall" tone="secondary" numberOfLines={1}>
                          {track.artist}
                        </AppText>
                        <AppText variant="bodySmall" tone="accent">
                          {formatMarketplacePrice(track)}
                        </AppText>
                      </View>
                    </Pressable>

                    <View style={styles.rowActions}>
                      <Pressable style={styles.rowIconButton} onPress={() => handleAddToCart(track)}>
                        <AppIcon
                          name="cart"
                          size="sm"
                          tone={inCart ? 'success' : 'secondary'}
                          stroke="medium"
                        />
                      </Pressable>
                      <Pressable
                        style={styles.rowIconButton}
                        onPress={() => handleTrackOptions(track)}
                      >
                        <AppIcon name="more" size="sm" tone="secondary" stroke="medium" />
                      </Pressable>
                    </View>

                    {!isLast ? <View style={styles.divider} /> : null}
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <InterimFeatureSheet
        visible={Boolean(featureNotice)}
        title={featureNotice?.title ?? ''}
        message={featureNotice?.message ?? ''}
        primaryLabel={featureNotice?.actionLabel}
        onPrimaryPress={() => {
          const action = featureNotice?.onAction;
          setFeatureNotice(null);
          action?.();
        }}
        onClose={() => setFeatureNotice(null)}
      />
    </AppShell>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onActionPress,
}: {
  title: string;
  actionLabel: string;
  onActionPress: () => void;
}) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  return (
    <View style={styles.sectionHeader}>
      <AppText variant="sectionHeading">{title}</AppText>
      <Pressable onPress={onActionPress}>
        <AppText variant="bodySmall" tone="accent">
          {actionLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.lg,
    },
    hero: {
      gap: theme.spacing.xs,
      paddingTop: theme.spacing.md,
    },
    emptyState: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
    },
    horizontalList: {
      paddingVertical: theme.spacing.xs,
    },
    featuredCard: {
      width: 248,
      minHeight: 180,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
    },
    featuredMeta: {
      gap: theme.spacing.xs,
      maxWidth: '86%',
    },
    featuredTapArea: {
      flex: 1,
    },
    whiteText: {
      color: theme.colors.textOnMedia,
    },
    whiteMuted: {
      color: theme.colors.textOnMediaMuted,
    },
    playButton: {
      alignSelf: 'flex-end',
      width: 38,
      height: 38,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.overlay,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
    },
    releaseCard: {
      width: 160,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    releaseVisual: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: theme.radius.md,
    },
    freeCard: {
      width: 164,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    freeVisual: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: theme.radius.md,
    },
    freeTapArea: {
      gap: theme.spacing.xs,
    },
    inlineIconButton: {
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignSelf: 'flex-end',
    },
    popularList: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    popularRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
      position: 'relative',
    },
    popularTapArea: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      minWidth: 0,
    },
    popularArt: {
      width: 56,
      height: 56,
      borderRadius: theme.radius.md,
      flexShrink: 0,
    },
    popularMeta: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    rowActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    rowIconButton: {
      width: 34,
      height: 34,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    divider: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },
  });
}
