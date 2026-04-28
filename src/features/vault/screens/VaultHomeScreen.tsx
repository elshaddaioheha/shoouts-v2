import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export function VaultHomeScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  function handleComingSoon(feature: string) {
    Alert.alert('Coming soon', `${feature} will be added after the shell is stable.`);
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Vault Workspace</Text>
        <Text style={styles.title}>Private music workspace</Text>
        <Text style={styles.subtitle}>
          Upload, organize, record, and privately preview your ideas before publishing.
        </Text>

        <View style={styles.grid}>
          <Pressable style={styles.card} onPress={() => handleComingSoon('Audio upload')}>
            <Text style={styles.cardTitle}>Upload Audio</Text>
            <Text style={styles.cardText}>Add private tracks to your Vault workspace.</Text>
          </Pressable>

          <Pressable style={styles.card} onPress={() => handleComingSoon('Folders')}>
            <Text style={styles.cardTitle}>Folders</Text>
            <Text style={styles.cardText}>Organize songs, beats, demos, and projects.</Text>
          </Pressable>

          <Pressable style={styles.card} onPress={() => handleComingSoon('Recording')}>
            <Text style={styles.cardTitle}>Record</Text>
            <Text style={styles.cardText}>Capture ideas and rough takes directly in Vault.</Text>
          </Pressable>

          <Pressable style={styles.card} onPress={() => handleComingSoon('Private playback')}>
            <Text style={styles.cardTitle}>Private Playback</Text>
            <Text style={styles.cardText}>Preview your private files before sharing.</Text>
          </Pressable>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Storage limits enabled</Text>
          <Text style={styles.noticeText}>
            Vault users will have storage limits from day one. Vault Pro appears when storage runs low.
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
