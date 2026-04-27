import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useCartStore } from '@/src/features/cart/cart.store';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export function CartScreen() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useCartStore((state) => state.total());

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

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 120,
  },
  eyebrow: {
    color: '#EC5C39',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 20,
  },
  emptyCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 20,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 20,
  },
  list: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 12,
    gap: 12,
  },
  artwork: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: 'rgba(236,92,57,0.22)',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  itemArtist: {
    color: 'rgba(255,255,255,0.58)',
    marginTop: 3,
  },
  itemPrice: {
    color: '#EC5C39',
    fontWeight: '800',
    marginTop: 5,
  },
  remove: {
    color: '#FF6B6B',
    fontWeight: '800',
    fontSize: 12,
  },
  summary: {
    marginTop: 24,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
  },
  total: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
  checkoutButton: {
    backgroundColor: '#EC5C39',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  clearButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
  },
});
