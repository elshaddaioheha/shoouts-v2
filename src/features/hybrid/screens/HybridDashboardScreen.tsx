import { useAccountStore } from '@/src/features/account/account.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { WorkspaceShellScreen } from '@/src/features/navigation/components/WorkspaceShellScreen';
import {
  buildAccountHealthNotice,
  getWorkspaceCardStatus,
  openWorkspaceGate,
} from '@/src/features/navigation/workspaceShell.helpers';

export function HybridDashboardScreen() {
  const profile = useAccountStore((state) => state.profile);
  const role = useAccountStore((state) => state.role);
  const uploadCount = profile?.usage.vaultUploadCount ?? 0;
  const verification = profile?.seller.verificationStatus ?? 'not_started';
  const healthNotice = buildAccountHealthNotice(profile, 'Hybrid');

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
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid Vault workflow',
                'Hybrid Vault workflow will be connected after shell stabilization.'
              ),
          },
          {
            title: 'Listing Pipeline',
            description: 'Transform selected files into marketplace-ready listings.',
            icon: 'studio',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid listing pipeline',
                'Hybrid listing pipeline will be connected after shell stabilization.'
              ),
          },
          {
            title: 'Publish Queue',
            description: 'Approve and release finalized listings to market.',
            icon: 'upload',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid publish queue',
                'Hybrid publish queue will be connected after shell stabilization.'
              ),
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
        notice={healthNotice ?? {
          title: 'Hybrid stays orchestration-first',
          description:
            'This shell keeps the Vault-to-Studio journey visible now, while secure publish writes remain intentionally deferred.',
        }}
      />
    </AppShell>
  );
}

export function HybridVaultScreen() {
  const profile = useAccountStore((state) => state.profile);
  const role = useAccountStore((state) => state.role);

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
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid draft folders',
                'Hybrid draft folders will be connected after shell stabilization.'
              ),
          },
          {
            title: 'Private Preview',
            description: 'Review vault tracks before sending them to Studio.',
            icon: 'play',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid private preview',
                'Hybrid private preview will be connected after shell stabilization.'
              ),
          },
        ]}
        notice={buildAccountHealthNotice(profile, 'Hybrid') ?? {
          title: 'Private first',
          description:
            'Hybrid Vault keeps drafts separate from public marketplace reads until publishing is explicit.',
        }}
      />
    </AppShell>
  );
}

export function HybridStudioScreen() {
  const profile = useAccountStore((state) => state.profile);
  const role = useAccountStore((state) => state.role);

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
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid listing setup',
                'Hybrid listing setup will be connected after shell stabilization.'
              ),
          },
          {
            title: 'Promotion Setup',
            description: 'Prepare promotion placeholders for launch windows.',
            icon: 'promote',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid promotions',
                'Hybrid promotions will be connected after shell stabilization.'
              ),
          },
        ]}
        notice={buildAccountHealthNotice(profile, 'Hybrid') ?? {
          title: 'Studio tooling depends on Vault truth',
          description:
            'Hybrid listing setup will stay shell-only until selected Vault assets can produce real listing drafts.',
        }}
      />
    </AppShell>
  );
}

export function HybridPublishScreen() {
  const profile = useAccountStore((state) => state.profile);
  const role = useAccountStore((state) => state.role);

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
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Asset validation',
                'Asset validation will be connected after shell stabilization.'
              ),
          },
          {
            title: 'Pricing Review',
            description: 'Set and review listing price before going live.',
            icon: 'wallet',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Pricing review',
                'Pricing review will be connected after shell stabilization.'
              ),
          },
          {
            title: 'Release Action',
            description: 'Push approved listing to the marketplace feed.',
            icon: 'hybrid',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Release action',
                'Release action will be connected after shell stabilization.'
              ),
          },
        ]}
        notice={buildAccountHealthNotice(profile, 'Hybrid') ?? {
          title: 'Publish remains gated',
          description:
            'The checklist is visible now, but public writes wait for secure storage and listing validation.',
        }}
      />
    </AppShell>
  );
}

export function HybridMoreScreen() {
  const profile = useAccountStore((state) => state.profile);
  const role = useAccountStore((state) => state.role);

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
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Workflow settings',
                'Workflow settings will be connected after shell stabilization.'
              ),
          },
          {
            title: 'Notifications',
            description: 'Choose update and activity alerts across all tools.',
            icon: 'notifications',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid notifications',
                'Hybrid notifications will be connected after shell stabilization.'
              ),
          },
          {
            title: 'Billing',
            description: 'Manage Hybrid subscription and billing details.',
            icon: 'billing',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid billing',
                'Hybrid billing will be connected after shell stabilization.'
              ),
          },
        ]}
        notice={buildAccountHealthNotice(profile, 'Hybrid') ?? {
          title: 'Workflow settings follow entitlement truth',
          description:
            'Hybrid settings will stay shell-only until billing and publish-state writes are protected end to end.',
        }}
      />
    </AppShell>
  );
}

function formatStatus(value: string) {
  return value.replace(/_/g, ' ').toUpperCase();
}
