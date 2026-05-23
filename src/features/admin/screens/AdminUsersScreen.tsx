import { AppText } from '@/src/components/ui/AppText';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { searchAdminUsers } from '@/src/features/admin/admin.api';
import type { AdminUser } from '@/src/features/admin/admin.types';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export function AdminUsersScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      searchAdminUsers(query)
        .then(setUsers)
        .catch(() => null)
        .finally(() => setIsLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AppShell showBottomBar={false} reserveBottomBarSpace={false}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <AppText variant="button" tone="secondary">Back</AppText>
          </Pressable>
          <AppText variant="eyebrow" tone="accent">Admin</AppText>
          <AppText variant="pageHeading">Users</AppText>
        </View>

        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by email, UID, or name…"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        {isLoading ? (
          <View style={styles.center}><ActivityIndicator color={theme.colors.accent} /></View>
        ) : users.length === 0 ? (
          <View style={styles.center}>
            <AppText variant="body" tone="secondary">No users found.</AppText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {users.map((user) => (
              <Pressable
                key={user.uid}
                style={styles.userCard}
                onPress={() =>
                  router.push({
                    pathname: '/admin/user/[id]',
                    params: { id: user.uid },
                  } as any)
                }
              >
                <View style={styles.userHeader}>
                  <AppText variant="bodySmall" style={styles.userName} numberOfLines={1}>
                    {user.displayName ?? 'No name'}
                  </AppText>
                  <View style={styles.badgeRow}>
                    {user.isSuspended ? (
                      <View style={[styles.badge, styles.badgeSuspended]}>
                        <AppText variant="caption" style={{ color: '#FF4D4D' }}>suspended</AppText>
                      </View>
                    ) : user.isRestricted ? (
                      <View style={[styles.badge, styles.badgeRestricted]}>
                        <AppText variant="caption" style={{ color: '#FF9A00' }}>restricted</AppText>
                      </View>
                    ) : null}
                  </View>
                </View>
                <AppText variant="caption" tone="secondary" numberOfLines={1}>
                  {user.email ?? 'No email'}
                </AppText>
                <AppText variant="caption" tone="muted">
                  {user.role} · {user.uid.slice(0, 12)}…
                </AppText>
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
    searchWrap: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    searchInput: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      color: theme.colors.textPrimary,
      fontSize: 15,
      minHeight: theme.layout.minTouchTarget,
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.sm,
    },
    userCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    userHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    userName: { flex: 1, fontSize: 15, color: theme.colors.textPrimary },
    badgeRow: { flexDirection: 'row', gap: theme.spacing.xs },
    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
    },
    badgeSuspended: { borderColor: '#FF4D4D44' },
    badgeRestricted: { borderColor: '#FF9A0044' },
  });
}
