import { AppText } from '@/src/components/ui/AppText';
import { useCartStore } from '@/src/features/cart/cart.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export function SavedScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const items = useCartStore((state) => state.items);

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <AppText variant="button" tone="secondary">
            Back
          </AppText>
        </Pressable>

        <AppText variant="eyebrow" tone="accent">
          Saved
        </AppText>
        <AppText variant="pageHeading">Saved & favourites</AppText>
        <AppText variant="bodySmall" tone="secondary">
          Liked listings and followed creators will sync here as social features are enabled.
        </AppText>

        <View style={styles.card}>
          <AppText variant="sectionHeading">Feature state</AppText>
          <AppText variant="bodySmall" tone="secondary" style={styles.copy}>
            This screen is now a valid route. Saved-content writes are next after follow and like backend paths.
          </AppText>
        </View>

        <View style={styles.card}>
          <AppText variant="sectionHeading">Quick review from cart</AppText>
          {items.length === 0 ? (
            <AppText variant="bodySmall" tone="secondary" style={styles.copy}>
              Add listings to cart in Explore or Home. They will appear here as quick picks for now.
            </AppText>
          ) : (
            <View style={styles.list}>
              {items.slice(0, 6).map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.row}
                  onPress={() =>
                    router.push({
                      pathname: '/listing/[id]',
                      params: { id: item.listingId },
                    } as any)
                  }
                >
                  <View style={styles.rowCopy}>
                    <AppText variant="title" numberOfLines={1}>
                      {item.title}
                    </AppText>
                    <AppText variant="bodySmall" tone="secondary" numberOfLines={1}>
                      {item.artist}
                    </AppText>
                  </View>
                  <AppText variant="button" tone="accent">
                    View
                  </AppText>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Pressable style={styles.primaryButton} onPress={() => router.push('/(tabs)/marketplace' as any)}>
          <AppText variant="button" style={styles.primaryButtonText}>
            Browse Explore
          </AppText>
        </Pressable>
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
      gap: theme.spacing.md,
    },
    backButton: {
      alignSelf: 'flex-start',
      minHeight: 34,
      justifyContent: 'center',
    },
    card: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    copy: {
      lineHeight: 20,
    },
    list: {
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    row: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    rowCopy: {
      flex: 1,
      minWidth: 0,
      gap: theme.spacing.xs,
    },
    primaryButton: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.sm,
    },
    primaryButtonText: {
      color: theme.colors.textOnAccent,
    },
  });
}
