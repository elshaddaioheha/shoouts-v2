import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import { InterimFeatureSheet } from '@/src/components/ui/InterimFeatureSheet';
import { getReadErrorCopy } from '@/src/config/backendStatus';
import { canAccessExperience } from '@/src/features/access/access.helpers';
import { useAccountStore } from '@/src/features/account/account.store';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { MiniPlayerBar } from '@/src/features/player/components/MiniPlayerBar';
import { usePlayerStore } from '@/src/features/player/player.store';
import type { PlayerTrack } from '@/src/features/player/player.types';
import { useVaultProjects } from '@/src/features/vault/vault.hooks';
import type { VaultProject } from '@/src/features/vault/vault.types';
import { useThemeTokens } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  AudioWaveform,
  FolderPlus,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VAULT_PLACEHOLDER_TRACK: PlayerTrack = {
  id: 'vault-placeholder-flourish-spirit',
  title: 'Flourish Spirit divine',
  artist: 'yunnowobe',
  projectTitle: 'untitled project',
  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  artworkGradient: ['#E65AD4', '#FFB7D6'],
  surface: 'vault',
};
const VAULT_FAB_SIZE = 64;
const VAULT_DOCK_GAP = 10;

type VaultMode = 'home' | 'folders' | 'record' | 'shared' | 'more';
type VaultNotice = {
  title: string;
  message: string;
  primaryLabel?: string;
  onPrimaryPress?: () => void;
};

const MODE_COPY: Record<VaultMode, { title: string; eyebrow: string }> = {
  home: { title: 'Projects', eyebrow: 'Vault' },
  folders: { title: 'Folders', eyebrow: 'Vault' },
  record: { title: 'Audio', eyebrow: 'Vault' },
  shared: { title: 'Shared', eyebrow: 'Vault' },
  more: { title: 'Settings', eyebrow: 'Vault' },
};

export function VaultHomeScreen() {
  return <VaultMinimalScreen mode="home" />;
}

export function VaultFoldersScreen() {
  return <VaultMinimalScreen mode="folders" />;
}

export function VaultRecordScreen() {
  return <VaultMinimalScreen mode="record" />;
}

export function VaultSharedScreen() {
  return <VaultMinimalScreen mode="shared" />;
}

export function VaultMoreScreen() {
  return <VaultMinimalScreen mode="more" />;
}

