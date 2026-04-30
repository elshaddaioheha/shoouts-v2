import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import { useCartStore } from '@/src/features/cart/cart.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

type HomeTrack = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  price: number;
  color: string;
};

const FEATURED_TRACKS: HomeTrack[] = [
  {
    id: 'demo-paid-1',
    title: 'Premium Studio Beat',
    artist: 'Studio Producer',
    genre: 'Trap',
    price: 19.99,
    color: '#8B7355',
  },
  {
    id: 'demo-paid-2',
    title: 'Hybrid Creator Pack',
    artist: 'Hybrid Producer',
    genre: 'R&B',
    price: 29.99,
    color: '#6C6F8F',
  },
  {
    id: 'demo-free-1',
    title: 'Free Demo Beat',
    artist: 'Shoout Producer',
    genre: 'Afrobeats',
    price: 0,
    color: '#6C7E62',
  },
];

const RELEASE_TRACKS: HomeTrack[] = [
  {
    id: 'demo-free-1',
    title: 'Free Demo Beat',
    artist: 'Shoout Producer',
    genre: 'Afrobeats',
    price: 0,
    color: '#5E615D',
  },
  {
    id: 'demo-paid-1',
    title: 'Premium Studio Beat',
    artist: 'Studio Producer',
    genre: 'Trap',
    price: 19.99,
    color: '#685452',
  },
  {
    id: 'demo-paid-2',
    title: 'Hybrid Creator Pack',
    artist: 'Hybrid Producer',
    genre: 'R&B',
    price: 29.99,
    color: '#4D5C70',
  },
];

const FREE_TRACKS = RELEASE_TRACKS.filter((track) => track.price === 0);

const POPULAR_TRACKS: HomeTrack[] = [
  ...FEATURED_TRACKS,
  {
    id: 'demo-paid-3',
    title: 'Night Pulse Kit',
    artist: 'Shoouts Originals',
    genre: 'Amapiano',
    price: 24.99,
    color: '#55585F',
  },
];

export function HomeScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const addItem = useCartStore((state) => state.addItem);
  const isInCart = useCartStore((state) => state.isInCart);

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
    });

    Alert.alert('Added to cart', `${track.title} is now in your cart.`);
  }

  function handlePlay(track: HomeTrack) {
    Alert.alert('Playback next', `Audio player for "${track.title}" lands in the next phase.`);
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

        <SectionHeader title="Featured Picks" actionLabel="Explore" onActionPress={() => router.push('/(tabs)/marketplace' as any)} />
        <FlatList
          data={FEATURED_TRACKS}
          keyExtractor={(item) => `featured-${item.id}`}
          horizontal
          scrollEnabled
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: theme.spacing.md }} />}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <View style={[styles.featuredCard, { backgroundColor: item.color }]}>
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
            </View>
          )}
        />

        <SectionHeader title="Latest Releases" actionLabel="See All" onActionPress={() => router.push('/(tabs)/marketplace' as any)} />
        <FlatList
          data={RELEASE_TRACKS}
          keyExtractor={(item) => `release-${item.id}`}
          horizontal
          scrollEnabled
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: theme.spacing.md }} />}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <Pressable style={styles.releaseCard} onPress={() => openListing(item.id)}>
              <View style={[styles.releaseVisual, { backgroundColor: item.color }]} />
              <AppText variant="title" numberOfLines={1}>
                {item.title}
              </AppText>
              <AppText variant="bodySmall" tone="secondary" numberOfLines={1}>
                {item.genre}
              </AppText>
              <AppText variant="bodySmall" tone="accent">
                {item.price > 0 ? `$${item.price.toFixed(2)}` : 'Free'}
              </AppText>
            </Pressable>
          )}
        />

        <SectionHeader title="Free Music" actionLabel="Browse" onActionPress={() => router.push('/(tabs)/marketplace' as any)} />
        <FlatList
          data={FREE_TRACKS}
          keyExtractor={(item) => `free-${item.id}`}
          horizontal
          scrollEnabled
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: theme.spacing.md }} />}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <View style={styles.freeCard}>
              <Pressable style={styles.freeTapArea} onPress={() => openListing(item.id)}>
                <View style={[styles.freeVisual, { backgroundColor: item.color }]} />
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

        <SectionHeader title="Popular Beats" actionLabel="More" onActionPress={() => router.push('/(tabs)/marketplace' as any)} />
        <View style={styles.popularList}>
          {POPULAR_TRACKS.map((track, index) => {
            const cartId = `${track.id}-basic`;
            const inCart = isInCart(cartId);
            const isLast = index === POPULAR_TRACKS.length - 1;

            return (
              <View key={`popular-${track.id}-${index}`} style={styles.popularRow}>
                <Pressable style={styles.popularTapArea} onPress={() => openListing(track.id)}>
                  <View style={[styles.popularArt, { backgroundColor: track.color }]} />

                  <View style={styles.popularMeta}>
                    <AppText variant="title" numberOfLines={1}>
                      {track.title}
                    </AppText>
                    <AppText variant="bodySmall" tone="secondary" numberOfLines={1}>
                      {track.artist}
                    </AppText>
                    <AppText variant="bodySmall" tone="accent">
                      {track.price > 0 ? `$${track.price.toFixed(2)}` : 'Free'}
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
                    onPress={() =>
                      Alert.alert('Options', `More actions for "${track.title}" will be wired next.`)
                    }
                  >
                    <AppIcon name="more" size="sm" tone="secondary" stroke="medium" />
                  </Pressable>
                </View>

                {!isLast ? <View style={styles.divider} /> : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
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
      color: '#FFFFFF',
    },
    whiteMuted: {
      color: 'rgba(255,255,255,0.82)',
    },
    playButton: {
      alignSelf: 'flex-end',
      width: 38,
      height: 38,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.26)',
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
