import { AppText } from '@/src/components/ui/AppText';
import { useAccountStore } from '@/src/features/account/account.store';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { normalizeExperienceValue } from '@/src/features/navigation/navigation.helpers';
import { useThemeTokens } from '@/src/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export function AccountProfileScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const { source } = useLocalSearchParams<{ source?: string }>();
  const profile = useAccountStore((state) => state.profile);
  const role = useAccountStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const displayName = profile?.displayName ?? user?.displayName ?? 'Creator';
  const email = profile?.email ?? user?.email ?? 'No email linked';
  const status = (profile?.subscriptionStatus ?? 'free').replace(/_/g, ' ').toUpperCase();
  const tier = (profile?.subscriptionTier ?? role).replace(/_/g, ' ').toUpperCase();
  const access = role.replace(/_/g, ' ').toUpperCase();
  const sourceExperience = normalizeExperienceValue(source);
  const sourceLabel = sourceExperience
    ? `${sourceExperience.charAt(0).toUpperCase()}${sourceExperience.slice(1)} context`
    : 'Account context';

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <AppText variant="button" tone="secondary">
            Back
          </AppText>
        </Pressable>

        <AppText variant="eyebrow" tone="accent">
          Profile
        </AppText>
        <AppText variant="pageHeading">Account profile</AppText>
        <AppText variant="bodySmall" tone="secondary">
          {sourceLabel}
        </AppText>

        <View style={styles.card}>
          <AppText variant="sectionHeading">{displayName}</AppText>
          <AppText variant="bodySmall" tone="secondary">
            {email}
          </AppText>
          <AppText variant="caption" tone="muted">
            Current access: {access} - Status: {status}
          </AppText>
          {tier !== access ? (
            <AppText variant="caption" tone="secondary">
              Selected tier: {tier}
            </AppText>
          ) : null}
        </View>

        <View style={styles.card}>
          <AppText variant="sectionHeading">Document health</AppText>
          <AppText variant="bodySmall" tone="secondary">
            userDoc: {(profile?.dataHealth.userDocState ?? 'missing').toUpperCase()}
          </AppText>
          <AppText variant="bodySmall" tone="secondary">
            subscriptionDoc: {(profile?.dataHealth.subscriptionDocState ?? 'missing').toUpperCase()}
          </AppText>
          {profile?.dataHealth.notes?.length ? (
            <AppText variant="caption" tone="muted">
              {profile.dataHealth.notes[0]}
            </AppText>
          ) : null}
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
  });
}
