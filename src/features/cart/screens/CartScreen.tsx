import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useCartStore } from '@/src/features/cart/cart.store';
import { useThemeTokens } from '@/src/theme';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export function CartScreen() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useCartStore((state) => state.total());
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  function handleCheckout() {
    Alert.alert('Checkout coming soon', 'Payments will be connected after marketplace and player are stable.');
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Cart</Text>
        <Text style={styles.title}>Your selected beats</Text>

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyText}>Add beats from the marketplace to see them here.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <View key={item.id} style={styles.item}>
                <View style={styles.artwork} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemArtist}>{item.artist}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                </View>

                <Pressable onPress={() => removeItem(item.id)}>
                  <Text style={styles.remove}>Remove</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.total}>${total.toFixed(2)}</Text>
          </View>

          <Pressable style={styles.checkoutButton} onPress={handleCheckout} disabled={items.length === 0}>
            <Text style={styles.checkoutText}>Checkout coming soon</Text>
          </Pressable>

          {items.length > 0 ? (
            <Pressable style={styles.clearButton} onPress={clearCart}>
              <Text style={styles.clearText}>Clear cart</Text>
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
      paddingBottom: 120,
      backgroundColor: theme.colors.background,
    },
    eyebrow: {
      ...theme.typography.eyebrow,
      color: theme.colors.accent,
      marginBottom: theme.spacing.sm,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 30,
      fontWeight: '900',
      marginBottom: theme.spacing.xl,
    },
    emptyCard: {
      borderRadius: theme.radius.xxl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.xl,
    },
    emptyTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 6,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    list: {
      gap: theme.spacing.md,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    },
    artwork: {
      width: 54,
      height: 54,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.accentSoftDark,
    },
    itemInfo: {
      flex: 1,
    },
    itemTitle: {
      color: theme.colors.textPrimary,
      fontWeight: '800',
      fontSize: 15,
    },
    itemArtist: {
      color: theme.colors.textSecondary,
      marginTop: 3,
    },
    itemPrice: {
      color: theme.colors.accent,
      fontWeight: '800',
      marginTop: 5,
    },
    remove: {
      color: theme.colors.error,
      fontWeight: '800',
      fontSize: 12,
    },
    summary: {
      marginTop: theme.spacing.xxl,
      borderRadius: theme.radius.xxl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.lg,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    summaryLabel: {
      color: theme.colors.textSecondary,
      fontWeight: '700',
    },
    total: {
      color: theme.colors.textPrimary,
      fontWeight: '900',
      fontSize: 18,
    },
    checkoutButton: {
      backgroundColor: theme.colors.accent,
      borderRadius: theme.radius.lg,
      paddingVertical: 14,
      alignItems: 'center',
    },
    checkoutText: {
      color: theme.colors.textPrimary,
      fontWeight: '900',
    },
    clearButton: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    clearText: {
      color: theme.colors.textSecondary,
      fontWeight: '700',
    },
  });
}
