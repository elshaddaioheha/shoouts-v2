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
        title="Creator flow"
        subtitle="Move from private creation to public release in one connected workspace."
        highlight={{
          title: 'Vault to Studio to Marketplace',
          description:
            'Draft in Vault, refine in Studio, and release when everything is ready.',
        }}
        metrics={[
          {
            label: 'Vault drafts',
            value: `${uploadCount}`,
            helper: 'Private source projects',
          },
          {
            label: 'Studio status',
            value: formatStatus(verification),
            helper: 'Seller verification state',
          },
        ]}
        cards={[
          {
            title: 'Private workspace',
            description: 'Build and review ideas in Vault.',
            icon: 'vault',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid Vault workflow',
                'Hybrid Vault tools are being connected now.'
              ),
          },
          {
            title: 'Listing pipeline',
            description: 'Turn selected projects into release-ready listings.',
            icon: 'studio',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid listing pipeline',
                'Listing pipeline actions are coming in the next phase.'
              ),
          },
          {
            title: 'Publish queue',
            description: 'Approve and release finalized listings.',
            icon: 'upload',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid publish queue',
                'Publish queue actions unlock after secure release writes are enabled.'
              ),
          },
        ]}
        workflow={[
          {
            title: 'Keep source private',
            description: 'Vault remains the source of truth for drafts.',
            status: 'ready',
          },
          {
            title: 'Convert draft to listing',
            description: 'Next step is creating Studio draft listings from Vault projects.',
            status: 'next',
          },
          {
            title: 'Publish securely',
            description: 'Final release waits for secure delivery, purchases, and entitlements.',
            status: 'later',
          },
        ]}
        notice={
          healthNotice ?? {
            title: 'Workflow-first release design',
            description:
              'The full Vault-to-Studio journey is visible now. Final publish writes are the next backend milestone.',
          }
        }
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
        title="Vault workspace"
        subtitle="Use private tools without leaving your Hybrid workflow."
        cards={[
          {
            title: 'Draft folders',
            description: 'Organize private projects before release decisions.',
            icon: 'folders',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid draft folders',
                'Draft folder actions are being connected.'
              ),
          },
          {
            title: 'Private preview',
            description: 'Review tracks before moving them into Studio.',
            icon: 'play',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid private preview',
                'Private preview controls are coming soon.'
              ),
          },
        ]}
        notice={
          buildAccountHealthNotice(profile, 'Hybrid') ?? {
            title: 'Private-first workflow',
            description:
              'Hybrid keeps drafts private until you intentionally move them toward release.',
          }
        }
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
        subtitle="Prepare listings and promotions while your source projects stay in Vault."
        cards={[
          {
            title: 'Listing setup',
            description: 'Create release drafts from approved Vault projects.',
            icon: 'listings',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid listing setup',
                'Listing setup actions are in progress.'
              ),
          },
          {
            title: 'Promotion setup',
            description: 'Plan promotion timing for launch windows.',
            icon: 'promote',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid promotions',
                'Promotion tools are coming in a later phase.'
              ),
          },
        ]}
        notice={
          buildAccountHealthNotice(profile, 'Hybrid') ?? {
            title: 'Vault-to-Studio bridge',
            description:
              'This view becomes fully active once selected Vault assets can create real listing drafts.',
          }
        }
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
        subtitle="Final release check before publishing to the marketplace."
        cards={[
          {
            title: 'Asset validation',
            description: 'Confirm audio, artwork, and metadata.',
            icon: 'upload',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Asset validation',
                'Asset validation is being connected to release checks.'
              ),
          },
          {
            title: 'Pricing review',
            description: 'Set and confirm listing price before release.',
            icon: 'wallet',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Pricing review',
                'Pricing review is coming soon.'
              ),
          },
          {
            title: 'Release action',
            description: 'Publish approved listings to the marketplace feed.',
            icon: 'hybrid',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Release action',
                'Release actions unlock after secure publish writes are complete.'
              ),
          },
        ]}
        notice={
          buildAccountHealthNotice(profile, 'Hybrid') ?? {
            title: 'Publish path in progress',
            description:
              'The checklist is visible now. Public writes unlock after storage and validation security is complete.',
          }
        }
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
        subtitle="Workflow settings, alerts, and account tools."
        cards={[
          {
            title: 'Workflow settings',
            description: 'Control how Vault projects move into Studio and Publish.',
            icon: 'settings',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Workflow settings',
                'Workflow settings are being designed now.'
              ),
          },
          {
            title: 'Notifications',
            description: 'Choose update and activity alerts.',
            icon: 'notifications',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid notifications',
                'Notification controls are coming soon.'
              ),
          },
          {
            title: 'Billing',
            description: 'Manage your Hybrid subscription and billing details.',
            icon: 'billing',
            status: getWorkspaceCardStatus(role, 'hybrid'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'hybrid',
                'Hybrid billing',
                'Billing actions will unlock after payment settings are fully integrated.'
              ),
          },
        ]}
        notice={
          buildAccountHealthNotice(profile, 'Hybrid') ?? {
            title: 'Settings follow account state',
            description:
              'Hybrid settings become fully active once billing and publish-state writes are protected end to end.',
          }
        }
      />
    </AppShell>
  );
}

function formatStatus(value: string) {
  return value.replace(/_/g, ' ').toUpperCase();
}
