import { AppText } from '@/src/components/ui/AppText';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { ListingArtwork } from '@/src/features/marketplace/components/ListingArtwork';
import {
  useSellerListings,
  useSellerProfile,
} from '@/src/features/marketplace/marketplace.hooks';
import { formatMarketplacePrice } from '@/src/features/marketplace/marketplace.types';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.lg,
    },
    back: {
      marginBottom: theme.spacing.sm,
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: theme.colors.textPrimary,
    },
    subtitle: {
      marginTop: theme.spacing.xs,
    },
    card: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    cardText: {
      lineHeight: 21,
    },
    listingsSection: {
      gap: theme.spacing.sm,
    },
    listingCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    listingLeading: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    listingArt: {
      width: 52,
      height: 52,
      borderRadius: theme.radius.lg,
      flexShrink: 0,
    },
    listingMeta: {
      flex: 1,
      minWidth: 0,
      gap: theme.spacing.xs,
    },
  });
}

export function ProfileScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const sellerId = typeof id === 'string' ? id : null;
  const profileQuery = useSellerProfile(sellerId);
  const listingsQuery = useSellerListings(sellerId, 8);

  if (profileQuery.isLoading || listingsQuery.isLoading) {
    return (
      <AppShell>
        <LoadingState label="Loading seller profile..." />
      </AppShell>
    );
  }

  if (profileQuery.isError || listingsQuery.isError) {
    return (
      <AppShell>
        <ErrorState
          title="Couldn't load seller profile"
          message="Please check Firestore access and try again."
          onAction={() => {
            profileQuery.refetch();
            listingsQuery.refetch();
          }}
        />
      </AppShell>
    );
  }

  const sellerListings = listingsQuery.data ?? [];
  const fallbackName = sellerListings[0]?.artist ?? 'Creator';
  const profile = profileQuery.data
    ? profileQuery.data
    : sellerId
      ? {
          id: sellerId,
          displayName: fallbackName,
          photoURL: null,
          bio: null,
          role: 'shoouts' as const,
          verificationStatus: 'not_started' as const,
          payoutsEnabled: false,
        }
      : null;

  if (!profile) {
    return (
      <AppShell>
        <View style={styles.content}>
          <View style={styles.scrollContent}>
            <Pressable onPress={() => router.back()}>
              <AppText variant="button" tone="secondary" style={styles.back}>
                Back
              </AppText>
            </Pressable>

            <View style={styles.card}>
              <AppText variant="sectionHeading">Seller not found</AppText>
              <AppText variant="body" tone="secondary" style={styles.cardText}>
                This storefront may have been removed or is unavailable.
              </AppText>
            </View>
          </View>
        </View>
      </AppShell>
    );
  }

  const initials = profile.displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'C';
  const roleLabel = profile.role.replace(/_/g, ' ').toUpperCase();
  const verificationLabel = profile.verificationStatus.replace(/_/g, ' ');

  return (
    <AppShell>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Pressable onPress={() => router.back()}>
          <AppText variant="button" tone="secondary" style={styles.back}>
            Back
          </AppText>
        </Pressable>

        <View style={styles.avatar}>
          <AppText variant="pageHeading" style={styles.avatarText}>
            {initials}
          </AppText>
        </View>

        <View>
          <AppText variant="pageHeading">{profile.displayName}</AppText>
          <AppText variant="bodySmall" tone="secondary" style={styles.subtitle}>
            {roleLabel}
            {profile.payoutsEnabled ? ' - payouts enabled' : ''}
          </AppText>
        </View>

        <View style={styles.card}>
          <AppText variant="sectionHeading">Seller storefront</AppText>
          <AppText variant="bodySmall" tone="secondary" style={styles.cardText}>
            {profile.bio ?? 'This creator has not added a storefront bio yet.'}
          </AppText>
          <AppText variant="caption" tone="muted">
            Verification: {verificationLabel}
          </AppText>
        </View>

        <View style={styles.listingsSection}>
          <AppText variant="sectionHeading">Published listings</AppText>

          {sellerListings.length === 0 ? (
            <View style={styles.card}>
              <AppText variant="bodySmall" tone="secondary" style={styles.cardText}>
                No published listings are available for this seller yet.
              </AppText>
            </View>
          ) : (
            sellerListings.map((listing) => (
              <Pressable
                key={listing.id}
                style={styles.listingCard}
                onPress={() =>
                  router.push({
                    pathname: '/listing/[id]',
                    params: { id: listing.id },
                  } as any)
                }
              >
                <View style={styles.listingLeading}>
                  <ListingArtwork
                    coverUrl={listing.coverUrl}
                    label={listing.genre ?? 'Beat'}
                    style={styles.listingArt}
                  />

                  <View style={styles.listingMeta}>
                    <AppText variant="title" numberOfLines={1}>
                      {listing.title}
                    </AppText>
                    <AppText variant="bodySmall" tone="secondary" numberOfLines={1}>
                      {listing.genre ?? 'Marketplace'}
                    </AppText>
                  </View>
                </View>

                <AppText variant="button" tone="accent">
                  {formatMarketplacePrice(listing)}
                </AppText>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </AppShell>
  );
}
