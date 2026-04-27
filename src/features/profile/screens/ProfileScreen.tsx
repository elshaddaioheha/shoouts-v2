import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: 120,
      backgroundColor: theme.colors.background,
    },
    back: {
      color: theme.colors.textSecondary,
      fontWeight: '800',
      marginBottom: 30,
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    avatarText: {
      color: theme.colors.textPrimary,
      fontSize: 38,
      fontWeight: '900',
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 30,
      fontWeight: '900',
    },
    subtitle: {
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
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
  });
}

export function ProfileScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <AppShell>
      <View style={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>S</Text>
        </View>

        <Text style={styles.title}>Producer Profile</Text>
        <Text style={styles.subtitle}>Seller ID: {String(id)}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Seller storefront coming soon</Text>
          <Text style={styles.cardText}>
            This page will show verified seller profile, published beats, ratings, and contact options.
          </Text>
        </View>
      </View>
    </AppShell>
  );
}


