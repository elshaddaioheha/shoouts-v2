import { AppText } from '@/src/components/ui/AppText';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { subscribeToReports, updateReportStatus } from '@/src/features/admin/admin.api';
import type { AdminReport, ReportActionTaken } from '@/src/features/admin/admin.types';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { useThemeTokens } from '@/src/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export function AdminReportDetailScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const [report, setReport] = useState<AdminReport | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeToReports('all', (reports) => {
      const found = reports.find((r) => r.id === id);
      if (found) setReport(found);
    }, () => null);
    return unsub;
  }, [id]);

  async function handleAction(action: ReportActionTaken, status: 'actioned' | 'dismissed') {
    if (!user || !report) return;
    setSaving(true);
    try {
      await updateReportStatus(report.id, status, action, user.uid);
      router.back();
    } finally {
      setSaving(false);
    }
  }

  if (!report) {
    return (
      <AppShell showBottomBar={false} reserveBottomBarSpace={false}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.accent} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell showBottomBar={false} reserveBottomBarSpace={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()}>
          <AppText variant="button" tone="secondary" style={styles.back}>Back</AppText>
        </Pressable>

        <AppText variant="eyebrow" tone="accent">Report</AppText>
        <AppText variant="pageHeading">{report.listingTitle}</AppText>

        <View style={styles.metaCard}>
          <MetaRow label="Reason" value={report.reason} styles={styles} />
          <MetaRow label="Status" value={report.status} styles={styles} />
          <MetaRow label="Reported by" value={report.reportedBy} styles={styles} />
          <MetaRow label="Seller" value={report.sellerId} styles={styles} />
          <MetaRow label="Date" value={new Date(report.createdAtMs).toLocaleString()} styles={styles} />
        </View>

        {report.details ? (
          <View style={styles.detailsCard}>
            <AppText variant="caption" tone="muted">Reporter details</AppText>
            <AppText variant="body" tone="secondary">{report.details}</AppText>
          </View>
        ) : null}

        {report.status === 'pending' || report.status === 'reviewed' ? (
          <View style={styles.actions}>
            <AppText variant="sectionHeading" style={styles.actionsTitle}>Take action</AppText>

            <Pressable
              style={styles.actionButton}
              onPress={() => router.push({
                pathname: '/admin/listings',
                params: { highlightId: report.listingId, ownerUid: report.sellerId },
              } as any)}
            >
              <AppText variant="button">View listing →</AppText>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => router.push({
                pathname: '/admin/users',
                params: { highlightUid: report.sellerId },
              } as any)}
            >
              <AppText variant="button">View seller account →</AppText>
            </Pressable>

            <Pressable
              style={[styles.actionButton, styles.actionDestructive]}
              onPress={() => handleAction('listing_taken_down', 'actioned')}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={theme.colors.textOnAccent} />
              ) : (
                <AppText variant="button" style={{ color: theme.colors.textOnAccent }}>
                  Mark actioned — listing taken down
                </AppText>
              )}
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => handleAction('none', 'dismissed')}
              disabled={saving}
            >
              <AppText variant="button" tone="secondary">Dismiss report</AppText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.metaCard}>
            <MetaRow label="Action taken" value={report.actionTaken ?? 'none'} styles={styles} />
            {report.reviewedBy ? (
              <MetaRow label="Reviewed by" value={report.reviewedBy} styles={styles} />
            ) : null}
          </View>
        )}
      </ScrollView>
    </AppShell>
  );
}

function MetaRow({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.metaRow}>
      <AppText variant="caption" tone="muted" style={styles.metaLabel}>{label}</AppText>
      <AppText variant="bodySmall" style={styles.metaValue} numberOfLines={1}>{value}</AppText>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.md,
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    back: { marginBottom: theme.spacing.sm },
    metaCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: theme.spacing.sm,
    },
    metaLabel: { width: 90, flexShrink: 0 },
    metaValue: { flex: 1, color: theme.colors.textPrimary },
    detailsCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    actions: { gap: theme.spacing.sm },
    actionsTitle: { marginBottom: theme.spacing.xs },
    actionButton: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionDestructive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
  });
}
