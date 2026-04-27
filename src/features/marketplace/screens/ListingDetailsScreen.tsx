import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useCartStore } from '@/src/features/cart/cart.store';
import { getMockListingById } from '@/src/features/marketplace/data/mockListings';
import { useThemeTokens } from '@/src/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: 130,
      backgroundColor: theme.colors.background,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xxl,
      backgroundColor: theme.colors.background,
    },
    back: {
      color: theme.colors.textSecondary,
      fontWeight: '800',
      marginBottom: theme.spacing.lg,
    },
    hero: {
      height: 220,
      borderRadius: theme.radius.xxl,
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xl,
    },
    heroText: {
      color: theme.colors.textPrimary,
      fontSize: 32,
      fontWeight: '900',
    },
    eyebrow: {
      ...theme.typography.eyebrow,
      color: theme.colors.accent,
      marginBottom: theme.spacing.sm,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 32,
      fontWeight: '900',
      letterSpacing: -0.8,
    },
    subtitle: {
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    artist: {
      color: theme.colors.textSecondary,
      fontSize: 15,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
      fontWeight: '700',
    },
    metaGrid: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },
    metaCard: {
      flex: 1,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
    },
    metaLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
      marginBottom: theme.spacing.xs,
    },
    metaValue: {
      color: theme.colors.textPrimary,
      fontWeight: '900',
    },
    section: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontWeight: '900',
      fontSize: 16,
      marginBottom: theme.spacing.sm,
    },
    description: {
      color: theme.colors.textSecondary,
      lineHeight: 21,
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },
    tag: {
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.card,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    tagText: {
      color: theme.colors.textSecondary,
      fontWeight: '800',
      fontSize: 12,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    secondaryButton: {
      flex: 1,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
    secondaryText: {
      color: theme.colors.textPrimary,
      fontWeight: '900',
    },
    primaryButton: {
      flex: 1,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.accent,
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
    disabledButton: {
      backgroundColor: theme.colors.card,
    },
    primaryText: {
      color: '#FFFFFF',
      fontWeight: '900',
    },
    buyButton: {
      marginTop: theme.spacing.md,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
    buyText: {
      color: theme.colors.textSecondary,
      fontWeight: '900',
    },
  });
}

export function ListingDetailsScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  const { id } = useLocalSearchParams<{ id: string }>();
  const listing = getMockListingById(String(id));

  const addItem = useCartStore((state) => state.addItem);
  const isInCart = useCartStore((state) => state.isInCart);

  if (!listing) {
    return (
      <AppShell>
        <View style={styles.center}>
          <Text style={styles.title}>Listing not found</Text>
          <Text style={styles.subtitle}>This beat may have been removed or is unavailable.</Text>

          <Pressable style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryText}>Go back</Text>
          </Pressable>
        </View>
      </AppShell>
    );
  }

  const inCart = isInCart(listing.id);

  function handlePreview() {
    Alert.alert('Player coming soon', `Preview playback for ${listing.title} will be added later.`);
  }

  function handleAddToCart() {
    addItem({
      id: listing.id,
      listingId: listing.id,
      title: listing.title,
      artist: listing.artist,
      price: listing.price,
      coverUrl: listing.coverUrl,
    });
  }

  function handleBuyNow() {
    Alert.alert('Checkout coming soon', 'Direct purchase will be connected after payment integration.');
  }

  function handleOpenArtist() {
    router.push({
      pathname: '/profile/[id]',
      params: { id: listing.sellerId },
    } as any);
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>

        <View style={styles.hero}>
          <Text style={styles.heroText}>{listing.genre ?? 'Beat'}</Text>
        </View>

        <Text style={styles.eyebrow}>Marketplace Listing</Text>
        <Text style={styles.title}>{listing.title}</Text>

        <Pressable onPress={handleOpenArtist}>
          <Text style={styles.artist}>by {listing.artist}</Text>
        </Pressable>

        <View style={styles.metaGrid}>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Price</Text>
            <Text style={styles.metaValue}>
              {listing.price <= 0 ? 'Free' : `$${listing.price.toFixed(2)}`}
            </Text>
          </View>

          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>BPM</Text>
            <Text style={styles.metaValue}>{listing.bpm ?? 'N/A'}</Text>
          </View>

          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Key</Text>
            <Text style={styles.metaValue}>{listing.key ?? 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>

        <View style={styles.tagRow}>
          {listing.tags?.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.secondaryButton} onPress={handlePreview}>
            <Text style={styles.secondaryText}>Preview</Text>
          </Pressable>

          <Pressable
            style={[styles.primaryButton, inCart && styles.disabledButton]}
            onPress={handleAddToCart}
            disabled={inCart}
          >
            <Text style={styles.primaryText}>{inCart ? 'Added to cart' : 'Add to cart'}</Text>
          </Pressable>
        </View>

        <Pressable style={styles.buyButton} onPress={handleBuyNow}>
          <Text style={styles.buyText}>
            {listing.price <= 0 ? 'Download later' : 'Buy now'}
          </Text>
        </Pressable>
      </ScrollView>
    </AppShell>
  );
}



