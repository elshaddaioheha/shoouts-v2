import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export function StudioHomeScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  function handleComingSoon(feature: string) {
    Alert.alert('Coming soon', `${feature} will be connected after Studio shell is stable.`);
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Studio</Text>
        <Text style={styles.title}>Seller dashboard</Text>
        <Text style={styles.subtitle}>
          Publish beats, manage listings, promote music, and prepare for verified payouts.
        </Text>

        <View style={styles.grid}>
          <Pressable style={styles.card} onPress={() => handleComingSoon('Marketplace upload')}>
            <Text style={styles.cardTitle}>Upload to Marketplace</Text>
            <Text style={styles.cardText}>Studio users can upload directly to the public marketplace.</Text>
          </Pressable>

          <Pressable style={styles.card} onPress={() => handleComingSoon('Listings')}>
            <Text style={styles.cardTitle}>Listings</Text>
            <Text style={styles.cardText}>Create, edit, publish, and unpublish beat listings.</Text>
          </Pressable>

          <Pressable style={styles.card} onPress={() => handleComingSoon('Promotions')}>
            <Text style={styles.cardTitle}>Boosted Listings</Text>
            <Text style={styles.cardText}>Promotion placeholders will become paid boosts later.</Text>
          </Pressable>

          <Pressable style={styles.card} onPress={() => handleComingSoon('Analytics')}>
            <Text style={styles.cardTitle}>Basic Analytics</Text>
            <Text style={styles.cardText}>Start with simple listen and view counts.</Text>
          </Pressable>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>KYC required for payouts</Text>
          <Text style={styles.noticeText}>
            Sellers can publish first, but payout access should require verification.
          </Text>
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
      paddingBottom: 130,
      backgroundColor: theme.colors.background,
    },
    eyebrow: {
      ...theme.typography.eyebrow,
      color: theme.colors.accent,
      marginBottom: theme.spacing.sm,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 32,
      fontWeight: '900',
      letterSpacing: -0.8,
    },
    subtitle: {
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
      lineHeight: 21,
    },
    grid: {
      gap: theme.spacing.md,
    },
    card: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.lg,
    },
    cardTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '900',
      marginBottom: theme.spacing.sm,
    },
    cardText: {
      color: theme.colors.textSecondary,
      lineHeight: 21,
    },
    notice: {
      marginTop: theme.spacing.xl,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.lg,
    },
    noticeTitle: {
      color: theme.colors.textPrimary,
      fontWeight: '900',
      fontSize: 16,
      marginBottom: theme.spacing.sm,
    },
    noticeText: {
      color: theme.colors.textSecondary,
      lineHeight: 21,
    },
  });
}
