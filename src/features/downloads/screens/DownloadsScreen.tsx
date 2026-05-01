import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useUserPurchases } from '../downloads.hooks';
import { formatLibraryPrice } from '../downloads.types';

export function DownloadsScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const user = useAuthStore((state) => state.user);
  const purchasesQuery = useUserPurchases(user?.uid ?? null, 24);

  if (!user) {
    return (
      <AppShell>
        <View style={styles.centered}>
          <View style={styles.emptyCard}>
            <AppText variant="sectionHeading">Sign in to view your library</AppText>
            <AppText variant="bodySmall" tone="secondary" style={styles.emptyCopy}>
              Your purchased and free-access downloads will show up here after login.
            </AppText>
            <Pressable
              style={styles.primaryButton}
              onPress={() => router.replace('/(auth)/login' as any)}
            >
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
        <LoadingState label="Loading your library..." />
      </AppShell>
    );
  }

  if (purchasesQuery.isError) {
    return (
      <AppShell>
        <ErrorState
          title="Couldn't load your library"
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
        <AppText variant="eyebrow" tone="accent">
          Downloads
        </AppText>
        <AppText variant="pageHeading">Your library</AppText>
        <AppText variant="bodySmall" tone="secondary" style={styles.subtitle}>
          Purchased and free-access items appear here first. Secure file delivery lands in a later phase.
        </AppText>

        {purchases.length === 0 ? (
          <View style={styles.emptyCard}>
            <AppText variant="sectionHeading">No downloads yet</AppText>
            <AppText variant="bodySmall" tone="secondary" style={styles.emptyCopy}>
              Once purchases are written by the backend, your library will show them here automatically.
            </AppText>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.push('/(tabs)/marketplace' as any)}
            >
              <AppText variant="button">Browse Explore</AppText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {purchases.map((purchase) => (
              <View key={purchase.id} style={styles.itemCard}>
                <View style={styles.itemLeading}>
                  <View style={styles.artwork}>
                    <AppIcon name="downloads" size="sm" tone="accent" stroke="regular" />
                  </View>
                  <View style={styles.itemMeta}>
                    <AppText variant="title" numberOfLines={1}>
                      {purchase.title}
                    </AppText>
                    <AppText variant="bodySmall" tone="secondary" numberOfLines={1}>
                      {purchase.artist}
                    </AppText>
                    <AppText variant="caption" tone="muted">
                      {formatStatusLabel(purchase.status)} - {formatLibraryPrice(purchase)}
                    </AppText>
                  </View>
                </View>

                <View style={styles.itemActions}>
                  <AppText variant="caption" tone="accent">
                    {purchase.accessType === 'free' ? 'Free access' : 'Purchased'}
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
                    <AppText variant="button">View item</AppText>
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

function formatStatusLabel(status: 'available' | 'processing' | 'restricted') {
  if (status === 'processing') return 'Processing';
  if (status === 'restricted') return 'Restricted';
  return 'Available';
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
      paddingBottom: 120,
      backgroundColor: theme.colors.background,
      gap: theme.spacing.lg,
    },
    subtitle: {
      marginTop: -theme.spacing.sm,
    },
    emptyCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    emptyCopy: {
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
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    itemMeta: {
      flex: 1,
      minWidth: 0,
      gap: theme.spacing.xs,
    },
    itemActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      flexWrap: 'wrap',
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
      minHeight: 36,
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
