import { AppText } from '@/src/components/ui/AppText';
import { InterimFeatureSheet } from '@/src/components/ui/InterimFeatureSheet';
import { MiniPlayerBar } from '@/src/features/player/components/MiniPlayerBar';
import { usePlayerStore } from '@/src/features/player/player.store';
import type { PlayerTrack } from '@/src/features/player/player.types';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Bell,
  FolderPlus,
  MoreHorizontal,
  AudioWaveform,
  Pause,
  Play,
  Plus,
  Search,
  User,
} from 'lucide-react-native';
import { useState } from 'react';
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

type VaultMode = 'home' | 'folders' | 'record' | 'shared' | 'more';

const MODE_COPY: Record<VaultMode, { title: string; eyebrow: string }> = {
  home: { title: '[untitled]', eyebrow: 'Vault' },
  folders: { title: '[folders]', eyebrow: 'New folder' },
  record: { title: '[audio]', eyebrow: 'Audio' },
  shared: { title: '[shared]', eyebrow: 'Link access' },
  more: { title: '[settings]', eyebrow: 'Workspace' },
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
  const styles = createStyles(theme, insets.top, insets.bottom);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  const track = usePlayerStore((state) => state.track);
  const visible = usePlayerStore((state) => state.visible);
  const snapshot = usePlayerStore((state) => state.snapshot);
  const loadTrack = usePlayerStore((state) => state.loadTrack);
  const togglePlayback = usePlayerStore((state) => state.togglePlayback);
  const openFullPlayer = usePlayerStore((state) => state.openFullPlayer);
  const hasMiniPlayer = visible;
  const isPlaceholderTrackActive = visible && track?.id === VAULT_PLACEHOLDER_TRACK.id;
  const isPlaying = isPlaceholderTrackActive && snapshot.isPlaying;
  const modeCopy = MODE_COPY[mode];

  function handleToggleProjectPlayback() {
    if (!isPlaceholderTrackActive) {
      loadTrack(VAULT_PLACEHOLDER_TRACK, { autoPlay: true });
      return;
    }

    togglePlayback();
  }

  function handleOpenProject() {
    if (!isPlaceholderTrackActive) {
      loadTrack(VAULT_PLACEHOLDER_TRACK, { autoPlay: false });
    }
    openFullPlayer();
  }

  function handleAction(action: 'audio' | 'project' | 'folder') {
    setMenuOpen(false);

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
      title: 'Project creation is next',
      message: 'The Vault project surface is ready. Real project writes will connect after private storage rules are in place.',
    });
  }

  return (
    <AppShell
      showSwitcher={false}
      showBottomBar={false}
      reserveBottomBarSpace={false}
      showStartupNotice={false}
    >
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <AppText variant="eyebrow" style={styles.headerEyebrow}>
              {modeCopy.eyebrow}
            </AppText>
            <AppText variant="pageHeading" style={styles.headerTitle}>
              {modeCopy.title}
            </AppText>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={styles.headerIconButton}
              onPress={() =>
                setNotice({
                  title: 'Vault notifications',
                  message: 'Vault alerts stay local until private file writes and collaborator events are connected.',
                })
              }
            >
              <Bell size={23} color="#FFFFFF" fill="#FFFFFF" />
            </Pressable>
            <Pressable
              style={styles.headerIconButton}
              onPress={() =>
                setNotice({
                  title: 'Vault search',
                  message: 'Search will index private projects after Vault documents are stored in Firestore.',
                })
              }
            >
              <Search size={24} color="#FFFFFF" strokeWidth={2.6} />
            </Pressable>
            <Pressable style={styles.headerIconButton} onPress={() => router.push('/vault/more' as any)}>
              <User size={24} color="#FFFFFF" fill="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.projectWrap}>
          <Pressable style={styles.projectCard} onPress={handleOpenProject}>
            <LinearGradient
              colors={VAULT_PLACEHOLDER_TRACK.artworkGradient ?? theme.experience.gradient}
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
                untitled project
              </AppText>
              <View style={styles.projectMetaRow}>
                <AppText variant="bodySmall" style={styles.projectArtist} numberOfLines={1}>
                  yunnowobe
                </AppText>
                <MoreHorizontal size={22} color="rgba(255,255,255,0.48)" />
              </View>
            </View>
          </Pressable>
        </View>

        <View style={styles.bottomDock} pointerEvents="box-none">
          {menuOpen ? (
            <View
              style={[
                styles.quickMenu,
                hasMiniPlayer ? styles.quickMenuRaised : styles.quickMenuCentered,
              ]}
            >
              <QuickAction
                label="Audio"
                icon={<AudioWaveform size={23} color="#FFFFFF" strokeWidth={2.4} />}
                onPress={() => handleAction('audio')}
              />
              <QuickAction
                label="New project"
                icon={<Plus size={23} color="#FFFFFF" strokeWidth={2.4} />}
                onPress={() => handleAction('project')}
              />
              <QuickAction
                label="New folder"
                icon={<FolderPlus size={23} color="#FFFFFF" strokeWidth={2.4} />}
                onPress={() => handleAction('folder')}
              />
            </View>
          ) : null}

          <View style={hasMiniPlayer ? styles.playerActionRow : styles.actionOnlyRow}>
            {hasMiniPlayer ? <MiniPlayerBar variant="vault" style={styles.vaultMiniPlayer} /> : null}
            <Pressable
              style={styles.floatingPlus}
              onPress={() => setMenuOpen((current) => !current)}
            >
              <Plus size={27} color="#FFFFFF" strokeWidth={2.6} />
            </Pressable>
          </View>
        </View>
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
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickIcon}>{icon}</View>
      <AppText variant="bodySmall" style={styles.quickLabel}>
        {label}
      </AppText>
    </Pressable>
  );
}

function createStyles(
  theme: ReturnType<typeof useThemeTokens>,
  topInset: number,
  bottomInset: number
) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: Math.max(topInset, theme.spacing.lg),
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
      color: 'rgba(255,255,255,0.48)',
      marginBottom: 1,
    },
    headerTitle: {
      color: '#FFFFFF',
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
      backgroundColor: '#4A4A4A',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.06)',
    },
    projectCopy: {
      width: '100%',
      gap: theme.spacing.xs,
    },
    projectTitle: {
      color: '#FFFFFF',
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
      color: 'rgba(255,255,255,0.48)',
      fontSize: 16,
      lineHeight: 20,
      flex: 1,
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
      gap: theme.spacing.sm,
    },
    vaultMiniPlayer: {
      flex: 1,
    },
    floatingPlus: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#303030',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      ...theme.shadows.md,
    },
    quickMenu: {
      position: 'absolute',
      right: theme.spacing.xs,
      bottom: 76,
      width: 184,
      borderRadius: 22,
      backgroundColor: '#505050',
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.lg,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
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
      color: '#FFFFFF',
      fontSize: 18,
      lineHeight: 23,
    },
  });
}
