import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useCartStore } from '@/src/features/cart/cart.store';
import {
  mockMarketplaceListings,
  type MockMarketplaceListing,
} from '@/src/features/marketplace/data/mockListings';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 120,
    },
    eyebrow: {
      color: theme.colors.accent,
      fontSize: 13,
      fontWeight: '800',
      marginBottom: 8,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 32,
      fontWeight: '900',
      letterSpacing: -0.8,
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 8,
      marginBottom: 22,
    },
    grid: {
      gap: 16,
    },
    card: {
      borderRadius: theme.radius.xxl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      overflow: 'hidden',
    },
    artwork: {
      height: 150,
      backgroundColor: theme.colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    artworkText: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontWeight: '900',
    },
    cardBody: {
      padding: 16,
    },
    cardTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '800',
    },
    artist: {
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
      marginBottom: 14,
    },
    meta: {
      color: theme.colors.textMuted,
      fontWeight: '700',
    },
    price: {
      color: theme.colors.accent,
      fontWeight: '900',
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
    },
    secondaryButton: {
      flex: 1,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      paddingVertical: 12,
      alignItems: 'center',
    },
    secondaryText: {
      color: theme.colors.textPrimary,
      fontWeight: '800',
    },
    primaryButton: {
      flex: 1,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.accent,
      paddingVertical: 12,
      alignItems: 'center',
    },
    disabledButton: {
      backgroundColor: theme.colors.card,
    },
    primaryText: {
      color: theme.colors.textPrimary,
      fontWeight: '900',
    },
    buyButton: {
      marginTop: 10,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      paddingVertical: 12,
      alignItems: 'center',
    },
    buyText: {
      color: theme.colors.textSecondary,
      fontWeight: '800',
    },
  });
}

export function MarketplaceScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const addItem = useCartStore((state) => state.addItem);
  const isInCart = useCartStore((state) => state.isInCart);

  function handlePlayPreview(listing: MockMarketplaceListing) {
    Alert.alert('Player coming soon', `Preview playback for ${listing.title} will be added later.`);
  }

  function handleAddToCart(listing: MockMarketplaceListing) {
    addItem({
      id: listing.id,
      listingId: listing.id,
      title: listing.title,
      artist: listing.artist,
      price: listing.price,
      coverUrl: listing.coverUrl,
    });
  }

  function handleBuyNow(listing: MockMarketplaceListing) {
    Alert.alert('Checkout coming soon', `Direct purchase for ${listing.title} will be added later.`);
  }

  function handleOpenListing(listing: MockMarketplaceListing) {
    router.push({
      pathname: '/listing/[id]',
      params: { id: listing.id },
    } as any);
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Shoouts Marketplace</Text>
        <Text style={styles.title}>Discover beats</Text>
        <Text style={styles.subtitle}>
          Stream previews, collect free beats, and purchase premium sounds from Studio creators.
        </Text>

        <View style={styles.grid}>
          {mockMarketplaceListings.map((listing) => {
            const inCart = isInCart(listing.id);

            return (
              <Pressable key={listing.id} style={styles.card} onPress={() => handleOpenListing(listing)}>
                <View style={styles.artwork}>
                  <Text style={styles.artworkText}>{listing.genre ?? 'Beat'}</Text>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{listing.title}</Text>
                  <Text style={styles.artist}>{listing.artist}</Text>

                  <View style={styles.metaRow}>
                    <Text style={styles.meta}>{listing.bpm ? `${listing.bpm} BPM` : 'Audio'}</Text>
                    <Text style={styles.price}>
                      {listing.price <= 0 ? 'Free' : `$${listing.price.toFixed(2)}`}
                    </Text>
                  </View>

                  <View style={styles.actions}>
                    <Pressable
                      style={styles.secondaryButton}
                      onPress={(event) => {
                        event.stopPropagation?.();
                        handlePlayPreview(listing);
                      }}
                    >
                      <Text style={styles.secondaryText}>Preview</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.primaryButton, inCart && styles.disabledButton]}
                      onPress={(event) => {
                        event.stopPropagation?.();
                        handleAddToCart(listing);
                      }}
                      disabled={inCart}
                    >
                      <Text style={styles.primaryText}>{inCart ? 'Added' : 'Add'}</Text>
                    </Pressable>
                  </View>

                  <Pressable
                    style={styles.buyButton}
                    onPress={(event) => {
                      event.stopPropagation?.();
                      handleBuyNow(listing);
                    }}
                  >
                    <Text style={styles.buyText}>{listing.price <= 0 ? 'Download later' : 'Buy now'}</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </AppShell>
  );
}