function VaultMinimalScreen({ mode }: { mode: VaultMode }) {
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.bottom);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState<VaultNotice | null>(null);
  const user = useAuthStore((state) => state.user);
  const startupStatus = useAuthStore((state) => state.startupStatus);
  const role = useAccountStore((state) => state.role);
  const track = usePlayerStore((state) => state.track);
  const visible = usePlayerStore((state) => state.visible);
  const snapshot = usePlayerStore((state) => state.snapshot);
  const loadTrack = usePlayerStore((state) => state.loadTrack);
  const togglePlayback = usePlayerStore((state) => state.togglePlayback);
  const openFullPlayer = usePlayerStore((state) => state.openFullPlayer);
  const hasVaultMiniPlayer = visible && track?.surface === 'vault';
  const modeCopy = MODE_COPY[mode];
  const hasVaultAccess = canAccessExperience(role, 'vault');
  const shouldReadVaultProjects = mode === 'home' && hasVaultAccess && Boolean(user?.uid);
  const vaultProjectsQuery = useVaultProjects(user?.uid ?? null, 24, {
    enabled: shouldReadVaultProjects,
  });
  const vaultProjectsData = vaultProjectsQuery.data;
  const primaryVaultTrack = useMemo(() => {
    const primaryProject = vaultProjectsData?.[0];
    if (!primaryProject) {
      return VAULT_PLACEHOLDER_TRACK;
    }

    return mapVaultProjectToTrack(primaryProject, theme.experience.gradient);
  }, [theme.experience.gradient, vaultProjectsData]);
  const playableVaultTracks = useMemo(
    () =>
      (vaultProjectsData ?? [])
        .map((project) => mapVaultProjectToTrack(project, theme.experience.gradient))
        .filter((projectTrack) => Boolean(projectTrack.audioUrl)),
    [theme.experience.gradient, vaultProjectsData]
  );
  const vaultProjectCount = vaultProjectsData?.length ?? 0;
  const hasSyncedProject = vaultProjectCount > 0;
  const vaultReadErrorCopy = vaultProjectsQuery.isError
    ? getReadErrorCopy(vaultProjectsQuery.error, {
        subject: 'Vault projects',
        startupStatus,
      })
    : null;
  const isPrimaryTrackActive =
    visible &&
    track?.surface === 'vault' &&
    track?.id === primaryVaultTrack.id &&
    track?.audioUrl === primaryVaultTrack.audioUrl;
  const isPlaying = isPrimaryTrackActive && snapshot.isPlaying;
  const projectTitleLabel = primaryVaultTrack.projectTitle ?? primaryVaultTrack.title;
  const projectArtistLabel = primaryVaultTrack.artist;

  function showVaultPreviewNotice() {
    setMenuOpen(false);
    setNotice({
      title: 'Vault plan required',
      message:
        'Playback, folders, and private project actions are available when your plan includes Vault.',
      primaryLabel: 'View plans',
      onPrimaryPress: () => {
        setNotice(null);
        router.push({
          pathname: '/settings/subscriptions',
          params: { experience: 'vault', source: 'vault' },
        } as any);
      },
    });
  }

  function handleToggleProjectPlayback() {
    if (!hasVaultAccess) {
      showVaultPreviewNotice();
      return;
    }

    if (!primaryVaultTrack.audioUrl) {
      setNotice({
        title: 'No preview audio yet',
        message:
          'This project does not have preview audio yet. Add audio, then refresh Vault.',
      });
      return;
    }

    if (!isPrimaryTrackActive) {
      const queue = playableVaultTracks.length > 0 ? playableVaultTracks : [primaryVaultTrack];
      const startIndex = Math.max(
        0,
        queue.findIndex((entry) => entry.id === primaryVaultTrack.id)
      );

      loadTrack(primaryVaultTrack, {
        autoPlay: true,
        queue,
        startIndex,
      });
      return;
    }

    togglePlayback();
  }

  function handleOpenProject() {
    if (!hasVaultAccess) {
      showVaultPreviewNotice();
      return;
    }

    if (!primaryVaultTrack.audioUrl) {
      setNotice({
        title: 'No preview audio yet',
        message:
          'This project does not have preview audio yet. Add audio, then refresh Vault.',
      });
      return;
    }

    if (!isPrimaryTrackActive) {
      const queue = playableVaultTracks.length > 0 ? playableVaultTracks : [primaryVaultTrack];
      const startIndex = Math.max(
        0,
        queue.findIndex((entry) => entry.id === primaryVaultTrack.id)
      );

      loadTrack(primaryVaultTrack, {
        autoPlay: false,
        queue,
        startIndex,
      });
    }
    openFullPlayer();
  }

  function handleAction(action: 'audio' | 'project' | 'folder') {
    setMenuOpen(false);

    if (!hasVaultAccess) {
      showVaultPreviewNotice();
      return;
    }

    if (action === 'audio') {
      router.push('/vault/record' as any);
      return;
    }

    if (action === 'folder') {
      router.push('/vault/folders' as any);
      return;
    }

    router.push('/vault' as any);
    setNotice({
      title: 'Project creation is coming soon',
      message:
        'The Vault project view is ready. New project save is the next backend step.',
    });
  }

  return (
    <AppShell showBottomBar={false} reserveBottomBarSpace={false} showStartupNotice={false}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <AppText variant="eyebrow" style={styles.headerEyebrow}>
              {modeCopy.eyebrow}
            </AppText>
            <AppText variant="pageHeading" style={styles.headerTitle}>
              {modeCopy.title}
            </AppText>
            {!hasVaultAccess ? (
              <AppText variant="caption" tone="accent">
                Preview workspace
              </AppText>
            ) : hasSyncedProject ? (
              <AppText variant="caption" tone="secondary">
                {vaultProjectCount} project{vaultProjectCount === 1 ? '' : 's'} synced
              </AppText>
            ) : null}
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={styles.headerIconButton}
              onPress={() =>
                setNotice({
                  title: 'Vault search',
                  message:
                    'Project search is coming soon. Vault project sync is already active.',
                })
              }
            >
              <AppIcon name="market" size="md" tone="secondary" stroke="bold" />
            </Pressable>
            <Pressable
              style={styles.headerIconButton}
              onPress={() =>
                router.push({
                  pathname: '/settings/profile',
                  params: { source: 'vault' },
                } as any)
              }
            >
              <AppIcon name="profile" size="md" tone="secondary" stroke="bold" />
            </Pressable>
          </View>
        </View>

        <View style={styles.projectWrap}>
          {mode === 'home' && hasVaultAccess && !user ? (
            <View style={styles.emptyStateCard}>
              <AppText variant="sectionHeading">Sign in to load your Vault projects</AppText>
              <AppText variant="bodySmall" tone="secondary" style={styles.emptyStateText}>
                Vault sync needs an active account session.
              </AppText>
              <Pressable
                style={styles.emptyAction}
                onPress={() => router.push('/(auth)/login' as any)}
              >
                <AppText variant="button">Go to login</AppText>
              </Pressable>
            </View>
          ) : mode === 'home' && shouldReadVaultProjects && vaultProjectsQuery.isLoading ? (
            <LoadingState label="Loading Vault projects..." />
          ) : mode === 'home' && shouldReadVaultProjects && vaultProjectsQuery.isError ? (
            <ErrorState
              title={vaultReadErrorCopy?.title ?? 'Could not load Vault projects'}
              message={vaultReadErrorCopy?.message ?? 'Please retry after checking backend access.'}
              onAction={() => vaultProjectsQuery.refetch()}
            />
          ) : mode === 'home' &&
            shouldReadVaultProjects &&
            !vaultProjectsQuery.isLoading &&
            vaultProjectCount === 0 ? (
            <View style={styles.emptyStateCard}>
              <AppText variant="sectionHeading">No Vault projects yet</AppText>
              <AppText variant="bodySmall" tone="secondary" style={styles.emptyStateText}>
                Create your first private project or upload draft audio to start your Vault library.
              </AppText>
              <Pressable style={styles.emptyAction} onPress={() => setMenuOpen(true)}>
                <AppText variant="button">Open quick actions</AppText>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.projectCard} onPress={handleOpenProject}>
              <LinearGradient
                colors={primaryVaultTrack.artworkGradient ?? theme.experience.gradient}
                style={styles.projectArtwork}
              >
                <Pressable style={styles.projectPlayButton} onPress={handleToggleProjectPlayback}>
                  {isPlaying ? (
                    <Pause size={22} color="#FFFFFF" fill="#FFFFFF" />
                  ) : (
                    <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                  )}
                </Pressable>
              </LinearGradient>

              <View style={styles.projectCopy}>
                <AppText variant="sectionHeading" style={styles.projectTitle} numberOfLines={1}>
                  {projectTitleLabel}
                </AppText>
                <View style={styles.projectMetaRow}>
                  <AppText variant="bodySmall" style={styles.projectArtist} numberOfLines={1}>
                    {projectArtistLabel}
                  </AppText>
                  <MoreHorizontal size={22} color={theme.colors.textMuted} />
                </View>
              </View>
            </Pressable>
          )}
        </View>

        <View style={styles.bottomDock} pointerEvents="box-none">
          {menuOpen ? (
            <View
              style={[
                styles.quickMenu,
                hasVaultMiniPlayer ? styles.quickMenuRaised : styles.quickMenuCentered,
              ]}
            >
              <QuickAction
                label="Audio"
                icon={<AudioWaveform size={23} color={theme.colors.textPrimary} strokeWidth={2.4} />}
                onPress={() => handleAction('audio')}
              />
              <QuickAction
                label="New project"
                icon={<Plus size={23} color={theme.colors.textPrimary} strokeWidth={2.4} />}
                onPress={() => handleAction('project')}
              />
              <QuickAction
                label="New folder"
                icon={<FolderPlus size={23} color={theme.colors.textPrimary} strokeWidth={2.4} />}
                onPress={() => handleAction('folder')}
              />
            </View>
          ) : null}

          <View style={hasVaultMiniPlayer ? styles.playerActionRow : styles.actionOnlyRow}>
            {hasVaultMiniPlayer ? <MiniPlayerBar variant="vault" style={styles.vaultMiniPlayer} /> : null}
            <Pressable
              style={styles.floatingPlus}
              onPress={() => {
                if (!hasVaultAccess) {
                  showVaultPreviewNotice();
                  return;
                }

                setMenuOpen((current) => !current);
              }}
            >
              <Plus size={27} color={theme.colors.textPrimary} strokeWidth={2.6} />
            </Pressable>
          </View>
        </View>
      </View>

      <InterimFeatureSheet
        visible={Boolean(notice)}
        title={notice?.title ?? ''}
        message={notice?.message ?? ''}
        primaryLabel={notice?.primaryLabel}
        onPrimaryPress={notice?.onPrimaryPress}
        onClose={() => setNotice(null)}
      />
    </AppShell>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  const theme = useThemeTokens();
  const styles = createStyles(theme, 0);

  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickIcon}>{icon}</View>
      <AppText variant="bodySmall" style={styles.quickLabel}>
        {label}
      </AppText>
    </Pressable>
  );
}

