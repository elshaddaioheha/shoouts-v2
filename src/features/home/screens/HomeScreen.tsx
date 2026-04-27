import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Image } from 'react-native';
import { useAppTheme } from '@/src/hooks/use-app-theme';
import { AppShell } from '@/src/features/navigation/components/AppShell';

const mockTracks = [
  {
    id: 'demo-1',
    title: 'Demo Beat',
    artist: 'Shoout Producer',
    price: 0,
    artworkUrl: '',
  },
  {
    id: 'demo-2',
    title: 'Premium Beat',
    artist: 'Studio Producer',
    price: 19.99,
    artworkUrl: '',
  },
];

export function HomeScreen() {
  const appTheme = useAppTheme();

  function handlePlay() {
    console.log('Player not migrated yet');
  }

  function handleAddToCart() {
    console.log('Cart not migrated yet');
  }

  return (
    <AppShell>
      <View style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
        <StatusBar barStyle={appTheme.isDark ? 'light-content' : 'dark-content'} />

        <View style={styles.header}>
          <Text style={[styles.title, { color: appTheme.colors.textPrimary }]}>Home</Text>
          <Text style={[styles.subtitle, { color: appTheme.colors.textSecondary }]}>Latest demos and featured beats</Text>
        </View>

        <FlatList
          data={mockTracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderColor: appTheme.colors.border }]}>
              {item.artworkUrl ? (
                <Image source={{ uri: item.artworkUrl }} style={styles.artwork} />
              ) : (
                <View style={[styles.artworkPlaceholder, { backgroundColor: appTheme.isDark ? '#222' : '#EEE' }]} />
              )}

              <View style={styles.meta}>
                <Text style={[styles.trackTitle, { color: appTheme.colors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.trackArtist, { color: appTheme.colors.textSecondary }]} numberOfLines={1}>{item.artist}</Text>
                <Text style={[styles.trackPrice, { color: appTheme.colors.textSecondary }]}>{item.price > 0 ? `$${item.price}` : 'Free'}</Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity style={[styles.actionButton, { borderColor: appTheme.colors.border }]} onPress={handlePlay}>
                    <Text style={[styles.actionText, { color: appTheme.colors.primary }]}>Play</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, { borderColor: appTheme.colors.border }]} onPress={handleAddToCart}>
                    <Text style={[styles.actionText, { color: appTheme.colors.primary }]}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  artwork: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 12,
  },
  artworkPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 12,
  },
  meta: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  trackArtist: {
    fontSize: 13,
    marginTop: 4,
  },
  trackPrice: {
    fontSize: 13,
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
