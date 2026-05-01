import { useAccountStore } from '@/src/features/account/account.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { WorkspaceShellScreen } from '@/src/features/navigation/components/WorkspaceShellScreen';
import { Alert } from 'react-native';

function comingSoon(feature: string) {
  Alert.alert('Coming soon', `${feature} will be connected after shell stabilization.`);
}

export function HybridDashboardScreen() {
  const profile = useAccountStore((state) => state.profile);
  const uploadCount = profile?.usage.vaultUploadCount ?? 0;
  const verification = profile?.seller.verificationStatus ?? 'not_started';

  return (
    <AppShell>
      <WorkspaceShellScreen
        experience="hybrid"
        eyebrow="Hybrid"
        title="Creator dashboard"
        subtitle="Run private production and public selling in one workflow."
        highlight={{
          title: 'Vault -> Studio -> Marketplace',
          description:
            'Start privately in Vault, refine in Studio, and publish to marketplace when ready.',
        }}
        metrics={[
          {
            label: 'Vault drafts',
            value: `${uploadCount}`,
            helper: 'Private source files',
          },
          {
            label: 'Studio status',
            value: formatStatus(verification),
            helper: 'Seller verification',
          },
        ]}
        cards={[
          {
            title: 'Private Workspace',
            description: 'Build and iterate in Vault with private previews.',
            icon: 'vault',
            status: 'shell',
            onPress: () => comingSoon('Hybrid Vault workflow'),
          },
          {
            title: 'Listing Pipeline',
            description: 'Transform selected files into marketplace-ready listings.',
            icon: 'studio',
            status: 'shell',
            onPress: () => comingSoon('Hybrid listing pipeline'),
          },
          {
            title: 'Publish Queue',
            description: 'Approve and release finalized listings to market.',
            icon: 'upload',
            status: 'shell',
            onPress: () => comingSoon('Hybrid publish queue'),
          },
        ]}
        workflow={[
          {
            title: 'Keep source private',
            description: 'Vault remains the source of truth for drafts and private assets.',
            status: 'ready',
          },
          {
            title: 'Convert draft to listing',
            description: 'The next implementation should create a draft listing from selected metadata.',
            status: 'next',
          },
          {
            title: 'Publish securely',
            description: 'Final publishing waits for file delivery, purchases, and entitlement checks.',
            status: 'later',
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
        experience="hybrid"
        eyebrow="Hybrid"
        title="Vault Workspace"
        subtitle="Use private tools while staying in the Hybrid experience."
        cards={[
          {
            title: 'Draft Folder',
            description: 'Organize draft tracks before publishing decisions.',
            icon: 'folders',
            status: 'shell',
            onPress: () => comingSoon('Hybrid draft folders'),
          },
          {
            title: 'Private Preview',
            description: 'Review vault tracks before sending them to Studio.',
            icon: 'play',
            status: 'locked',
            onPress: () => comingSoon('Hybrid private preview'),
          },
        ]}
        notice={{
          title: 'Private first',
          description:
            'Hybrid Vault keeps drafts separate from public marketplace reads until publishing is explicit.',
        }}
      />
    </AppShell>
  );
}

export function HybridStudioScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        experience="hybrid"
        eyebrow="Hybrid"
        title="Studio Tools"
        subtitle="Manage listings and promotions while preserving source files in Vault."
        cards={[
          {
            title: 'Listing Setup',
            description: 'Create listings from approved Vault projects.',
            icon: 'listings',
            status: 'shell',
            onPress: () => comingSoon('Hybrid listing setup'),
          },
          {
            title: 'Promotion Setup',
            description: 'Prepare promotion placeholders for launch windows.',
            icon: 'promote',
            status: 'shell',
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
        experience="hybrid"
        eyebrow="Hybrid"
        title="Publish"
        subtitle="Final check before publishing a Vault project as a marketplace listing."
        cards={[
          {
            title: 'Asset Validation',
            description: 'Confirm audio, artwork, and metadata completeness.',
            icon: 'upload',
            status: 'shell',
            onPress: () => comingSoon('Asset validation'),
          },
          {
            title: 'Pricing Review',
            description: 'Set and review listing price before going live.',
            icon: 'wallet',
            status: 'shell',
            onPress: () => comingSoon('Pricing review'),
          },
          {
            title: 'Release Action',
            description: 'Push approved listing to the marketplace feed.',
            icon: 'hybrid',
            status: 'locked',
            onPress: () => comingSoon('Release action'),
          },
        ]}
        notice={{
          title: 'Publish remains gated',
          description:
            'The checklist is visible now, but public writes wait for secure storage and listing validation.',
        }}
      />
    </AppShell>
  );
}

export function HybridMoreScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        experience="hybrid"
        eyebrow="Hybrid"
        title="More"
        subtitle="Advanced workflow settings, notifications, and workspace tools."
        cards={[
          {
            title: 'Workflow Settings',
            description: 'Tune how Vault files move into Studio and publishing.',
            icon: 'settings',
            status: 'shell',
            onPress: () => comingSoon('Workflow settings'),
          },
          {
            title: 'Notifications',
            description: 'Choose update and activity alerts across all tools.',
            icon: 'notifications',
            status: 'shell',
            onPress: () => comingSoon('Hybrid notifications'),
          },
          {
            title: 'Billing',
            description: 'Manage Hybrid subscription and billing details.',
            icon: 'billing',
            status: 'shell',
            onPress: () => comingSoon('Hybrid billing'),
          },
        ]}
      />
    </AppShell>
  );
}

function formatStatus(value: string) {
  return value.replace('_', ' ').toUpperCase();
}