function mapVaultProjectToTrack(
  project: VaultProject,
  fallbackGradient: readonly [string, string]
): PlayerTrack {
  return {
    id: project.id,
    title: project.title,
    artist: project.artist,
    sellerId: project.ownerId,
    projectTitle: project.title,
    audioUrl: project.audioUrl,
    coverUrl: project.coverUrl,
    artworkGradient: fallbackGradient,
    surface: 'vault',
  };
}

function createStyles(theme: ReturnType<typeof useThemeTokens>, bottomInset: number) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: Math.max(bottomInset, theme.spacing.lg),
    },
    header: {
      minHeight: 54,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    headerEyebrow: {
      color: theme.colors.textMuted,
      marginBottom: 1,
    },
    headerTitle: {
      color: theme.colors.textPrimary,
      fontSize: 25,
      lineHeight: 30,
      letterSpacing: 0,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    headerIconButton: {
      width: 34,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
    },
    projectWrap: {
      flex: 1,
      alignItems: 'center',
      paddingTop: theme.spacing.xxl,
    },
    projectCard: {
      width: 190,
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    projectArtwork: {
      width: 158,
      height: 158,
      borderRadius: 18,
      position: 'relative',
    },
    projectPlayButton: {
      position: 'absolute',
      right: -5,
      bottom: -5,
      width: 50,
      height: 50,
      borderRadius: 14,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
    },
    projectCopy: {
      width: '100%',
      gap: theme.spacing.xs,
    },
    projectTitle: {
      color: theme.colors.textPrimary,
      fontSize: 19,
      lineHeight: 24,
      letterSpacing: 0,
      textAlign: 'left',
    },
    projectMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    projectArtist: {
      color: theme.colors.textMuted,
      fontSize: 16,
      lineHeight: 20,
      flex: 1,
    },
    emptyStateCard: {
      width: '100%',
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    emptyStateText: {
      lineHeight: 19,
    },
    emptyAction: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.sm,
    },
    bottomDock: {
      position: 'absolute',
      left: theme.spacing.md,
      right: theme.spacing.md,
      bottom: Math.max(bottomInset, theme.spacing.md),
      alignItems: 'flex-end',
    },
    actionOnlyRow: {
      width: '100%',
      alignItems: 'center',
    },
    playerActionRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: VAULT_DOCK_GAP,
    },
    vaultMiniPlayer: {
      flex: 1,
      minWidth: 0,
    },
    floatingPlus: {
      width: VAULT_FAB_SIZE,
      height: VAULT_FAB_SIZE,
      borderRadius: VAULT_FAB_SIZE / 2,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      flexShrink: 0,
      ...theme.shadows.md,
    },
    quickMenu: {
      position: 'absolute',
      right: theme.spacing.xs,
      bottom: 76,
      width: 184,
      borderRadius: 22,
      backgroundColor: theme.colors.surfaceElevated,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      ...theme.shadows.md,
    },
    quickMenuRaised: {
      bottom: 84,
    },
    quickMenuCentered: {
      right: undefined,
      alignSelf: 'center',
    },
    quickAction: {
      minHeight: 30,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    quickIcon: {
      width: 28,
      alignItems: 'center',
    },
    quickLabel: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      lineHeight: 23,
    },
  });
}
