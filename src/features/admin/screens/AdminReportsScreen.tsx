import { AppText } from '@/src/components/ui/AppText';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { subscribeToReports, updateReportStatus } from '@/src/features/admin/admin.api';
import type { AdminReport, ReportStatus } from '@/src/features/admin/admin.types';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

const FILTER_TABS: { key: ReportStatus | 'all'; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'reviewed', label: 'Reviewed' },
  { key: 'actioned', label: 'Actioned' },
  { key: 'all', label: 'All' },
];

export function AdminReportsScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const user = useAuthStore((state) => state.user);
  const [filter, setFilter] = useState<ReportStatus | 'all'>('pending');
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsub = subscribeToReports(
      filter,
      (data) => { setReports(data); setIsLoading(false); },
      () => setIsLoading(false)
    );
    return unsub;
  }, [filter]);

  async function handleDismiss(report: AdminReport) {
    if (!user) return;
    setActioning(report.id);
    try {
      await updateReportStatus(report.id, 'dismissed', 'none', user.uid);
    } finally {
      setActioning(null);
    }
  }

  async function handleAction(report: AdminReport) {
    router.push({
      pathname: '/admin/reports/[id]',
      params: { id: report.id },
    } as any);
  }

  return (
    <AppShell showBottomBar={false} reserveBottomBarSpace={false}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <AppText variant="button" tone="secondary">Back</AppText>
          </Pressable>
          <AppText variant="eyebrow" tone="accent">Admin</AppText>
          <AppText variant="pageHeading">Reports</AppText>
        </View>

        <View style={styles.filterRow}>
          {FILTER_TABS.map((tab) => (
            <Pressable
              key={tab.key}
              style={[styles.filterTab, filter === tab.key && styles.filterTabActive]}
              onPress={() => setFilter(tab.key)}
            >
              <AppText
                variant="caption"
                tone={filter === tab.key ? 'primary' : 'secondary'}
              >
                {tab.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.accent} />
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.center}>
            <AppText variant="body" tone="secondary">No {filter === 'all' ? '' : filter} reports.</AppText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {reports.map((report) => (
              <Pressable
                key={report.id}
                style={styles.reportCard}
                onPress={() => handleAction(report)}
              >
                <View style={styles.reportHeader}>
                  <View style={[styles.reasonBadge, styles[`reason_${report.reason}`]]}>
                    <AppText variant="caption">{report.reason}</AppText>
                  </View>
                  <AppText variant="caption" tone="muted">
                    {new Date(report.createdAtMs).toLocaleDateString()}
                  </AppText>
                </View>
                <AppText variant="bodySmall" style={styles.reportTitle} numberOfLines={1}>
                  {report.listingTitle}
                </AppText>
                {report.details ? (
                  <AppText variant="caption" tone="secondary" numberOfLines={2}>
                    {report.details}
                  </AppText>
                ) : null}
                {report.status === 'pending' ? (
                  <View style={styles.reportActions}>
                    <Pressable
                      style={styles.dismissButton}
                      onPress={() => handleDismiss(report)}
                      disabled={actioning === report.id}
                    >
                      {actioning === report.id ? (
                        <ActivityIndicator size="small" color={theme.colors.textMuted} />
                      ) : (
                        <AppText variant="caption" tone="secondary">Dismiss</AppText>
                      )}
                    </Pressable>
                    <Pressable
                      style={styles.reviewButton}
                      onPress={() => handleAction(report)}
                    >
                      <AppText variant="caption" style={{ color: theme.colors.textOnAccent }}>
                        Review
                      </AppText>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.statusBadge}>
                    <AppText variant="caption" tone="muted">{report.status}</AppText>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </AppShell>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    filterTab: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    filterTabActive: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.accent,
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.sm,
    },
    reportCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    reportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    reasonBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.surfaceElevated,
    },
    reason_copyright: { backgroundColor: '#FF4D4D22' },
    reason_inappropriate: { backgroundColor: '#FF9A0022' },
    reason_spam: { backgroundColor: '#8B5CF622' },
    reason_other: { backgroundColor: theme.colors.surfaceElevated },
    reportTitle: { fontSize: 15, color: theme.colors.textPrimary },
    reportActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    dismissButton: {
      flex: 1,
      minHeight: 36,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reviewButton: {
      flex: 1,
      minHeight: 36,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
  });
}
