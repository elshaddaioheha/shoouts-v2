import { AppText } from '@/src/components/ui/AppText';
import { InterimFeatureSheet } from '@/src/components/ui/InterimFeatureSheet';
import { getReadErrorCopy } from '@/src/config/backendStatus';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { useCartStore } from '@/src/features/cart/cart.store';
import { can } from '@/src/features/access/access.helpers';
import { useAccountStore } from '@/src/features/account/account.store';
import { createThread, findExistingThread } from '@/src/features/chat/chat.api';
import { ComposeThreadModal } from '@/src/features/chat/components/ComposeThreadModal';
import { ReportListingSheet } from '@/src/features/marketplace/components/ReportListingSheet';
import { ListingArtwork } from '@/src/features/marketplace/components/ListingArtwork';
import { useMarketplaceListingDetail } from '@/src/features/marketplace/marketplace.hooks';
import { formatMarketplacePrice } from '@/src/features/marketplace/marketplace.types';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { usePlayerStore } from '@/src/features/player/player.store';
import { useThemeTokens } from '@/src/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

type ListingFeatureNotice = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ListingDetailsScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const startupStatus = useAuthStore((state) => state.startupStatus);
  const { id } = useLocalSearchParams<{ id: string }>();
  const listingId = typeof id === 'string' ? id : null;
  const listingQuery = useMarketplaceListingDetail(listingId);
  const addItem = useCartStore((state) => state.addItem);
  const isInCart = useCartStore((state) => state.isInCart);
  const loadTrack = usePlayerStore((state) => state.loadTrack);
  const user = useAuthStore((state) => state.user);
  const role = useAccountStore((state) => state.role);
  const [featureNotice, setFeatureNotice] = useState<ListingFeatureNotice | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showReport, setShowReport] = useState(false);

  if (listingQuery.isLoading) {
    return (
      <AppShell>
        <LoadingState label="Loading listing..." />
      </AppShell>
    );
  }

  if (listingQuery.isError) {
    const errorCopy = getReadErrorCopy(listingQuery.error, {
      subject: 'Listing',
      startupStatus,
    });

    return (
      <AppShell>
        <ErrorState
          title={errorCopy.title}
          message={errorCopy.message}
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
          <AppText variant="pageHeading">Listing not found</AppText>
          <AppText variant="body" tone="secondary" style={styles.notFoundSubtitle}>
            This listing may have been removed or is unavailable.
          </AppText>
          <Pressable style={styles.primaryButton} onPress={() => router.back()}>
            <AppText variant="button" style={styles.onAccentText}>Go back</AppText>
          </Pressable>
        </View>
      </AppShell>
    );
  }

  const listingData = listing;
  const inCart = isInCart(listingData.id);

  function handlePreview() {
    if (listingData.audioUrl) {
      loadTrack({
        id: listingData.id,
        title: listingData.title,
        artist: listingData.artist,
        sellerId: listingData.sellerId,
        projectTitle: listingData.genre ?? 'Marketplace preview',
        audioUrl: listingData.audioUrl,
        coverUrl: listingData.coverUrl,
        artworkGradient: theme.experience.mediaGradient ?? theme.experience.gradient,
        surface: 'marketplace',
      });
      return;
    }

    setFeatureNotice({
      title: 'Preview unavailable',
      message: `"${listingData.title}" does not have preview audio attached yet.`,
    });
  }

  function handleAddToCart() {
    addItem({
      id: listingData.id,
      listingId: listingData.id,
      title: listingData.title,
      artist: listingData.artist,
      price: listingData.price,
      currency: listingData.currency,
      accessType: listingData.price <= 0 ? 'free' : 'paid',
      checkoutState: 'review_only',
      coverUrl: listingData.coverUrl ?? undefined,
    });
  }

  function handleBuyNow() {
    if (listingData.price <= 0) {
      // Add to cart first if not already there, then go straight to checkout.
      if (!inCart) {
        addItem({
          id: listingData.id,
          listingId: listingData.id,
          title: listingData.title,
          artist: listingData.artist,
          price: listingData.price,
          currency: listingData.currency,
          accessType: 'free',
          checkoutState: 'review_only',
          coverUrl: listingData.coverUrl ?? undefined,
        });
      }
      router.push('/checkout' as any);
      return;
    }

    router.push('/(tabs)/cart' as any);
  }

  async function handleMessageSeller() {
    if (!user) {
      setFeatureNotice({
        title: 'Sign in to message',
        message: 'You need an account to contact sellers.',
        actionLabel: 'Go to login',
        onAction: () => router.push('/(auth)/login' as any),
      });
      return;
    }
    if (!listing) return;
    const existing = await findExistingThread(user.uid, listing.id);
    if (existing) {
      router.push({ pathname: '/messages/[threadId]', params: { threadId: existing } } as any);
    } else {
      setShowCompose(true);
    }
  }

  async function handleSendFirstMessage(text: string) {
    if (!user || !listing) return;
    const threadId = await createThread({
      buyerId: user.uid,
      sellerId: listing.sellerId,
      listingId: listing.id,
      listingTitle: listing.title,
      listingCoverUrl: listing.coverUrl ?? null,
      firstMessage: text,
    });
    setShowCompose(false);
    router.push({ pathname: '/messages/[threadId]', params: { threadId } } as any);
  }

  function handleOpenArtist() {
    if (!listingData.sellerId || listingData.sellerId.startsWith('unknown-seller:')) {
      setFeatureNotice({
        title: 'Seller profile unavailable',
        message: 'This listing is public, but the seller profile id is missing in source metadata.',
      });
      return;
    }

    router.push({
      pathname: '/profile/[id]',
      params: { id: listingData.sellerId },
    } as any);
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()}>
          <AppText variant="button" tone="secondary" style={styles.back}>Back</AppText>
        </Pressable>

        <ListingArtwork
          coverUrl={listingData.coverUrl}
          label={listingData.genre ?? 'Track'}
          overlay={Boolean(listingData.coverUrl)}
          style={styles.hero}
        >
          {listingData.coverUrl ? (
            <View style={styles.heroContent}>
              <AppText variant="pageHeading" style={styles.heroText}>
                {listingData.genre ?? 'Track'}
              </AppText>
              {listingData.listenCount > 0 ? (
                <AppText variant="caption" style={styles.heroSubtext}>
                  {listingData.listenCount.toLocaleString()} plays
                </AppText>
              ) : null}
            </View>
          ) : null}
        </ListingArtwork>

        <AppText variant="eyebrow" tone="accent">Marketplace Listing</AppText>
        <AppText variant="pageHeading">{listingData.title}</AppText>

        <Pressable onPress={handleOpenArtist}>
          <AppText variant="body" tone="secondary" style={styles.artist}>
            by {listingData.artist}
          </AppText>
        </Pressable>

        <View style={styles.metaGrid}>
          <View style={styles.metaCard}>
            <AppText variant="caption" tone="muted">Price</AppText>
            <AppText variant="sectionHeading">{formatMarketplacePrice(listingData)}</AppText>
          </View>
          <View style={styles.metaCard}>
            <AppText variant="caption" tone="muted">BPM</AppText>
            <AppText variant="sectionHeading">{listingData.bpm ?? 'N/A'}</AppText>
          </View>
          <View style={styles.metaCard}>
            <AppText variant="caption" tone="muted">Key</AppText>
            <AppText variant="sectionHeading">{listingData.key ?? 'N/A'}</AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="sectionHeading" style={styles.sectionTitle}>Description</AppText>
          <AppText variant="body" tone="secondary" style={styles.description}>
            {listingData.description ?? 'No description has been added for this listing yet.'}
          </AppText>
        </View>

        {listingData.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {listingData.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <AppText variant="caption" tone="secondary">{tag}</AppText>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.actions}>
          <Pressable style={styles.secondaryButton} onPress={handlePreview}>
            <AppText variant="button">Preview</AppText>
          </Pressable>

          <Pressable
            style={[styles.primaryButton, inCart && styles.disabledButton]}
            onPress={handleAddToCart}
            disabled={inCart}
          >
            <AppText variant="button" style={styles.onAccentText}>
              {inCart ? 'Added to cart' : 'Add to cart'}
            </AppText>
          </Pressable>
        </View>

        <Pressable style={styles.buyButton} onPress={handleBuyNow}>
          <AppText variant="button" tone="secondary">
            {listingData.price <= 0 ? 'Get free track' : 'Review purchase'}
          </AppText>
        </Pressable>

        {can(role, 'chat.buyer') && user?.uid !== listingData.sellerId ? (
          <Pressable style={styles.messageButton} onPress={handleMessageSeller}>
            <AppText variant="button" tone="accent">Message seller</AppText>
          </Pressable>
        ) : null}

        {user ? (
          <Pressable style={styles.reportButton} onPress={() => setShowReport(true)}>
            <AppText variant="caption" tone="muted">Report listing</AppText>
          </Pressable>
        ) : null}
      </ScrollView>

      <ComposeThreadModal
        visible={showCompose}
        listingTitle={listingData.title}
        onSend={handleSendFirstMessage}
        onClose={() => setShowCompose(false)}
      />

      {user ? (
        <ReportListingSheet
          visible={showReport}
          listingId={listingData.id}
          listingTitle={listingData.title}
          sellerId={listingData.sellerId}
          reportedBy={user.uid}
          onClose={() => setShowReport(false)}
          onSent={() => {
            setShowReport(false);
            setFeatureNotice({
              title: 'Report submitted',
              message: 'Thank you. Our team will review this listing.',
            });
          }}
        />
      ) : null}

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

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      backgroundColor: theme.colors.background,
      gap: theme.spacing.sm,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xxl,
      backgroundColor: theme.colors.background,
      gap: theme.spacing.md,
    },
    back: {
      marginBottom: theme.spacing.sm,
    },
    notFoundSubtitle: {
      lineHeight: 22,
    },
    hero: {
      height: 220,
      borderRadius: theme.radius.xxl,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    heroContent: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.lg,
    },
    heroText: {
      color: theme.colors.textOnMedia,
      textAlign: 'center',
    },
    heroSubtext: {
      color: theme.colors.textOnMediaMuted,
    },
    artist: {
      marginBottom: theme.spacing.sm,
    },
    metaGrid: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginVertical: theme.spacing.sm,
    },
    metaCard: {
      flex: 1,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    section: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    sectionTitle: {
      marginBottom: theme.spacing.xs,
    },
    description: {
      lineHeight: 21,
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginVertical: theme.spacing.sm,
    },
    tag: {
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.card,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    secondaryButton: {
      flex: 1,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
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
    onAccentText: {
      color: theme.colors.textOnAccent,
    },
    buyButton: {
      marginTop: theme.spacing.xs,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
    messageButton: {
      marginTop: theme.spacing.xs,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    reportButton: {
      marginTop: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
    },
  });
}
