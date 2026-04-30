import { AppShell } from '@/src/features/navigation/components/AppShell';
import { WorkspaceShellScreen } from '@/src/features/navigation/components/WorkspaceShellScreen';
import { Alert } from 'react-native';

function comingSoon(feature: string) {
  Alert.alert('Coming soon', `${feature} will be connected after shell stabilization.`);
}

export function HybridDashboardScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        eyebrow="Hybrid"
        title="Creator dashboard"
        subtitle="Run private production and public selling in one workflow."
        highlight={{
          title: 'Vault -> Studio -> Marketplace',
          description:
            'Start privately in Vault, refine in Studio, and publish to marketplace when ready.',
        }}
        cards={[
          {
            title: 'Private Workspace',
            description: 'Build and iterate in Vault with private previews.',
            icon: 'vault',
            onPress: () => comingSoon('Hybrid Vault workflow'),
          },
          {
            title: 'Listing Pipeline',
            description: 'Transform selected files into marketplace-ready listings.',
            icon: 'studio',
            onPress: () => comingSoon('Hybrid listing pipeline'),
          },
          {
            title: 'Publish Queue',
            description: 'Approve and release finalized listings to market.',
            icon: 'upload',
            onPress: () => comingSoon('Hybrid publish queue'),
          },
        ]}
      />
    </AppShell>
  );
}

export function HybridVaultScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        eyebrow="Hybrid"
        title="Vault Workspace"
        subtitle="Use private tools while staying in the Hybrid experience."
        cards={[
          {
            title: 'Draft Folder',
            description: 'Organize draft tracks before publishing decisions.',
            icon: 'folders',
            onPress: () => comingSoon('Hybrid draft folders'),
          },
          {
            title: 'Private Preview',
            description: 'Review vault tracks before sending them to Studio.',
            icon: 'play',
            onPress: () => comingSoon('Hybrid private preview'),
          },
        ]}
      />
    </AppShell>
  );
}

export function HybridStudioScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        eyebrow="Hybrid"
        title="Studio Tools"
        subtitle="Manage listings and promotions while preserving source files in Vault."
        cards={[
          {
            title: 'Listing Setup',
            description: 'Create listings from approved Vault projects.',
            icon: 'listings',
            onPress: () => comingSoon('Hybrid listing setup'),
          },
          {
            title: 'Promotion Setup',
            description: 'Prepare promotion placeholders for launch windows.',
            icon: 'promote',
            onPress: () => comingSoon('Hybrid promotions'),
          },
        ]}
      />
    </AppShell>
  );
}

export function HybridPublishScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        eyebrow="Hybrid"
        title="Publish"
        subtitle="Final check before publishing a Vault project as a marketplace listing."
        cards={[
          {
            title: 'Asset Validation',
            description: 'Confirm audio, artwork, and metadata completeness.',
            icon: 'upload',
            onPress: () => comingSoon('Asset validation'),
          },
          {
            title: 'Pricing Review',
            description: 'Set and review listing price before going live.',
            icon: 'wallet',
            onPress: () => comingSoon('Pricing review'),
          },
          {
            title: 'Release Action',
            description: 'Push approved listing to the marketplace feed.',
            icon: 'hybrid',
            onPress: () => comingSoon('Release action'),
          },
        ]}
      />
    </AppShell>
  );
}

export function HybridMoreScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        eyebrow="Hybrid"
        title="More"
        subtitle="Advanced workflow settings, notifications, and workspace tools."
        cards={[
          {
            title: 'Workflow Settings',
            description: 'Tune how Vault files move into Studio and publishing.',
            icon: 'settings',
            onPress: () => comingSoon('Workflow settings'),
          },
          {
            title: 'Notifications',
            description: 'Choose update and activity alerts across all tools.',
            icon: 'notifications',
            onPress: () => comingSoon('Hybrid notifications'),
          },
          {
            title: 'Billing',
            description: 'Manage Hybrid subscription and billing details.',
            icon: 'billing',
            onPress: () => comingSoon('Hybrid billing'),
          },
        ]}
      />
    </AppShell>
  );
}
