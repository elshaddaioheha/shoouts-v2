import { AppText } from '@/src/components/ui/AppText';
import { getStartupStatusCopy } from '@/src/config/backendStatus';
import { getVaultLimits } from '@/src/features/access/access.helpers';
import { useAccountStore } from '@/src/features/account/account.store';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { deriveExperienceFromRouteContext } from '@/src/features/navigation/navigation.helpers';
import { useThemeTokens } from '@/src/theme';
import { router, useLocalSearchParams, usePathname } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export function SettingsScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const pathname = usePathname();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const user = useAuthStore((state) => state.user);
  const startupStatus = useAuthStore((state) => state.startupStatus);
  const startupMessage = useAuthStore((state) => state.startupMessage);
  const role = useAccountStore((state) => state.role);
  const profile = useAccountStore((state) => state.profile);
  const previewExperience = useAccountStore((state) => state.previewExperience);
  const displayName = profile?.displayName?.trim() || user?.displayName || 'Creator';
  const emailLabel = user?.email ?? 'No email linked';
  const roleLabel = role.replace(/_/g, ' ').toUpperCase();
  const selectedTierLabel = (profile?.subscriptionTier ?? role).replace(/_/g, ' ').toUpperCase();
  const statusLabel = (profile?.subscriptionStatus ?? 'free').replace(/_/g, ' ').toUpperCase();
  const startupCopy = getStartupStatusCopy(startupStatus, startupMessage);
  const accountDocLabel = profile?.dataHealth.userDocState?.replace(/_/g, ' ').toUpperCase() ?? 'MISSING';
  const previewLabel = previewExperience ? previewExperience.replace(/_/g, ' ').toUpperCase() : 'NONE';
  const settingsExperience = deriveExperienceFromRouteContext(pathname, source);
  const isVaultContext = settingsExperience === 'vault';
  const vaultLimits = getVaultLimits(role);
  const storageUsedBytes = profile?.usage.vaultStorageUsedBytes ?? 0;
  const storageUsedGb = storageUsedBytes / (1024 * 1024 * 1024);
  const storageLimitGb = vaultLimits.vaultStorageGb;
  const title = isVaultContext ? 'Vault settings' : 'Account settings';
  const subtitle = isVaultContext
    ? 'Manage Vault subscription, storage limits, and account preferences.'
    : 'Manage account, preferences, and app state.';

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
        <AppText variant="pageHeading">{title}</AppText>
        <AppText variant="bodySmall" tone="secondary">
          {subtitle}
        </AppText>

        <View style={styles.card}>
          <AppText variant="sectionHeading">Profile</AppText>
          <AppText variant="bodySmall">{displayName}</AppText>
          <AppText variant="bodySmall" tone="secondary">
            {emailLabel}
          </AppText>
          <AppText variant="caption" tone="muted">
            Current access: {roleLabel} - {statusLabel}
          </AppText>
          {selectedTierLabel !== roleLabel ? (
            <AppText variant="caption" tone="secondary">
              Selected tier: {selectedTierLabel}
            </AppText>
          ) : null}
        </View>

        <View style={styles.card}>
          <AppText variant="sectionHeading">App state</AppText>
          <View style={styles.row}>
            <AppText variant="bodySmall">Startup mode</AppText>
            <AppText variant="caption" tone="muted">
              {startupStatus.replace(/_/g, ' ').toUpperCase()}
            </AppText>
          </View>
          <View style={styles.row}>
            <AppText variant="bodySmall">Account document</AppText>
            <AppText variant="caption" tone="muted">
              {accountDocLabel}
            </AppText>
          </View>
          <View style={styles.row}>
            <AppText variant="bodySmall">Preview workspace</AppText>
            <AppText variant="caption" tone="muted">
              {previewLabel}
            </AppText>
          </View>
          {startupCopy ? (
            <AppText variant="caption" tone="secondary" style={styles.helperCopy}>
              {startupCopy.message}
            </AppText>
          ) : null}
          {profile?.dataHealth.notes?.length ? (
            <AppText variant="caption" tone="secondary" style={styles.helperCopy}>
              {profile.dataHealth.notes[0]}
            </AppText>
          ) : null}
        </View>

        {isVaultContext ? (
          <View style={styles.card}>
            <AppText variant="sectionHeading">Vault limits</AppText>
            <View style={styles.row}>
              <AppText variant="bodySmall">Storage used</AppText>
              <AppText variant="caption" tone="muted">
                {storageUsedGb.toFixed(2)} GB / {storageLimitGb.toFixed(2)} GB
              </AppText>
            </View>
            <View style={styles.row}>
              <AppText variant="bodySmall">Upload slots</AppText>
              <AppText variant="caption" tone="muted">
                {profile?.usage.vaultUploadCount ?? 0} / {vaultLimits.vaultMaxUploads}
              </AppText>
            </View>
          </View>
        ) : null}

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
              Enabled
            </AppText>
          </View>
        </View>

        <View style={styles.card}>
          <AppText variant="sectionHeading">Actions</AppText>
          <Pressable
            style={styles.inlineButton}
            onPress={() =>
              router.push({
                pathname: '/settings/subscriptions',
                params: {
                  experience: settingsExperience,
                  source: settingsExperience,
                },
              } as any)
            }
          >
            <AppText variant="button">Manage subscriptions</AppText>
          </Pressable>
          <Pressable
            style={styles.inlineButton}
            onPress={() =>
              router.push({
                pathname: '/settings/profile',
                params: { source: settingsExperience },
              } as any)
            }
          >
            <AppText variant="button">Account profile</AppText>
          </Pressable>
          <Pressable
            style={styles.inlineButton}
            onPress={() =>
              router.push({
                pathname: '/settings/updates',
                params: { source: settingsExperience },
              } as any)
            }
          >
            <AppText variant="button">Updates & notifications</AppText>
          </Pressable>
          <Pressable style={styles.inlineButton} onPress={() => router.push('/signout' as any)}>
            <AppText variant="button" tone="danger">
              Sign out
            </AppText>
          </Pressable>
        </View>

        {user?.isAdmin ? (
          <View style={styles.card}>
            <AppText variant="sectionHeading">Administration</AppText>
            <Pressable
              style={styles.inlineButton}
              onPress={() => router.push('/admin' as any)}
            >
              <AppText variant="button" tone="accent">Open admin panel</AppText>
            </Pressable>
          </View>
        ) : null}
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
    helperCopy: {
      lineHeight: 18,
    },
  });
}
