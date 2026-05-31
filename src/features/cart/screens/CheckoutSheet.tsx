import { AppText } from '@/src/components/ui/AppText';
import { InterimFeatureSheet } from '@/src/components/ui/InterimFeatureSheet';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { useCartStore } from '@/src/features/cart/cart.store';
import { formatCartPrice, formatCartTotal } from '@/src/features/cart/cart.types';
import { claimFreeItems } from '@/src/features/downloads/downloads.api';
import { useLibraryStore } from '@/src/features/library/library.store';
import { ListingArtwork } from '@/src/features/marketplace/components/ListingArtwork';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CartItem } from '../cart.types';

type SheetState = 'idle' | 'claiming' | 'claimed';

export function CheckoutSheet() {
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top, insets.bottom);
  const uid = useAuthStore((state) => state.user?.uid ?? null);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const addLibraryItem = useLibraryStore((state) => state.addItem);
  const [sheetState, setSheetState] = useState<SheetState>('idle');
  const [claimedCount, setClaimedCount] = useState(0);
  const [hadPaidOnClaim, setHadPaidOnClaim] = useState(false);
  const [showPaymentNotice, setShowPaymentNotice] = useState(false);

  const freeItems = items.filter((item) => item.price <= 0);
  const paidItems = items.filter((item) => item.price > 0);
  const hasFree = freeItems.length > 0;
  const hasPaid = paidItems.length > 0;

  async function handleClaimFree() {
    setSheetState('claiming');
    const now = Date.now();
    const count = freeItems.length;
    const paidRemaining = paidItems.length > 0;

    // Write entitlements to Firestore so they persist across devices.
    // Falls back gracefully — local store is still written either way.
    if (uid) {
      try {
        await claimFreeItems(
          uid,
          freeItems.map((item) => ({
            listingId: item.listingId,
            title: item.title,
            artist: item.artist,
            currency: item.currency,
            coverUrl: item.coverUrl ?? null,
          }))
        );
      } catch {
        // Non-fatal: local library write below still gives the user access
        // on this device even if the Firestore write fails.
      }
    }

    for (const item of freeItems) {
      addLibraryItem({
        id: item.id,
        listingId: item.listingId,
        title: item.title,
        artist: item.artist,
        price: item.price,
        currency: item.currency,
        accessType: 'free',
        coverUrl: item.coverUrl,
        claimedAtMs: now,
        deliveryStatus: 'local_only',
      });
      removeItem(item.id);
    }

    setClaimedCount(count);
    setHadPaidOnClaim(paidRemaining);
    setSheetState('claimed');
  }

  if (sheetState === 'claimed') {
    return (
      <View style={styles.container}>
        <View style={styles.successWrap}>
          <View style={styles.successCircle}>
            <AppText variant="sectionHeading" style={styles.successEmoji}>✓</AppText>
          </View>
          <AppText variant="pageHeading" style={styles.successHeading}>
            {claimedCount === 1 ? '1 track claimed' : `${claimedCount} tracks claimed`}
          </AppText>
          <AppText variant="body" tone="secondary" style={styles.successBody}>
            {hadPaidOnClaim
              ? 'Your free tracks are saved to your library. Paid items remain in your cart.'
              : 'Your free tracks are now saved to your library.'}
          </AppText>
          <Pressable style={styles.primaryButton} onPress={() => router.back()}>
            <AppText variant="button" style={styles.primaryButtonText}>Done</AppText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="eyebrow" tone="accent">Checkout</AppText>
          <AppText variant="pageHeading">Order summary</AppText>
        </View>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <X size={22} color={theme.colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {hasFree ? (
          <View style={styles.section}>
            <AppText variant="caption" tone="muted" style={styles.sectionLabel}>
              Free tracks · {formatCartTotal(freeItems)}
            </AppText>
            {freeItems.map((item) => (
              <CheckoutItemRow key={item.id} item={item} theme={theme} />
            ))}
          </View>
        ) : null}

        {hasPaid ? (
          <View style={styles.section}>
            <AppText variant="caption" tone="muted" style={styles.sectionLabel}>
              Paid tracks · {formatCartTotal(paidItems)}
            </AppText>
            {paidItems.map((item) => (
              <CheckoutItemRow key={item.id} item={item} theme={theme} />
            ))}
          </View>
        ) : null}

        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <AppText variant="bodySmall" tone="secondary">Items</AppText>
            <AppText variant="title">{items.length}</AppText>
          </View>
          {hasFree ? (
            <View style={styles.totalRow}>
              <AppText variant="bodySmall" tone="secondary">Free total</AppText>
              <AppText variant="sectionHeading" tone="success">
                {formatCartTotal(freeItems)}
              </AppText>
            </View>
          ) : null}
          {hasPaid ? (
            <View style={styles.totalRow}>
              <AppText variant="bodySmall" tone="secondary">Paid total</AppText>
              <AppText variant="sectionHeading">{formatCartTotal(paidItems)}</AppText>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {hasFree ? (
          <Pressable
            style={[styles.primaryButton, sheetState === 'claiming' && styles.buttonLoading]}
            onPress={handleClaimFree}
            disabled={sheetState === 'claiming'}
          >
            {sheetState === 'claiming' ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <AppText variant="button" style={styles.primaryButtonText}>
                {freeItems.length === 1
                  ? 'Claim 1 free track'
                  : `Claim ${freeItems.length} free tracks`}
              </AppText>
            )}
          </Pressable>
        ) : null}

        {hasPaid ? (
          <Pressable
            style={styles.secondaryButton}
            onPress={() => setShowPaymentNotice(true)}
          >
            <AppText variant="button" tone="accent">
              Complete payment · {formatCartTotal(paidItems)}
            </AppText>
          </Pressable>
        ) : null}

        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <AppText variant="button" tone="secondary">Cancel</AppText>
        </Pressable>
      </View>

      <InterimFeatureSheet
        visible={showPaymentNotice}
        title="Payment integration is next"
        message="Secure payment processing will be connected once the checkout provider and entitlement writes are finalized."
        onClose={() => setShowPaymentNotice(false)}
      />
    </View>
  );
}

function CheckoutItemRow({
  item,
  theme,
}: {
  item: CartItem;
  theme: ReturnType<typeof useThemeTokens>;
}) {
  const styles = useMemo(() => createItemStyles(theme), [theme]);
  return (
    <View style={styles.row}>
      <ListingArtwork coverUrl={item.coverUrl} label="Item" style={styles.art} />
      <View style={styles.meta}>
        <AppText variant="title" numberOfLines={1}>{item.title}</AppText>
        <AppText variant="bodySmall" tone="secondary" numberOfLines={1}>{item.artist}</AppText>
      </View>
      <AppText variant="bodySmall" tone="accent">{formatCartPrice(item)}</AppText>
    </View>
  );
}

function createStyles(
  theme: ReturnType<typeof useThemeTokens>,
  topInset: number,
  bottomInset: number
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: Math.max(topInset, theme.spacing.lg),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    headerText: {
      gap: theme.spacing.xs,
    },
    closeButton: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    section: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    sectionLabel: {
      marginBottom: theme.spacing.xs,
    },
    totalCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: Math.max(bottomInset, theme.spacing.xl),
      gap: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
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
    buttonLoading: {
      opacity: 0.72,
    },
    secondaryButton: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    cancelButton: {
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    successWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    successCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    successEmoji: {
      color: theme.colors.accent,
    },
    successHeading: {
      textAlign: 'center',
    },
    successBody: {
      textAlign: 'center',
      lineHeight: 22,
    },
  });
}

function createItemStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    art: {
      width: 48,
      height: 48,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      flexShrink: 0,
    },
    meta: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
  });
}
