import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useCartStore } from '@/src/features/cart/cart.store';
import {
  mockMarketplaceListings,
  type MockMarketplaceListing,
} from '@/src/features/marketplace/data/mockListings';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export function MarketplaceScreen() {
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
              <View key={listing.id} style={styles.card}>
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
                    <Pressable style={styles.secondaryButton} onPress={() => handlePlayPreview(listing)}>
                      <Text style={styles.secondaryText}>Preview</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.primaryButton, inCart && styles.disabledButton]}
                      onPress={() => handleAddToCart(listing)}
                      disabled={inCart}
                    >
                      <Text style={styles.primaryText}>{inCart ? 'Added' : 'Add'}</Text>
                    </Pressable>
                  </View>

                  <Pressable style={styles.buyButton} onPress={() => handleBuyNow(listing)}>
                    <Text style={styles.buyText}>{listing.price <= 0 ? 'Download later' : 'Buy now'}</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 120,
  },
  eyebrow: {
    color: '#EC5C39',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 22,
  },
  grid: {
    gap: 16,
  },
  card: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  artwork: {
    height: 150,
    backgroundColor: 'rgba(236,92,57,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  artist: {
    color: 'rgba(255,255,255,0.62)',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 14,
  },
  meta: {
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '700',
  },
  price: {
    color: '#EC5C39',
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#EC5C39',
    paddingVertical: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  buyButton: {
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  buyText: {
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '800',
  },
});
