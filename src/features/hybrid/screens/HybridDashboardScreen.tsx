import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export function HybridDashboardScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  function handleComingSoon(feature: string) {
    Alert.alert('Coming soon', `${feature} will be added after Hybrid shell is stable.`);
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Hybrid</Text>
        <Text style={styles.title}>Complete creator dashboard</Text>
        <Text style={styles.subtitle}>
          Vault plus Studio in one workflow. Move private ideas into public listings when ready.
        </Text>

        <View style={styles.workflowCard}>
          <Text style={styles.workflowTitle}>Vault project → Studio listing → Marketplace sale</Text>
          <Text style={styles.workflowText}>
            Hybrid users can prepare files privately in Vault, then publish selected work to the marketplace.
          </Text>
        </View>

        <View style={styles.grid}>
          <Pressable style={styles.card} onPress={() => handleComingSoon('Hybrid Vault')}>
            <Text style={styles.cardTitle}>Vault Workspace</Text>
            <Text style={styles.cardText}>Manage private files, folders, recordings, and previews.</Text>
          </Pressable>

          <Pressable style={styles.card} onPress={() => handleComingSoon('Hybrid Studio')}>
            <Text style={styles.cardTitle}>Studio Tools</Text>
            <Text style={styles.cardText}>Publish, promote, and manage beat listings.</Text>
          </Pressable>

          <Pressable style={styles.card} onPress={() => handleComingSoon('Publish from Vault')}>
            <Text style={styles.cardTitle}>Publish from Vault</Text>
            <Text style={styles.cardText}>Turn selected private Vault files into public marketplace listings.</Text>
          </Pressable>
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
    workflowCard: {
      borderRadius: theme.radius.xxl,
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    workflowTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '900',
      marginBottom: theme.spacing.sm,
    },
    workflowText: {
      color: theme.colors.textSecondary,
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
  });
}
