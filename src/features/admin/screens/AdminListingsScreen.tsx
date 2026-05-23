import { AppText } from '@/src/components/ui/AppText';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { subscribeToAdminListings } from '@/src/features/admin/admin.api';
import type { StudioListing, StudioListingLifecycle } from '@/src/features/studio/studio.types';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

const FILTER_TABS: { key: StudioListingLifecycle | 'all'; label: string }[] = [
  { key: 'published', label: 'Published' },
  { key: 'taken_down', label: 'Taken down' },
  { key: 'draft', label: 'Drafts' },
  { key: 'all', label: 'All' },
];

export function AdminListingsScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const [filter, setFilter] = useState<StudioListingLifecycle | 'all'>('published');
  const [listings, setListings] = useState<StudioListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsub = subscribeToAdminListings(
      filter,
      (data) => { setListings(data); setIsLoading(false); },
      () => setIsLoading(false)
    );
    return unsub;
  }, [filter]);

  return (
    <AppShell showBottomBar={false} reserveBottomBarSpace={false}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <AppText variant="button" tone="secondary">Back</AppText>
          </Pressable>
          <AppText variant="eyebrow" tone="accent">Admin</AppText>
          <AppText variant="pageHeading">Listings</AppText>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
          {FILTER_TABS.map((tab) => (
            <Pressable
              key={tab.key}
              style={[styles.filterTab, filter === tab.key && styles.filterTabActive]}
              onPress={() => setFilter(tab.key)}
            >
              <AppText variant="caption" tone={filter === tab.key ? 'primary' : 'secondary'}>
                {tab.label}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>

        {isLoading ? (
          <View style={styles.center}><ActivityIndicator color={theme.colors.accent} /></View>
        ) : listings.length === 0 ? (
          <View style={styles.center}>
            <AppText variant="body" tone="secondary">No listings.</AppText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {listings.map((listing) => (
              <Pressable
                key={listing.id}
                style={styles.listingCard}
                onPress={() =>
                  router.push({
                    pathname: '/admin/listing/[id]',
                    params: { id: listing.id, ownerUid: listing.ownerId },
                  } as any)
                }
              >
                <View style={styles.listingHeader}>
                  <AppText variant="bodySmall" style={styles.listingTitle} numberOfLines={1}>
                    {listing.title}
                  </AppText>
                  <LifecycleBadge status={listing.lifecycleStatus} theme={theme} styles={styles} />
                </View>
                <AppText variant="caption" tone="secondary">
                  {listing.ownerId.slice(0, 12)}… · {listing.genre ?? 'No genre'}
                </AppText>
                <AppText variant="caption" tone="muted">
                  {listing.priceInCents <= 0 ? 'Free' : `$${(listing.priceInCents / 100).toFixed(2)}`}
                  {' · '}{listing.listenCount} plays
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </AppShell>
  );
}

function LifecycleBadge({
  status,
  theme,
  styles,
}: {
  status: string;
  theme: ReturnType<typeof useThemeTokens>;
  styles: ReturnType<typeof createStyles>;
}) {
  const color =
    status === 'published' ? theme.colors.accent
    : status === 'taken_down' ? '#FF4D4D'
    : theme.colors.textMuted;
  return (
    <View style={[styles.badge, { borderColor: color + '44' }]}>
      <AppText variant="caption" style={{ color }}>{status.replace('_', ' ')}</AppText>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    filterScroll: { maxHeight: 44 },
    filterRow: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
    },
    filterTab: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    filterTabActive: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.accent,
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.sm,
    },
    listingCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    listingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    listingTitle: { flex: 1, fontSize: 15, color: theme.colors.textPrimary },
    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      flexShrink: 0,
    },
  });
}
