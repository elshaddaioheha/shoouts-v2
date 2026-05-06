import { AppText } from '@/src/components/ui/AppText';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { ListingArtwork } from '@/src/features/marketplace/components/ListingArtwork';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useUserPurchases } from '@/src/features/downloads/downloads.hooks';
import { formatLibraryPrice } from '@/src/features/downloads/downloads.types';

export function PurchasesScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const user = useAuthStore((state) => state.user);
  const purchasesQuery = useUserPurchases(user?.uid ?? null, 40);

  if (!user) {
    return (
      <AppShell>
        <View style={styles.centered}>
          <View style={styles.card}>
            <AppText variant="sectionHeading">Sign in to view purchases</AppText>
            <AppText variant="bodySmall" tone="secondary" style={styles.copy}>
              Purchase history syncs with your account.
            </AppText>
            <Pressable style={styles.primaryButton} onPress={() => router.replace('/(auth)/login' as any)}>
              <AppText variant="button" style={styles.primaryButtonText}>
                Go to login
              </AppText>
            </Pressable>
          </View>
        </View>
      </AppShell>
    );
  }

  if (purchasesQuery.isLoading) {
    return (
      <AppShell>
        <LoadingState label="Loading purchase history..." />
      </AppShell>
    );
  }

  if (purchasesQuery.isError) {
    return (
      <AppShell>
        <ErrorState
          title="Couldn't load purchases"
          message="Please check Firestore access and try again."
          onAction={() => purchasesQuery.refetch()}
        />
      </AppShell>
    );
  }

  const purchases = purchasesQuery.data ?? [];

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <AppText variant="button" tone="secondary">
            Back
          </AppText>
        </Pressable>

        <AppText variant="eyebrow" tone="accent">
          Purchases
        </AppText>
        <AppText variant="pageHeading">Purchase history</AppText>
        <AppText variant="bodySmall" tone="secondary">
          Your most recent transactions and listing access state.
        </AppText>

        {purchases.length === 0 ? (
          <View style={styles.card}>
            <AppText variant="sectionHeading">No purchases yet</AppText>
            <AppText variant="bodySmall" tone="secondary" style={styles.copy}>
              Once checkout is connected, completed purchases will show here automatically.
            </AppText>
            <Pressable style={styles.secondaryButton} onPress={() => router.push('/(tabs)/marketplace' as any)}>
              <AppText variant="button">Browse Explore</AppText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {purchases.map((purchase) => (
              <View key={purchase.id} style={styles.itemCard}>
                <View style={styles.itemLeading}>
                  <ListingArtwork coverUrl={purchase.coverUrl} label="Purchase" style={styles.artwork} />
                  <View style={styles.itemMeta}>
                    <AppText variant="title" numberOfLines={1}>
                      {purchase.title}
                    </AppText>
                    <AppText variant="bodySmall" tone="secondary" numberOfLines={1}>
                      {purchase.artist}
                    </AppText>
                    <AppText variant="caption" tone="muted">
                      {formatDate(purchase.purchasedAt)} - {formatStatus(purchase.status)}
                    </AppText>
                  </View>
                </View>
                <View style={styles.itemActions}>
                  <AppText variant="button" tone="accent">
                    {formatLibraryPrice(purchase)}
                  </AppText>
                  <Pressable
                    style={styles.inlineButton}
                    onPress={() =>
                      router.push({
                        pathname: '/listing/[id]',
                        params: { id: purchase.listingId },
                      } as any)
                    }
                  >
                    <AppText variant="button">Open</AppText>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </AppShell>
  );
}

function formatStatus(status: 'available' | 'processing' | 'restricted') {
  if (status === 'processing') return 'Processing';
  if (status === 'restricted') return 'Restricted';
  return 'Available';
}

function formatDate(value: string | null) {
  if (!value) return 'Date pending';
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return 'Date pending';
  return new Date(parsed).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    centered: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      backgroundColor: theme.colors.background,
      gap: theme.spacing.md,
    },
    backButton: {
      alignSelf: 'flex-start',
      minHeight: 34,
      justifyContent: 'center',
    },
    card: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    copy: {
      lineHeight: 20,
    },
    list: {
      gap: theme.spacing.md,
    },
    itemCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    },
    itemLeading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    artwork: {
      width: 52,
      height: 52,
      borderRadius: theme.radius.lg,
      flexShrink: 0,
    },
    itemMeta: {
      flex: 1,
      minWidth: 0,
      gap: theme.spacing.xs,
    },
    itemActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    primaryButton: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    primaryButtonText: {
      color: theme.colors.textOnAccent,
    },
    secondaryButton: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    inlineButton: {
      minHeight: 34,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
    },
  });
}
