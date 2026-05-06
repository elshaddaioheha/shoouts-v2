import { InterimFeatureSheet } from '@/src/components/ui/InterimFeatureSheet';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { useCartStore } from '@/src/features/cart/cart.store';
import { ListingArtwork } from '@/src/features/marketplace/components/ListingArtwork';
import {
  useMarketplaceListingDetail,
} from '@/src/features/marketplace/marketplace.hooks';
import { formatMarketplacePrice } from '@/src/features/marketplace/marketplace.types';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type ListingFeatureNotice = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
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
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xl,
    },
    heroContent: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.lg,
    },
    heroText: {
      color: theme.colors.textOnMedia,
      fontSize: 32,
      fontWeight: '900',
      textAlign: 'center',
    },
    heroSubtext: {
      color: theme.colors.textOnMediaMuted,
      fontSize: 13,
      fontWeight: '800',
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
      color: theme.colors.textOnAccent,
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
  const listingId = typeof id === 'string' ? id : null;
  const listingQuery = useMarketplaceListingDetail(listingId);
  const addItem = useCartStore((state) => state.addItem);
  const isInCart = useCartStore((state) => state.isInCart);
  const [featureNotice, setFeatureNotice] = useState<ListingFeatureNotice | null>(null);

  if (listingQuery.isLoading) {
    return (
      <AppShell>
        <LoadingState label="Loading listing..." />
      </AppShell>
    );
  }

  if (listingQuery.isError) {
    return (
      <AppShell>
        <ErrorState
          title="Couldn't load listing"
          message="Please check Firestore access and try again."
          onAction={() => listingQuery.refetch()}
        />
      </AppShell>
    );
  }

  const listing = listingQuery.data;

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

  const listingData = listing;
  const inCart = isInCart(listingData.id);

  function handlePreview() {
    setFeatureNotice({
      title: 'Preview player is next',
      message: `Playback for "${listingData.title}" will be connected in the next phase.`,
    });
  }

  function handleAddToCart() {
    addItem({
      id: listingData.id,
      listingId: listingData.id,
      title: listingData.title,
      artist: listingData.artist,
      price: listingData.price,
      coverUrl: listingData.coverUrl ?? undefined,
    });
  }

  function handleBuyNow() {
    if (listingData.price <= 0) {
      setFeatureNotice({
        title: 'Secure free delivery is next',
        message: 'Free download delivery will be connected with entitlement checks in the next phase.',
        actionLabel: 'Open downloads',
        onAction: () => router.push('/downloads' as any),
      });
      return;
    }

    setFeatureNotice({
      title: 'Checkout is next',
      message: 'Direct purchase will be connected after payment integration is finalized.',
      actionLabel: 'Open cart',
      onAction: () => router.push('/(tabs)/cart' as any),
    });
  }

  function handleOpenArtist() {
    router.push({
      pathname: '/profile/[id]',
      params: { id: listingData.sellerId },
    } as any);
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>

        <ListingArtwork
          coverUrl={listingData.coverUrl}
          label={listingData.genre ?? 'Beat'}
          overlay={Boolean(listingData.coverUrl)}
          style={styles.hero}
        >
          {listingData.coverUrl ? (
            <View style={styles.heroContent}>
              <Text style={styles.heroText}>{listingData.genre ?? 'Beat'}</Text>
              {listingData.listenCount > 0 ? (
                <Text style={styles.heroSubtext}>
                  {listingData.listenCount.toLocaleString()} plays
                </Text>
              ) : null}
            </View>
          ) : null}
        </ListingArtwork>

        <Text style={styles.eyebrow}>Marketplace Listing</Text>
        <Text style={styles.title}>{listingData.title}</Text>

        <Pressable onPress={handleOpenArtist}>
          <Text style={styles.artist}>by {listingData.artist}</Text>
        </Pressable>

        <View style={styles.metaGrid}>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Price</Text>
            <Text style={styles.metaValue}>{formatMarketplacePrice(listingData)}</Text>
          </View>

          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>BPM</Text>
            <Text style={styles.metaValue}>{listingData.bpm ?? 'N/A'}</Text>
          </View>

          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Key</Text>
            <Text style={styles.metaValue}>{listingData.key ?? 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {listingData.description ?? 'No description has been added for this listing yet.'}
          </Text>
        </View>

        {listingData.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {listingData.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

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
            {listingData.price <= 0 ? 'Download later' : 'Buy now'}
          </Text>
        </Pressable>
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
