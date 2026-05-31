import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import { useCartStore } from '@/src/features/cart/cart.store';
import { useCartValidation } from '@/src/features/cart/cart.hooks';
import {
  formatCartPrice,
  formatCartTotal,
  getCartItemStateCopy,
  hasMixedCartCurrencies,
} from '@/src/features/cart/cart.types';
import { ListingArtwork } from '@/src/features/marketplace/components/ListingArtwork';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export function CartScreen() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const totalLabel = formatCartTotal(items);
  const hasMixedCurrencies = hasMixedCartCurrencies(items);
  const { statusMap, isValidating } = useCartValidation(items);
  const hasUnavailable = Object.values(statusMap).some((s) => s === 'unavailable');
  const hasPriceChanged = Object.values(statusMap).some((s) => s === 'price_changed');

  function handleCheckout() {
    router.push('/checkout' as any);
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="eyebrow" tone="accent">
          Cart
        </AppText>
        <AppText variant="pageHeading">Your selected items</AppText>
        {(hasUnavailable || hasPriceChanged) && !isValidating ? (
          <View style={styles.validationBanner}>
            <AppText variant="caption" tone="warning">
              {hasUnavailable
                ? 'One or more items are no longer available. Remove them before checkout.'
                : 'A price has changed since you added an item. Review before proceeding.'}
            </AppText>
          </View>
        ) : null}

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <AppText variant="sectionHeading">Your cart is empty</AppText>
            <AppText variant="bodySmall" tone="secondary" style={styles.emptyText}>
              Add tracks from Explore or Home to review them here before payments go live.
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
            {items.map((item) => {
              const stateCopy = getCartItemStateCopy(item);
              const itemStatus = statusMap[item.id];
              const isUnavailable = itemStatus === 'unavailable';
              const isPriceChanged = itemStatus === 'price_changed';

              return (
                <View
                  key={item.id}
                  style={[styles.item, isUnavailable && styles.itemStale]}
                >
                  <View style={styles.itemLeading}>
                    <ListingArtwork
                      coverUrl={item.coverUrl}
                      label="Cart"
                      style={styles.artwork}
                    >
                      {item.coverUrl ? (
                        <View />
                      ) : (
                        <AppIcon name="cart" size="sm" tone="accent" stroke="regular" />
                      )}
                    </ListingArtwork>
                    <View style={styles.itemInfo}>
                      <AppText variant="title" numberOfLines={1}>
                        {item.title}
                      </AppText>
                      <AppText variant="bodySmall" tone="secondary" numberOfLines={1}>
                        {item.artist}
                      </AppText>
                      <AppText variant="bodySmall" tone={isUnavailable ? 'danger' : 'accent'}>
                        {formatCartPrice(item)}
                      </AppText>
                      {isUnavailable ? (
                        <AppText variant="caption" tone="danger">
                          No longer available
                        </AppText>
                      ) : isPriceChanged ? (
                        <AppText variant="caption" tone="warning">
                          Price has changed — review before checkout
                        </AppText>
                      ) : (
                        <AppText variant="caption" tone="muted">
                          {stateCopy.badge}
                        </AppText>
                      )}
                    </View>
                  </View>

                  <View style={styles.itemFooter}>
                    {!isUnavailable && !isPriceChanged ? (
                      <AppText variant="caption" tone="secondary" style={styles.itemNote}>
                        {stateCopy.detail}
                      </AppText>
                    ) : null}
                    <Pressable
                      style={styles.removeButton}
                      onPress={() => removeItem(item.id)}
                    >
                      <AppText variant="button" tone="danger">
                        Remove
                      </AppText>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <AppText variant="bodySmall" tone="secondary">
              Items
            </AppText>
            <AppText variant="title">{items.length}</AppText>
          </View>

          <View style={styles.summaryRow}>
            <AppText variant="bodySmall" tone="secondary">
              Review total
            </AppText>
            <AppText variant="sectionHeading">{totalLabel}</AppText>
          </View>

          {hasMixedCurrencies ? (
            <AppText variant="caption" tone="secondary" style={styles.summaryNote}>
              Mixed currencies stay separate until the real checkout provider decides settlement rules.
            </AppText>
          ) : null}

          <Pressable
            style={[
              styles.checkoutButton,
              (items.length === 0 || hasUnavailable) && styles.checkoutButtonDisabled,
            ]}
            onPress={handleCheckout}
            disabled={items.length === 0 || hasUnavailable}
          >
            <AppText variant="button" style={styles.checkoutText}>
              {hasUnavailable ? 'Remove unavailable items first' : 'Proceed to checkout'}
            </AppText>
          </Pressable>

          {items.length > 0 ? (
            <Pressable style={styles.clearButton} onPress={clearCart}>
              <AppText variant="button" tone="secondary">
                Clear cart
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

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
      gap: theme.spacing.lg,
    },
    validationBanner: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.warningSoft,
      borderWidth: 1,
      borderColor: theme.colors.warning,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    emptyCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    emptyText: {
      lineHeight: 20,
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
    list: {
      gap: theme.spacing.md,
    },
    item: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    },
    itemStale: {
      borderColor: theme.colors.danger,
      backgroundColor: theme.colors.dangerSoft,
    },
    itemLeading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    artwork: {
      width: 54,
      height: 54,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    itemInfo: {
      flex: 1,
      minWidth: 0,
      gap: theme.spacing.xs,
    },
    itemFooter: {
      gap: theme.spacing.sm,
    },
    itemNote: {
      lineHeight: 18,
    },
    removeButton: {
      alignSelf: 'flex-end',
      minHeight: 34,
      justifyContent: 'center',
    },
    summary: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryNote: {
      lineHeight: 18,
    },
    checkoutButton: {
      minHeight: theme.layout.minTouchTarget,
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    checkoutButtonDisabled: {
      backgroundColor: theme.colors.surfacePressed,
    },
    checkoutText: {
      color: theme.colors.textOnAccent,
    },
    clearButton: {
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
