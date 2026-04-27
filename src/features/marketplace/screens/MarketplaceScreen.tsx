import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, StatusBar } from 'react-native';
import { useAppTheme } from '@/src/hooks/use-app-theme';
import { db } from '@/src/config/firebase';
import { useAccountStore } from '@/src/features/account/account.store';
import { can } from '@/src/features/access/access.helpers';
import { mockMarketplaceListings } from '@/src/features/marketplace/data/mockListings';
import { useCartStore } from '@/src/features/cart/cart.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';

// Using mock listings during migration to keep marketplace stable.
const mockItems = mockMarketplaceListings;

export function MarketplaceScreen() {
  const appTheme = useAppTheme();

  const addItem = useCartStore((s) => s.addItem);

  function handlePlayPreview() {
    console.log('Player will be migrated later.');
  }

  function handleAddToCart(listing: any) {
    addItem({
      id: listing.id,
      listingId: listing.id,
      title: listing.title,
      artist: listing.artist || listing.uploaderName || 'Creator',
      price: listing.price || 0,
      coverUrl: listing.coverUrl || listing.artworkUrl || '',
    });
    console.log('Added to cart:', listing.id);
  }

  function handleBuyNow() {
    console.log('Payments will be connected later.');
  }

  return (
    <AppShell>
      <View style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
        <StatusBar barStyle={appTheme.isDark ? 'light-content' : 'dark-content'} />

        <View style={styles.header}>
          <Text style={[styles.title, { color: appTheme.colors.textPrimary }]}>Marketplace</Text>
          <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]}>Find beats, samples, and more</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>Featured</Text>
            <View style={styles.row}>
              {mockItems.map((item) => (
                <TouchableOpacity key={item.id} style={[styles.card, { borderColor: appTheme.colors.border }]} onPress={() => {}}>
                  {item.artworkUrl ? (
                    <Image source={{ uri: item.artworkUrl }} style={styles.cardImage} />
                  ) : (
                    <View style={[styles.cardPlaceholder, { backgroundColor: appTheme.isDark ? '#222' : '#EEE' }]} />
                  )}
                  <Text style={[styles.cardTitle, { color: appTheme.colors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.cardMeta, { color: appTheme.colors.textSecondary }]} numberOfLines={1}>{item.uploaderName}</Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={[styles.actionBtn, { borderColor: appTheme.colors.border }]} onPress={() => handlePlayPreview()}>
                      <Text style={[styles.actionText, { color: appTheme.colors.primary }]}>Play</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { borderColor: appTheme.colors.border }]} onPress={() => handleAddToCart(item)}>
                      <Text style={[styles.actionText, { color: appTheme.colors.primary }]}>{item.price > 0 ? `$${item.price}` : 'Free'}</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.textPrimary }]}>New Arrivals</Text>
            {mockItems.map((it) => (
              <TouchableOpacity key={it.id} style={[styles.listItem, { borderColor: appTheme.colors.border }]} onPress={() => {}}>
                <View style={[styles.thumb, { backgroundColor: appTheme.isDark ? '#222' : '#EEE' }]} />
                <View style={styles.listMeta}>
                  <Text style={[styles.listTitle, { color: appTheme.colors.textPrimary }]}>{it.title}</Text>
                  <Text style={[styles.listSubtitle, { color: appTheme.colors.textSecondary }]}>{it.uploaderName}</Text>
                </View>
                <TouchableOpacity style={[styles.listAction, { borderColor: appTheme.colors.border }]} onPress={() => handleAddToCart(it)}>
                  <Text style={[styles.actionText, { color: appTheme.colors.primary }]}>{it.price > 0 ? `$${it.price}` : 'Free'}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 6 },
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12 },
  card: { width: 160, padding: 12, borderRadius: 12, borderWidth: 1 },
  cardImage: { width: '100%', height: 90, borderRadius: 8, marginBottom: 8 },
  cardPlaceholder: { width: '100%', height: 90, borderRadius: 8, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardMeta: { fontSize: 12, marginTop: 6 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1 },
  actionText: { fontSize: 13, fontWeight: '600' },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderRadius: 10, marginBottom: 10 },
  thumb: { width: 56, height: 56, borderRadius: 8, marginRight: 12 },
  listMeta: { flex: 1 },
  listTitle: { fontSize: 15, fontWeight: '700' },
  listSubtitle: { fontSize: 13, marginTop: 4 },
  listAction: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
});
