import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import { useCartStore } from '@/src/features/cart/cart.store';
import { ListingArtwork } from '@/src/features/marketplace/components/ListingArtwork';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export function CartScreen() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useCartStore((state) => state.total());
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  function handleCheckout() {
    Alert.alert(
      'Checkout coming soon',
      'Payments stay pinned until marketplace reads and library flows are fully stable.'
    );
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="eyebrow" tone="accent">
          Cart
        </AppText>
        <AppText variant="pageHeading">Your selected beats</AppText>
        <AppText variant="bodySmall" tone="secondary" style={styles.subtitle}>
          This is the buyer review step before checkout is connected.
        </AppText>

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <AppText variant="sectionHeading">Your cart is empty</AppText>
            <AppText variant="bodySmall" tone="secondary" style={styles.emptyText}>
              Add beats from Explore or Home to review them here before payments go live.
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
            {items.map((item) => (
              <View key={item.id} style={styles.item}>
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
                    <AppText variant="bodySmall" tone="accent">
                      ${item.price.toFixed(2)}
                    </AppText>
                  </View>
                </View>

                <Pressable
                  style={styles.removeButton}
                  onPress={() => removeItem(item.id)}
                >
                  <AppText variant="button" tone="danger">
                    Remove
                  </AppText>
                </Pressable>
              </View>
            ))}
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
              Total
            </AppText>
            <AppText variant="sectionHeading">${total.toFixed(2)}</AppText>
          </View>

          <Pressable
            style={[styles.checkoutButton, items.length === 0 && styles.checkoutButtonDisabled]}
            onPress={handleCheckout}
            disabled={items.length === 0}
          >
            <AppText variant="button" style={styles.checkoutText}>
              Checkout coming soon
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
