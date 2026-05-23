import { AppText } from '@/src/components/ui/AppText';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { fetchAdminStats } from '@/src/features/admin/admin.api';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

type Stats = {
  pendingReports: number;
  flaggedThreads: number;
  openThreads: number;
};

export function AdminDashboardScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchAdminStats().then(setStats).catch(() => null);
  }, []);

  return (
    <AppShell showBottomBar={false} reserveBottomBarSpace={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="eyebrow" tone="accent">Admin</AppText>
        <AppText variant="pageHeading" style={styles.heading}>Moderation</AppText>

        {stats ? (
          <View style={styles.statsRow}>
            <StatCard label="Pending reports" value={stats.pendingReports} styles={styles} />
            <StatCard label="Flagged threads" value={stats.flaggedThreads} styles={styles} />
            <StatCard label="Open threads" value={stats.openThreads} styles={styles} />
          </View>
        ) : null}

        <AppText variant="sectionHeading" style={styles.sectionTitle}>Moderation</AppText>
        <NavCard
          title="Reports"
          description="Review user-submitted listing reports"
          onPress={() => router.push('/admin/reports' as any)}
          styles={styles}
        />
        <NavCard
          title="Threads"
          description="Manage buyer–seller message threads"
          onPress={() => router.push('/admin/threads' as any)}
          styles={styles}
        />

        <AppText variant="sectionHeading" style={styles.sectionTitle}>Content</AppText>
        <NavCard
          title="Listings"
          description="Search and moderate marketplace listings"
          onPress={() => router.push('/admin/listings' as any)}
          styles={styles}
        />

        <AppText variant="sectionHeading" style={styles.sectionTitle}>Accounts</AppText>
        <NavCard
          title="Users"
          description="Search accounts, restrict, or suspend"
          onPress={() => router.push('/admin/users' as any)}
          styles={styles}
        />
      </ScrollView>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  styles,
}: {
  label: string;
  value: number;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.statCard}>
      <AppText variant="pageHeading">{value}</AppText>
      <AppText variant="caption" tone="secondary">{label}</AppText>
    </View>
  );
}

function NavCard({
  title,
  description,
  onPress,
  styles,
}: {
  title: string;
  description: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Pressable style={styles.navCard} onPress={onPress}>
      <AppText variant="sectionHeading">{title}</AppText>
      <AppText variant="caption" tone="secondary">{description}</AppText>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.sm,
    },
    heading: {
      marginBottom: theme.spacing.sm,
    },
    statsRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    statCard: {
      flex: 1,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
      alignItems: 'center',
    },
    sectionTitle: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xs,
      color: theme.colors.textMuted,
    },
    navCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
  });
}
