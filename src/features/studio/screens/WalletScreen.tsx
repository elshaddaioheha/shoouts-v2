import { AppText } from '@/src/components/ui/AppText';
import { InterimFeatureSheet } from '@/src/components/ui/InterimFeatureSheet';
import { useAccountStore } from '@/src/features/account/account.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

type NoticeId = 'payout_request' | 'connect_account' | null;

export function WalletScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const profile = useAccountStore((state) => state.profile);
  const payoutsEnabled = profile?.seller.payoutsEnabled ?? false;
  const verification = profile?.seller.verificationStatus ?? 'not_started';
  const isVerified = verification === 'verified';
  const [activeNotice, setActiveNotice] = useState<NoticeId>(null);

  return (
    <AppShell showSwitcher={false} showBottomBar={false} reserveBottomBarSpace={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <AppText variant="button" tone="secondary">Back</AppText>
        </Pressable>

        <View style={styles.header}>
          <AppText variant="eyebrow" tone="accent">Creator Wallet</AppText>
          <AppText variant="pageHeading">Earnings & payouts</AppText>
          <AppText variant="body" tone="secondary" style={styles.subtitle}>
            Revenue from beat sales, payout status, and your connected payout account.
          </AppText>
        </View>

        {!payoutsEnabled ? (
          <Pressable style={styles.setupBanner} onPress={() => setActiveNotice('connect_account')}>
            <View style={styles.setupBannerIcon}>
              <AlertCircle size={20} color={theme.colors.warning} />
            </View>
            <View style={styles.setupBannerCopy}>
              <AppText variant="title" style={styles.setupBannerTitle}>
                Set up payouts to receive revenue
              </AppText>
              <AppText variant="caption" tone="secondary">
                Connect Stripe or Paystack once seller verification is complete.
              </AppText>
            </View>
            <ExternalLink size={18} color={theme.colors.textMuted} />
          </Pressable>
        ) : (
          <View style={styles.activeBanner}>
            <CheckCircle2 size={18} color={theme.colors.success} />
            <AppText variant="caption" tone="success">
              Payout account connected — funds transfer once transactions are live.
            </AppText>
          </View>
        )}

        <View style={styles.earningsCard}>
          <AppText variant="caption" tone="muted">Total revenue</AppText>
          <AppText variant="pageHeading" style={styles.earningsAmount}>$0.00</AppText>
          <AppText variant="caption" tone="secondary">
            Live revenue connects once payment processing is active.
          </AppText>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <AppText variant="caption" tone="muted">Pending</AppText>
            <AppText variant="sectionHeading">$0.00</AppText>
          </View>
          <View style={styles.metricCard}>
            <AppText variant="caption" tone="muted">Paid out</AppText>
            <AppText variant="sectionHeading">$0.00</AppText>
          </View>
          <View style={styles.metricCard}>
            <AppText variant="caption" tone="muted">Sales</AppText>
            <AppText variant="sectionHeading">0</AppText>
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <AppText variant="title">Payout account</AppText>
            <AppText variant="caption" tone={payoutsEnabled ? 'success' : 'muted'}>
              {payoutsEnabled ? 'Connected' : 'Not connected'}
            </AppText>
          </View>
          <AppText variant="bodySmall" tone="secondary" style={styles.statusText}>
            {payoutsEnabled
              ? 'Your payout account is active. Funds from sales will transfer once checkout is live.'
              : isVerified
                ? 'Seller verified. Connect a Stripe or Paystack account to enable revenue collection.'
                : 'Complete seller verification first, then connect a payout account.'}
          </AppText>
          <Pressable
            style={[styles.actionButton, !isVerified && !payoutsEnabled && styles.actionButtonDisabled]}
            onPress={() => setActiveNotice('connect_account')}
          >
            <AppText variant="button" tone={payoutsEnabled ? 'secondary' : isVerified ? 'accent' : 'muted'}>
              {payoutsEnabled
                ? 'Manage payout account'
                : isVerified
                  ? 'Connect payout account'
                  : 'Verification required first'}
            </AppText>
          </Pressable>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <AppText variant="title">Seller verification</AppText>
            <AppText
              variant="caption"
              tone={isVerified ? 'success' : verification === 'pending' ? 'warning' : 'muted'}
            >
              {formatVerificationLabel(verification)}
            </AppText>
          </View>
          <AppText variant="bodySmall" tone="secondary" style={styles.statusText}>
            {isVerified
              ? 'Verified. You can connect a payout account to receive revenue.'
              : verification === 'pending'
                ? 'Verification in progress. Payout setup unlocks once approved.'
                : 'Submit identity and banking details to unlock payout setup.'}
          </AppText>
        </View>

        <View style={styles.historyCard}>
          <AppText variant="sectionHeading">Payout history</AppText>
          <AppText variant="bodySmall" tone="secondary" style={styles.historyEmpty}>
            No payouts yet. History appears here once transactions are processed.
          </AppText>
        </View>

        <Pressable
          style={[styles.requestButton, !payoutsEnabled && styles.requestButtonDisabled]}
          onPress={() => setActiveNotice('payout_request')}
        >
          <AppText variant="button" tone={payoutsEnabled ? 'accent' : 'muted'}>
            Request payout
          </AppText>
        </Pressable>
      </ScrollView>

      <InterimFeatureSheet
        visible={activeNotice === 'payout_request'}
        title="Payout requests are coming"
        message="Manual and scheduled payout requests will be available once Stripe Connect or Paystack is fully integrated."
        onClose={() => setActiveNotice(null)}
      />
      <InterimFeatureSheet
        visible={activeNotice === 'connect_account'}
        title="Payout account setup is next"
        message="Stripe Connect and Paystack onboarding will be connected in the payment integration phase. Seller verification is required first."
        onClose={() => setActiveNotice(null)}
      />
    </AppShell>
  );
}

function formatVerificationLabel(value: string) {
  return value.replace(/_/g, ' ').toUpperCase();
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxxl,
      gap: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    backButton: {
      alignSelf: 'flex-start',
      minHeight: 34,
      justifyContent: 'center',
    },
    header: {
      gap: theme.spacing.sm,
    },
    subtitle: {
      lineHeight: 22,
      maxWidth: 560,
    },
    setupBanner: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.warningSoft,
      borderWidth: 1,
      borderColor: theme.colors.warning,
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    setupBannerIcon: {
      flexShrink: 0,
    },
    setupBannerCopy: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    setupBannerTitle: {
      color: theme.colors.textPrimary,
    },
    activeBanner: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.successSoft,
      borderWidth: 1,
      borderColor: theme.colors.success,
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    earningsCard: {
      borderRadius: theme.radius.xxl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      padding: theme.spacing.xl,
      gap: theme.spacing.sm,
      alignItems: 'center',
      ...theme.shadows.md,
    },
    earningsAmount: {
      fontSize: 40,
      lineHeight: 48,
      letterSpacing: -1,
    },
    metricsRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    metricCard: {
      flex: 1,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.md,
      gap: 4,
    },
    statusCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    statusText: {
      lineHeight: 20,
    },
    actionButton: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    actionButtonDisabled: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    historyCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    historyEmpty: {
      lineHeight: 20,
    },
    requestButton: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    requestButtonDisabled: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
  });
}
