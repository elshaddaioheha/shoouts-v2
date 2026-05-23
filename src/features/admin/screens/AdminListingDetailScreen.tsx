import { AppText } from '@/src/components/ui/AppText';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { restoreListing, takeDownListing } from '@/src/features/admin/admin.api';
import { fetchStudioListings } from '@/src/features/studio/studio.api';
import type { StudioListing } from '@/src/features/studio/studio.types';
import { useThemeTokens } from '@/src/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

export function AdminListingDetailScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const { id, ownerUid } = useLocalSearchParams<{ id: string; ownerUid: string }>();
  const [listing, setListing] = useState<StudioListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerUid) return;
    fetchStudioListings(ownerUid)
      .then((listings) => {
        setListing(listings.find((l) => l.id === id) ?? null);
      })
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, [id, ownerUid]);

  async function handleTakeDown() {
    if (!listing || !ownerUid) return;
    if (!reason.trim()) { setError('Please enter a takedown reason.'); return; }
    setSaving(true);
    setError(null);
    try {
      await takeDownListing(ownerUid, listing.id, reason.trim());
      setListing((prev) => prev ? { ...prev, lifecycleStatus: 'taken_down', isPublic: false } : prev);
    } catch {
      setError('Takedown failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRestore() {
    if (!listing || !ownerUid) return;
    setSaving(true);
    setError(null);
    try {
      await restoreListing(ownerUid, listing.id);
      setListing((prev) => prev ? { ...prev, lifecycleStatus: 'published', isPublic: true } : prev);
    } catch {
      setError('Restore failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AppShell showBottomBar={false} reserveBottomBarSpace={false}>
        <View style={styles.center}><ActivityIndicator color={theme.colors.accent} /></View>
      </AppShell>
    );
  }

  if (!listing) {
    return (
      <AppShell showBottomBar={false} reserveBottomBarSpace={false}>
        <View style={styles.center}>
          <AppText variant="sectionHeading">Listing not found</AppText>
          <Pressable onPress={() => router.back()}>
            <AppText variant="button" tone="secondary">Back</AppText>
          </Pressable>
        </View>
      </AppShell>
    );
  }

  const isTakenDown = listing.lifecycleStatus === 'taken_down';

  return (
    <AppShell showBottomBar={false} reserveBottomBarSpace={false}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()}>
            <AppText variant="button" tone="secondary" style={styles.back}>Back</AppText>
          </Pressable>

          <AppText variant="eyebrow" tone="accent">Listing</AppText>
          <AppText variant="pageHeading" numberOfLines={2}>{listing.title}</AppText>

          <View style={styles.metaCard}>
            <MetaRow label="Owner" value={listing.ownerId} />
            <MetaRow label="Status" value={listing.lifecycleStatus.replace('_', ' ')} />
            <MetaRow label="Public" value={listing.isPublic ? 'Yes' : 'No'} />
            <MetaRow label="Price" value={listing.priceInCents <= 0 ? 'Free' : `$${(listing.priceInCents / 100).toFixed(2)}`} />
            <MetaRow label="Plays" value={String(listing.listenCount)} />
            {listing.genre ? <MetaRow label="Genre" value={listing.genre} /> : null}
            {listing.takenDownReason ? <MetaRow label="Takedown reason" value={listing.takenDownReason} /> : null}
          </View>

          {listing.description ? (
            <View style={styles.descCard}>
              <AppText variant="caption" tone="muted">Description</AppText>
              <AppText variant="body" tone="secondary">{listing.description}</AppText>
            </View>
          ) : null}

          <View style={styles.actions}>
            {isTakenDown ? (
              <Pressable
                style={styles.restoreButton}
                onPress={handleRestore}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={theme.colors.textPrimary} />
                ) : (
                  <AppText variant="button">Restore listing</AppText>
                )}
              </Pressable>
            ) : (
              <>
                <AppText variant="sectionHeading">Take down listing</AppText>
                <AppText variant="caption" tone="muted">
                  Sets status to taken_down and hides from marketplace. Provide a reason for the record.
                </AppText>
                <TextInput
                  style={styles.reasonInput}
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Copyright violation / inappropriate content..."
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                {error ? (
                  <AppText variant="caption" tone="secondary">{error}</AppText>
                ) : null}
                <Pressable
                  style={[styles.takedownButton, saving && { opacity: 0.6 }]}
                  onPress={handleTakeDown}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={theme.colors.textOnAccent} />
                  ) : (
                    <AppText variant="button" style={{ color: theme.colors.textOnAccent }}>
                      Take down listing
                    </AppText>
                  )}
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  const theme = useThemeTokens();
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline' }}>
      <AppText variant="caption" tone="muted" style={{ width: 108, flexShrink: 0 }}>{label}</AppText>
      <AppText variant="caption" style={{ flex: 1, color: theme.colors.textPrimary }} numberOfLines={2}>{value}</AppText>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.md,
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
    back: { marginBottom: theme.spacing.sm },
    metaCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    descCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    actions: { gap: theme.spacing.sm },
    reasonInput: {
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      color: theme.colors.textPrimary,
      fontSize: 14,
      minHeight: 80,
    },
    takedownButton: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: '#FF4D4D',
      alignItems: 'center',
      justifyContent: 'center',
    },
    restoreButton: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
