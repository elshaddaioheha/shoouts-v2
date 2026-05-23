import { AppText } from '@/src/components/ui/AppText';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import {
  fetchAdminUser,
  restrictUser,
  suspendUser,
  unrestrictUser,
  unsuspendUser,
} from '@/src/features/admin/admin.api';
import type { AdminUser } from '@/src/features/admin/admin.types';
import { useThemeTokens } from '@/src/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export function AdminUserDetailScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchAdminUser(id)
      .then(setUser)
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, [id]);

  async function toggleRestricted() {
    if (!user || !id) return;
    setActioning('restrict');
    setError(null);
    try {
      if (user.isRestricted) {
        await unrestrictUser(id);
        setUser((u) => u ? { ...u, isRestricted: false } : u);
      } else {
        await restrictUser(id);
        setUser((u) => u ? { ...u, isRestricted: true } : u);
      }
    } catch {
      setError('Action failed. Please try again.');
    } finally {
      setActioning(null);
    }
  }

  async function toggleSuspended() {
    if (!user || !id) return;
    setActioning('suspend');
    setError(null);
    try {
      if (user.isSuspended) {
        await unsuspendUser(id);
        setUser((u) => u ? { ...u, isSuspended: false } : u);
      } else {
        await suspendUser(id);
        setUser((u) => u ? { ...u, isSuspended: true } : u);
      }
    } catch {
      setError('Action failed. Please try again.');
    } finally {
      setActioning(null);
    }
  }

  if (isLoading) {
    return (
      <AppShell showBottomBar={false} reserveBottomBarSpace={false}>
        <View style={styles.center}><ActivityIndicator color={theme.colors.accent} /></View>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell showBottomBar={false} reserveBottomBarSpace={false}>
        <View style={styles.center}>
          <AppText variant="sectionHeading">User not found</AppText>
          <Pressable onPress={() => router.back()}>
            <AppText variant="button" tone="secondary">Back</AppText>
          </Pressable>
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

        <AppText variant="eyebrow" tone="accent">User</AppText>
        <AppText variant="pageHeading" numberOfLines={1}>
          {user.displayName ?? user.email ?? user.uid}
        </AppText>

        <View style={styles.metaCard}>
          <MetaRow label="UID" value={user.uid} />
          <MetaRow label="Email" value={user.email ?? 'None'} />
          <MetaRow label="Role" value={user.role} />
          <MetaRow label="Restricted" value={user.isRestricted ? 'Yes' : 'No'} />
          <MetaRow label="Suspended" value={user.isSuspended ? 'Yes' : 'No'} />
        </View>

        {error ? (
          <AppText variant="caption" tone="secondary">{error}</AppText>
        ) : null}

        <View style={styles.actions}>
          <AppText variant="sectionHeading" style={styles.actionsTitle}>Account actions</AppText>

          <ActionRow
            label={user.isRestricted ? 'Remove restriction' : 'Restrict account'}
            description={
              user.isRestricted
                ? 'Unhides listings from marketplace.'
                : 'Hides all listings from marketplace. User can still log in.'
            }
            loading={actioning === 'restrict'}
            onPress={toggleRestricted}
            styles={styles}
            theme={theme}
            variant={user.isRestricted ? 'default' : 'warning'}
          />

          <ActionRow
            label={user.isSuspended ? 'Unsuspend account' : 'Suspend account'}
            description={
              user.isSuspended
                ? 'Re-enables account access.'
                : 'Blocks app access on next startup via suspended claim.'
            }
            loading={actioning === 'suspend'}
            onPress={toggleSuspended}
            styles={styles}
            theme={theme}
            variant={user.isSuspended ? 'default' : 'danger'}
          />

          <Pressable
            style={styles.linkButton}
            onPress={() =>
              router.push({
                pathname: '/admin/listings',
                params: { ownerUid: user.uid },
              } as any)
            }
          >
            <AppText variant="button" tone="accent">View listings →</AppText>
          </Pressable>
        </View>
      </ScrollView>
    </AppShell>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  const theme = useThemeTokens();
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline' }}>
      <AppText variant="caption" tone="muted" style={{ width: 80, flexShrink: 0 }}>{label}</AppText>
      <AppText variant="caption" style={{ flex: 1, color: theme.colors.textPrimary }} numberOfLines={1}>{value}</AppText>
    </View>
  );
}

function ActionRow({
  label,
  description,
  loading,
  onPress,
  styles,
  theme,
  variant,
}: {
  label: string;
  description: string;
  loading: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof useThemeTokens>;
  variant: 'default' | 'warning' | 'danger';
}) {
  const borderColor =
    variant === 'danger' ? '#FF4D4D55'
    : variant === 'warning' ? '#FF9A0055'
    : theme.colors.cardBorder;
  const textColor =
    variant === 'danger' ? '#FF4D4D'
    : variant === 'warning' ? '#FF9A00'
    : theme.colors.textPrimary;

  return (
    <Pressable
      style={[styles.actionCard, { borderColor }]}
      onPress={onPress}
      disabled={loading}
    >
      <View style={styles.actionCardHeader}>
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <AppText variant="button" style={{ color: textColor }}>{label}</AppText>
        )}
      </View>
      <AppText variant="caption" tone="muted">{description}</AppText>
    </Pressable>
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
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md },
    back: { marginBottom: theme.spacing.sm },
    metaCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    actions: { gap: theme.spacing.sm },
    actionsTitle: { marginBottom: theme.spacing.xs },
    actionCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    actionCardHeader: {
      minHeight: 24,
      justifyContent: 'center',
    },
    linkButton: {
      minHeight: theme.layout.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
