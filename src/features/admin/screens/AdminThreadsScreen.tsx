import { AppText } from '@/src/components/ui/AppText';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { subscribeToAdminThreads } from '@/src/features/admin/admin.api';
import type { ChatThread, ThreadStatus } from '@/src/features/chat/chat.types';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

const FILTER_TABS: { key: ThreadStatus | 'all'; label: string }[] = [
  { key: 'flagged', label: 'Flagged' },
  { key: 'open', label: 'Open' },
  { key: 'closed', label: 'Closed' },
  { key: 'all', label: 'All' },
];

export function AdminThreadsScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const [filter, setFilter] = useState<ThreadStatus | 'all'>('flagged');
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsub = subscribeToAdminThreads(
      filter,
      (data) => { setThreads(data); setIsLoading(false); },
      () => setIsLoading(false)
    );
    return unsub;
  }, [filter]);

  return (
    <AppShell showBottomBar={false} reserveBottomBarSpace={false}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <AppText variant="button" tone="secondary">Back</AppText>
          </Pressable>
          <AppText variant="eyebrow" tone="accent">Admin</AppText>
          <AppText variant="pageHeading">Threads</AppText>
        </View>

        <View style={styles.filterRow}>
          {FILTER_TABS.map((tab) => (
            <Pressable
              key={tab.key}
              style={[styles.filterTab, filter === tab.key && styles.filterTabActive]}
              onPress={() => setFilter(tab.key)}
            >
              <AppText variant="caption" tone={filter === tab.key ? 'primary' : 'secondary'}>
                {tab.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.accent} />
          </View>
        ) : threads.length === 0 ? (
          <View style={styles.center}>
            <AppText variant="body" tone="secondary">No {filter === 'all' ? '' : filter} threads.</AppText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {threads.map((thread) => (
              <Pressable
                key={thread.id}
                style={styles.threadCard}
                onPress={() =>
                  router.push({
                    pathname: '/admin/thread/[id]',
                    params: { id: thread.id },
                  } as any)
                }
              >
                <View style={styles.threadHeader}>
                  <AppText variant="bodySmall" style={styles.threadTitle} numberOfLines={1}>
                    {thread.listingTitle}
                  </AppText>
                  <StatusBadge status={thread.status} styles={styles} theme={theme} />
                </View>
                <AppText variant="caption" tone="secondary" numberOfLines={1}>
                  {thread.lastMessageText}
                </AppText>
                <View style={styles.threadMeta}>
                  <AppText variant="caption" tone="muted">
                    Buyer: {thread.buyerId.slice(0, 8)}…
                  </AppText>
                  <AppText variant="caption" tone="muted">
                    Seller: {thread.sellerId.slice(0, 8)}…
                  </AppText>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </AppShell>
  );
}

function StatusBadge({
  status,
  styles,
  theme,
}: {
  status: string;
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof useThemeTokens>;
}) {
  const color =
    status === 'flagged'
      ? '#FF4D4D'
      : status === 'closed'
      ? theme.colors.textMuted
      : theme.colors.accent;
  return (
    <View style={[styles.statusBadge, { borderColor: color + '44' }]}>
      <AppText variant="caption" style={{ color }}>{status}</AppText>
    </View>
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
    threadCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    threadHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    threadTitle: { flex: 1, fontSize: 15, color: theme.colors.textPrimary },
    threadMeta: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.xs,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      flexShrink: 0,
    },
  });
}
