import { AppText } from '@/src/components/ui/AppText';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { InterimFeatureSheet } from '@/src/components/ui/InterimFeatureSheet';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { getReadErrorCopy } from '@/src/config/backendStatus';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { useAccountStore } from '@/src/features/account/account.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useVaultProjects } from '@/src/features/vault/vault.hooks';
import type { VaultProject } from '@/src/features/vault/vault.types';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function HybridVaultListScreen() {
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const startupStatus = useAuthStore((state) => state.startupStatus);
  const user = useAuthStore((state) => state.user);
  const profile = useAccountStore((state) => state.profile);
  const uid = user?.uid ?? profile?.uid ?? null;
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  const query = useVaultProjects(uid, 48, { enabled: Boolean(uid) });

  return (
    <AppShell showBottomBar={false} reserveBottomBarSpace={false}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <AppText variant="eyebrow" tone="muted">Hybrid</AppText>
            <AppText variant="pageHeading">Vault</AppText>
          </View>
        </View>

        {query.isLoading ? (
          <LoadingState label="Loading projects..." />
        ) : query.isError ? (
          <ErrorState
            {...getReadErrorCopy(query.error, { subject: 'Vault projects', startupStatus })}
            onAction={() => query.refetch()}
          />
        ) : !query.data || query.data.length === 0 ? (
          <View style={styles.emptyState}>
            <AppText variant="sectionHeading">No vault projects yet</AppText>
            <AppText variant="body" tone="secondary" style={styles.emptyText}>
              Upload audio to your Vault, then come back here to edit metadata and promote to Studio.
            </AppText>
            <Pressable
              style={styles.emptyAction}
              onPress={() =>
                setNotice({
                  title: 'New vault project',
                  message: 'Audio upload to Vault is coming soon. Your existing projects will appear here once synced.',
                })
              }
            >
              <AppText variant="button">New project</AppText>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {query.data.map((project) => (
              <VaultProjectRow
                key={project.id}
                project={project}
                styles={styles}
                theme={theme}
              />
            ))}
          </ScrollView>
        )}

        <Pressable
          style={[styles.fab, { bottom: Math.max(insets.bottom, theme.spacing.lg) + theme.spacing.md }]}
          onPress={() =>
            setNotice({
              title: 'New vault project',
              message: 'Audio upload to Vault is coming soon. Existing projects sync automatically.',
            })
          }
        >
          <Plus size={27} color={theme.colors.textPrimary} strokeWidth={2.6} />
        </Pressable>
      </View>

      <InterimFeatureSheet
        visible={Boolean(notice)}
        title={notice?.title ?? ''}
        message={notice?.message ?? ''}
        onClose={() => setNotice(null)}
      />
    </AppShell>
  );
}

function VaultProjectRow({
  project,
  styles,
  theme,
}: {
  project: VaultProject;
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof useThemeTokens>;
}) {
  const isPromoted = project.lifecycleStatus === 'promoted';

  return (
    <View style={styles.row}>
      <View style={styles.rowArtwork}>
        {project.coverUrl ? (
          <Image source={{ uri: project.coverUrl }} style={styles.rowCover} />
        ) : (
          <View style={[styles.rowCover, styles.rowCoverPlaceholder]} />
        )}
      </View>

      <View style={styles.rowMeta}>
        <AppText variant="bodySmall" style={styles.rowTitle} numberOfLines={1}>
          {project.title}
        </AppText>
        <AppText variant="caption" tone="secondary" numberOfLines={1}>
          {project.artist}
        </AppText>
        {isPromoted ? (
          <View style={styles.promotedBadge}>
            <AppText variant="caption" tone="accent">Promoted</AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.rowActions}>
        <Pressable
          style={styles.rowActionButton}
          onPress={() =>
            router.push({
              pathname: '/hybrid/vault/edit/[id]',
              params: { id: project.id },
            } as any)
          }
        >
          <AppText variant="caption" tone="secondary">Edit</AppText>
        </Pressable>

        {isPromoted ? (
          <Pressable
            style={styles.rowActionButton}
            onPress={() => router.push('/hybrid/studio' as any)}
          >
            <AppText variant="caption" tone="accent">Studio</AppText>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.rowActionButton, styles.promoteButton]}
            onPress={() =>
              router.push({
                pathname: '/hybrid/vault/promote/[id]',
                params: { id: project.id },
              } as any)
            }
          >
            <AppText variant="caption" style={{ color: theme.colors.textOnAccent }}>
              Promote
            </AppText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    list: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 120,
      gap: theme.spacing.sm,
    },
    emptyState: {
      flex: 1,
      paddingHorizontal: theme.spacing.xxl,
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    emptyText: {
      lineHeight: 21,
    },
    emptyAction: {
      marginTop: theme.spacing.sm,
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.md,
    },
    rowArtwork: {
      flexShrink: 0,
    },
    rowCover: {
      width: 52,
      height: 52,
      borderRadius: theme.radius.md,
    },
    rowCoverPlaceholder: {
      backgroundColor: theme.colors.surfaceElevated,
    },
    rowMeta: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    rowTitle: {
      fontSize: 15,
      lineHeight: 19,
      color: theme.colors.textPrimary,
    },
    promotedBadge: {
      marginTop: 2,
    },
    rowActions: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      flexShrink: 0,
    },
    rowActionButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 30,
    },
    promoteButton: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    fab: {
      position: 'absolute',
      right: theme.spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      ...theme.shadows.md,
    },
  });
}
