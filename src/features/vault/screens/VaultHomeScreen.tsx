import { AppShell } from '@/src/features/navigation/components/AppShell';
import { WorkspaceShellScreen } from '@/src/features/navigation/components/WorkspaceShellScreen';
import { Alert } from 'react-native';

function comingSoon(feature: string) {
  Alert.alert('Coming soon', `${feature} will be connected after shell stabilization.`);
}

export function VaultHomeScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        eyebrow="Vault"
        title="Private workspace"
        subtitle="Capture ideas, keep files private, and prepare projects before publishing."
        cards={[
          {
            title: 'Upload Audio',
            description: 'Add private files to your Vault workspace.',
            icon: 'upload',
            onPress: () => comingSoon('Vault upload'),
          },
          {
            title: 'Record Draft',
            description: 'Capture quick takes and voice notes for ideas.',
            icon: 'record',
            onPress: () => comingSoon('Vault recording'),
          },
          {
            title: 'Private Playback',
            description: 'Preview private tracks before sharing or publishing.',
            icon: 'play',
            onPress: () => comingSoon('Private playback'),
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
        eyebrow="Vault"
        title="Folders"
        subtitle="Organize demos, beats, sessions, and references by project."
        cards={[
          {
            title: 'Create Folder',
            description: 'Start a clean folder for a new project or campaign.',
            icon: 'folders',
            onPress: () => comingSoon('Folder creation'),
          },
          {
            title: 'Move Files',
            description: 'Group audio by stage: draft, revise, final.',
            icon: 'vault',
            onPress: () => comingSoon('File organization'),
          },
        ]}
      />
    </AppShell>
  );
}

export function VaultRecordScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        eyebrow="Vault"
        title="Record"
        subtitle="Record voice ideas and rough takes directly into your workspace."
        cards={[
          {
            title: 'Quick Voice Note',
            description: 'Start a short idea recording and save to Vault.',
            icon: 'record',
            onPress: () => comingSoon('Quick voice note'),
          },
          {
            title: 'Session Recording',
            description: 'Capture longer sessions for later editing.',
            icon: 'record',
            onPress: () => comingSoon('Session recording'),
          },
        ]}
      />
    </AppShell>
  );
}

export function VaultSharedScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        eyebrow="Vault"
        title="Shared"
        subtitle="Share selected private files with collaborators while staying in control."
        cards={[
          {
            title: 'Invite Collaborator',
            description: 'Share specific files or folders with selected people.',
            icon: 'shared',
            onPress: () => comingSoon('Collaborator invites'),
          },
          {
            title: 'Permission Levels',
            description: 'Control who can view, comment, or download.',
            icon: 'settings',
            onPress: () => comingSoon('Share permissions'),
          },
        ]}
      />
    </AppShell>
  );
}

export function VaultMoreScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        eyebrow="Vault"
        title="More"
        subtitle="Workspace settings, storage details, and account tools."
        cards={[
          {
            title: 'Storage Usage',
            description: 'View current usage and Vault Pro upgrade path.',
            icon: 'vault',
            onPress: () => comingSoon('Storage metrics'),
          },
          {
            title: 'Notifications',
            description: 'Manage workspace alerts and updates.',
            icon: 'notifications',
            onPress: () => comingSoon('Vault notifications'),
          },
          {
            title: 'Settings',
            description: 'Tune workspace preferences and defaults.',
            icon: 'settings',
            onPress: () => comingSoon('Vault settings'),
          },
        ]}
      />
    </AppShell>
  );
}
