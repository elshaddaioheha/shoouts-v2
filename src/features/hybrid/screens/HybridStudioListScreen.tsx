import { AppText } from '@/src/components/ui/AppText';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { InterimFeatureSheet } from '@/src/components/ui/InterimFeatureSheet';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { getReadErrorCopy } from '@/src/config/backendStatus';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { useAccountStore } from '@/src/features/account/account.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { publishListing } from '@/src/features/studio/studio.api';
import { useStudioListings } from '@/src/features/studio/studio.hooks';
import type { StudioListing } from '@/src/features/studio/studio.types';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export function HybridStudioListScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const startupStatus = useAuthStore((state) => state.startupStatus);
  const user = useAuthStore((state) => state.user);
  const profile = useAccountStore((state) => state.profile);
  const uid = user?.uid ?? profile?.uid ?? null;
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const { data: listings = [], isLoading, isError, error, refetch } = useStudioListings(uid);

  const drafts = listings.filter((l) => l.lifecycleStatus === 'draft');
  const published = listings.filter((l) => l.lifecycleStatus === 'published');

  async function handlePublish(listing: StudioListing) {
    if (!uid) return;
    setPublishingId(listing.id);
    try {
      await publishListing(uid, listing.id);
      await refetch();
    } catch {
      setNotice({ title: 'Publish failed', message: 'Could not publish listing. Please try again.' });
    } finally {
      setPublishingId(null);
    }
  }

  return (
    <AppShell showBottomBar={false} reserveBottomBarSpace={false}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <AppText variant="eyebrow" tone="muted">Hybrid</AppText>
            <AppText variant="pageHeading">Studio</AppText>
          </View>
          <Pressable
            style={styles.headerAction}
            onPress={() => router.push('/hybrid/vault' as any)}
          >
            <Plus size={22} color={theme.colors.textPrimary} strokeWidth={2.4} />
          </Pressable>
        </View>

        {isLoading ? (
          <LoadingState label="Loading listings..." />
        ) : isError ? (
          <ErrorState
            {...getReadErrorCopy(error, { subject: 'Studio listings', startupStatus })}
            onAction={() => refetch()}
          />
        ) : listings.length === 0 ? (
          <View style={styles.emptyState}>
            <AppText variant="sectionHeading">No listings yet</AppText>
            <AppText variant="body" tone="secondary" style={styles.emptyText}>
              Promote a vault project to create your first Studio listing draft.
            </AppText>
            <Pressable
              style={styles.emptyAction}
              onPress={() => router.push('/hybrid/vault' as any)}
            >
              <AppText variant="button">Go to Vault</AppText>
            </Pressable>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {drafts.length > 0 ? (
              <>
                <AppText variant="eyebrow" tone="muted" style={styles.sectionLabel}>
                  Drafts
                </AppText>
                {drafts.map((listing) => (
                  <ListingRow
                    key={listing.id}
                    listing={listing}
                    onPublish={() => handlePublish(listing)}
                    isPublishing={publishingId === listing.id}
                    styles={styles}
                    theme={theme}
                  />
                ))}
              </>
            ) : null}

            {published.length > 0 ? (
              <>
                <AppText variant="eyebrow" tone="muted" style={styles.sectionLabel}>
                  Published
                </AppText>
                {published.map((listing) => (
                  <ListingRow
                    key={listing.id}
                    listing={listing}
                    styles={styles}
                    theme={theme}
                  />
                ))}
              </>
            ) : null}
          </ScrollView>
        )}
      </View>

      <InterimFeatureSheet
        visible={Boolean(notice)}
        title={notice?.title ?? ''}
        message={notice?.message ?? ''}
        onClose={() => setNotice(null)}
      />
    </AppShell>
  );
}

function ListingRow({
  listing,
  onPublish,
  isPublishing,
  styles,
  theme,
}: {
  listing: StudioListing;
  onPublish?: () => void;
  isPublishing?: boolean;
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof useThemeTokens>;
}) {
  const isDraft = listing.lifecycleStatus === 'draft';
  const price =
    listing.priceInCents <= 0
      ? 'Free'
      : `$${(listing.priceInCents / 100).toFixed(2)}`;

  return (
    <View style={styles.row}>
      <View style={styles.rowArtwork}>
        {listing.coverUrl ? (
          <Image source={{ uri: listing.coverUrl }} style={styles.rowCover} />
        ) : (
          <View style={[styles.rowCover, styles.rowCoverPlaceholder]} />
        )}
      </View>

      <View style={styles.rowMeta}>
        <AppText variant="bodySmall" style={styles.rowTitle} numberOfLines={1}>
          {listing.title}
        </AppText>
        <AppText variant="caption" tone="secondary">{price}</AppText>
        {listing.genre ? (
          <AppText variant="caption" tone="muted" numberOfLines={1}>{listing.genre}</AppText>
        ) : null}
      </View>

      <View style={styles.rowActions}>
        {isDraft && onPublish ? (
          <Pressable
            style={[styles.publishButton, isPublishing && styles.publishButtonDisabled]}
            onPress={onPublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <ActivityIndicator size="small" color={theme.colors.textOnAccent} />
            ) : (
              <AppText variant="caption" style={{ color: theme.colors.textOnAccent }}>
                Publish
              </AppText>
            )}
          </Pressable>
        ) : (
          <View style={styles.liveChip}>
            <AppText variant="caption" tone="accent">Live</AppText>
          </View>
        )}
      </View>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    headerAction: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyState: {
      flex: 1,
      paddingHorizontal: theme.spacing.xxl,
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    emptyText: {
      lineHeight: 21,
    },
    emptyAction: {
      marginTop: theme.spacing.sm,
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    list: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 40,
      gap: theme.spacing.sm,
    },
    sectionLabel: {
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
    },
    rowArtwork: {
      flexShrink: 0,
    },
    rowCover: {
      width: 52,
      height: 52,
      borderRadius: theme.radius.md,
    },
    rowCoverPlaceholder: {
      backgroundColor: theme.colors.surfaceElevated,
    },
    rowMeta: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    rowTitle: {
      fontSize: 15,
      lineHeight: 19,
      color: theme.colors.textPrimary,
    },
    rowActions: {
      flexShrink: 0,
    },
    publishButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 30,
      minWidth: 64,
    },
    publishButtonDisabled: {
      opacity: 0.6,
    },
    liveChip: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 30,
    },
  });
}
