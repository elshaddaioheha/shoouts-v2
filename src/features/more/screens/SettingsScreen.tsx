import { AppText } from '@/src/components/ui/AppText';
import { useAccountStore } from '@/src/features/account/account.store';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export function SettingsScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const user = useAuthStore((state) => state.user);
  const role = useAccountStore((state) => state.role);
  const profile = useAccountStore((state) => state.profile);
  const displayName = profile?.displayName?.trim() || user?.displayName || 'Creator';
  const emailLabel = user?.email ?? 'No email linked';
  const roleLabel = role.replace(/_/g, ' ').toUpperCase();
  const statusLabel = (profile?.subscriptionStatus ?? 'free').replace(/_/g, ' ').toUpperCase();

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <AppText variant="button" tone="secondary">
            Back
          </AppText>
        </Pressable>

        <AppText variant="eyebrow" tone="accent">
          Settings
        </AppText>
        <AppText variant="pageHeading">Account settings</AppText>

        <View style={styles.card}>
          <AppText variant="sectionHeading">Profile</AppText>
          <AppText variant="bodySmall">{displayName}</AppText>
          <AppText variant="bodySmall" tone="secondary">
            {emailLabel}
          </AppText>
          <AppText variant="caption" tone="muted">
            {roleLabel} - {statusLabel}
          </AppText>
        </View>

        <View style={styles.card}>
          <AppText variant="sectionHeading">Preferences</AppText>
          <View style={styles.row}>
            <AppText variant="bodySmall">Theme</AppText>
            <AppText variant="caption" tone="muted">
              System
            </AppText>
          </View>
          <View style={styles.row}>
            <AppText variant="bodySmall">Notifications</AppText>
            <AppText variant="caption" tone="muted">
              Next phase
            </AppText>
          </View>
        </View>

        <View style={styles.card}>
          <AppText variant="sectionHeading">Actions</AppText>
          <Pressable style={styles.inlineButton} onPress={() => router.push('/settings/subscriptions' as any)}>
            <AppText variant="button">Manage subscriptions</AppText>
          </Pressable>
          <Pressable style={styles.inlineButton} onPress={() => router.push('/debug/signout' as any)}>
            <AppText variant="button" tone="danger">
              Sign out
            </AppText>
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
    row: {
      minHeight: theme.layout.minTouchTarget,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingHorizontal: theme.spacing.md,
    },
    inlineButton: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
  });
}
