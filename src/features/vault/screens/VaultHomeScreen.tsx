import { getVaultLimits } from '@/src/features/access/access.helpers';
import { useAccountStore } from '@/src/features/account/account.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { WorkspaceShellScreen } from '@/src/features/navigation/components/WorkspaceShellScreen';
import { Alert } from 'react-native';

function comingSoon(feature: string) {
  Alert.alert('Coming soon', `${feature} will be connected after shell stabilization.`);
}

export function VaultHomeScreen() {
  const profile = useAccountStore((state) => state.profile);
  const role = useAccountStore((state) => state.role);
  const limits = getVaultLimits(role);
  const storageUsed = profile?.usage.vaultStorageUsedBytes ?? 0;
  const uploadCount = profile?.usage.vaultUploadCount ?? 0;

  return (
    <AppShell>
      <WorkspaceShellScreen
        experience="vault"
        eyebrow="Vault"
        title="Private workspace"
        subtitle="Capture ideas, keep files private, and prepare projects before publishing."
        metrics={[
          {
            label: 'Storage used',
            value: formatBytes(storageUsed),
            helper: `${limits.vaultStorageGb} GB included`,
          },
          {
            label: 'Private uploads',
            value: `${uploadCount}`,
            helper: `${limits.vaultMaxUploads} file limit`,
          },
        ]}
        cards={[
          {
            title: 'Upload Audio',
            description: 'Add private files to your Vault workspace.',
            icon: 'upload',
            status: 'shell',
            onPress: () => comingSoon('Vault upload'),
          },
          {
            title: 'Record Draft',
            description: 'Capture quick takes and voice notes for ideas.',
            icon: 'record',
            status: 'shell',
            onPress: () => comingSoon('Vault recording'),
          },
          {
            title: 'Private Playback',
            description: 'Preview private tracks before sharing or publishing.',
            icon: 'play',
            status: 'shell',
            onPress: () => comingSoon('Private playback'),
          },
        ]}
        workflow={[
          {
            title: 'Organize private files',
            description: 'Folders and empty states are ready for private-library navigation.',
            status: 'ready',
          },
          {
            title: 'Add upload and recording actions',
            description: 'Native file and microphone flows stay intentionally deferred.',
            status: 'next',
          },
          {
            title: 'Publish from Vault',
            description: 'Secure promotion from private files into Studio comes after entitlement work.',
            status: 'later',
          },
        ]}
        notice={{
          title: 'Storage limits',
          description:
            'Vault usage tracks storage, and Vault Pro appears when capacity gets low.',
        }}
      />
    </AppShell>
  );
}

export function VaultFoldersScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        experience="vault"
        eyebrow="Vault"
        title="Folders"
        subtitle="Organize demos, beats, sessions, and references by project."
        cards={[
          {
            title: 'Create Folder',
            description: 'Start a clean folder for a new project or campaign.',
            icon: 'folders',
            status: 'shell',
            onPress: () => comingSoon('Folder creation'),
          },
          {
            title: 'Move Files',
            description: 'Group audio by stage: draft, revise, final.',
            icon: 'vault',
            status: 'shell',
            onPress: () => comingSoon('File organization'),
          },
        ]}
        notice={{
          title: 'Empty by design',
          description:
            'Folders stay shell-only until private uploads are connected, so users never see fake projects.',
        }}
      />
    </AppShell>
  );
}

export function VaultRecordScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        experience="vault"
        eyebrow="Vault"
        title="Record"
        subtitle="Record voice ideas and rough takes directly into your workspace."
        cards={[
          {
            title: 'Quick Voice Note',
            description: 'Start a short idea recording and save to Vault.',
            icon: 'record',
            status: 'locked',
            onPress: () => comingSoon('Quick voice note'),
          },
          {
            title: 'Session Recording',
            description: 'Capture longer sessions for later editing.',
            icon: 'record',
            status: 'locked',
            onPress: () => comingSoon('Session recording'),
          },
        ]}
        notice={{
          title: 'Native recorder deferred',
          description:
            'Recording needs permissions, background behavior, and file persistence before it can be trusted.',
        }}
      />
    </AppShell>
  );
}

export function VaultSharedScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        experience="vault"
        eyebrow="Vault"
        title="Shared"
        subtitle="Share selected private files with collaborators while staying in control."
        cards={[
          {
            title: 'Invite Collaborator',
            description: 'Share specific files or folders with selected people.',
            icon: 'shared',
            status: 'locked',
            onPress: () => comingSoon('Collaborator invites'),
          },
          {
            title: 'Permission Levels',
            description: 'Control who can view, comment, or download.',
            icon: 'settings',
            status: 'locked',
            onPress: () => comingSoon('Share permissions'),
          },
        ]}
        notice={{
          title: 'Security first',
          description:
            'Sharing stays gated until signed access links and permission rules are in place.',
        }}
      />
    </AppShell>
  );
}

export function VaultMoreScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        experience="vault"
        eyebrow="Vault"
        title="More"
        subtitle="Workspace settings, storage details, and account tools."
        cards={[
          {
            title: 'Storage Usage',
            description: 'View current usage and Vault Pro upgrade path.',
            icon: 'vault',
            status: 'available',
            onPress: () => comingSoon('Storage metrics'),
          },
          {
            title: 'Notifications',
            description: 'Manage workspace alerts and updates.',
            icon: 'notifications',
            status: 'shell',
            onPress: () => comingSoon('Vault notifications'),
          },
          {
            title: 'Settings',
            description: 'Tune workspace preferences and defaults.',
            icon: 'settings',
            status: 'shell',
            onPress: () => comingSoon('Vault settings'),
          },
        ]}
      />
    </AppShell>
  );
}

function formatBytes(bytes: number) {
  if (bytes <= 0) return '0 MB';

  const megabytes = bytes / (1024 * 1024);
  if (megabytes < 1024) {
    return `${megabytes.toFixed(1)} MB`;
  }

  return `${(megabytes / 1024).toFixed(2)} GB`;
}
