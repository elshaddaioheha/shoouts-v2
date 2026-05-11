import { useAccountStore } from '@/src/features/account/account.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { WorkspaceShellScreen } from '@/src/features/navigation/components/WorkspaceShellScreen';
import {
  buildAccountHealthNotice,
  getWorkspaceCardStatus,
  openWorkspaceGate,
} from '@/src/features/navigation/workspaceShell.helpers';

export function StudioHomeScreen() {
  const profile = useAccountStore((state) => state.profile);
  const role = useAccountStore((state) => state.role);
  const verification = profile?.seller.verificationStatus ?? 'not_started';
  const payoutsEnabled = profile?.seller.payoutsEnabled ?? false;
  const healthNotice = buildAccountHealthNotice(profile, 'Studio');
  const sellerStateDescription =
    verification === 'verified'
      ? 'Seller verification is complete, so payout-oriented UI can trust the current profile.'
      : verification === 'pending'
        ? 'Verification is underway. Publishing can stay visible, but payout actions should remain conservative.'
        : 'Verification has not been completed yet, so payout and release-critical actions stay gated.';

  return (
    <AppShell>
      <WorkspaceShellScreen
        experience="studio"
        eyebrow="Studio"
        title="Seller workspace"
        subtitle="Publish tracks, manage catalog, and grow discoverability."
        highlight={{
          title: payoutsEnabled ? 'Seller account is payout-ready' : 'Studio shell is seller-aware',
          description: sellerStateDescription,
        }}
        metrics={[
          {
            label: 'Verification',
            value: formatStatus(verification),
            helper: payoutsEnabled ? 'Payouts enabled' : 'Payouts pending',
          },
          {
            label: 'Account data',
            value: formatStatus(profile?.dataHealth.userDocState ?? 'missing'),
            helper:
              profile?.dataHealth.profileSource === 'fallback'
                ? 'Auth-only fallback profile'
                : 'Workspace shell reads from account state',
          },
        ]}
        cards={[
          {
            title: 'Upload to Marketplace',
            description: 'Create a listing directly from your Studio workspace.',
            icon: 'upload',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Studio upload',
                'Studio upload will be connected after shell stabilization.'
              ),
          },
          {
            title: 'Listing Queue',
            description: 'Track drafts, scheduled releases, and published listings.',
            icon: 'listings',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Listing queue',
                'Listing queue will be connected after shell stabilization.'
              ),
          },
          {
            title: 'Promotion Queue',
            description: 'Prepare placements and boost campaigns for release days.',
            icon: 'promote',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Promotions',
                'Promotions will be connected after shell stabilization.'
              ),
          },
        ]}
        workflow={[
          {
            title: 'Map published uploads',
            description: 'Buyer marketplace surfaces already read public upload data safely.',
            status: 'ready',
          },
          {
            title: 'Create listing drafts',
            description: 'Next pass should write draft metadata without uploading raw files yet.',
            status: 'next',
          },
          {
            title: 'Enable payouts and analytics',
            description: 'KYC, payout, and deeper analytics stay after transaction security.',
            status: 'later',
          },
        ]}
        notice={healthNotice ?? {
          title: 'Payout verification',
          description:
            'Publishing stays open, while payout access will require KYC verification.',
        }}
      />
    </AppShell>
  );
}

export function StudioListingsScreen() {
  const profile = useAccountStore((state) => state.profile);
  const role = useAccountStore((state) => state.role);

  return (
    <AppShell>
      <WorkspaceShellScreen
        experience="studio"
        eyebrow="Studio"
        title="Listings"
        subtitle="Manage listing lifecycle from draft to live."
        highlight={{
          title: 'Listing state will come from real writes',
          description:
            'Marketplace reads are live now, but this shell will only show drafts and releases once secure Studio writes are in place.',
        }}
        cards={[
          {
            title: 'Create Listing',
            description: 'Define title, artwork, genre, and pricing details.',
            icon: 'add',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Create listing',
                'Studio listing creation will be connected after shell stabilization.'
              ),
          },
          {
            title: 'Edit Listing',
            description: 'Update metadata and pricing without rebuilding from scratch.',
            icon: 'settings',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Edit listing',
                'Studio listing editing will be connected after shell stabilization.'
              ),
          },
          {
            title: 'Archive Listing',
            description: 'Pause visibility while keeping historical analytics.',
            icon: 'more',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Archive listing',
                'Studio archive actions will be connected after shell stabilization.'
              ),
          },
        ]}
        notice={buildAccountHealthNotice(profile, 'Studio') ?? {
          title: 'No fake listings',
          description:
            'This shell will show real drafts and published uploads only once write paths are secure.',
        }}
      />
    </AppShell>
  );
}

export function StudioUploadScreen() {
  const profile = useAccountStore((state) => state.profile);
  const role = useAccountStore((state) => state.role);

  return (
    <AppShell>
      <WorkspaceShellScreen
        experience="studio"
        eyebrow="Studio"
        title="Upload"
        subtitle="Prepare assets and upload files for marketplace release."
        cards={[
          {
            title: 'Audio File',
            description: 'Upload your primary track file and preview metadata.',
            icon: 'upload',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Audio upload',
                'Studio audio upload will be connected after shell stabilization.'
              ),
          },
          {
            title: 'Artwork',
            description: 'Attach cover art optimized for feed and listing views.',
            icon: 'studio',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Artwork upload',
                'Studio artwork upload will be connected after shell stabilization.'
              ),
          },
        ]}
        notice={buildAccountHealthNotice(profile, 'Studio') ?? {
          title: 'Upload is intentionally gated',
          description:
            'The shell is ready, but file writes wait for storage rules, validation, and publish review.',
        }}
      />
    </AppShell>
  );
}

export function StudioPromoteScreen() {
  const profile = useAccountStore((state) => state.profile);
  const role = useAccountStore((state) => state.role);

  return (
    <AppShell>
      <WorkspaceShellScreen
        experience="studio"
        eyebrow="Studio"
        title="Promote"
        subtitle="Set up campaigns and audience targeting placeholders."
        cards={[
          {
            title: 'Campaign Draft',
            description: 'Prepare campaign intent and target channels.',
            icon: 'promote',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Campaign drafts',
                'Campaign drafts will be connected after shell stabilization.'
              ),
          },
          {
            title: 'Boost Rules',
            description: 'Define basic release boost preferences for future rollout.',
            icon: 'promote',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Boost rules',
                'Boost rules will be connected after shell stabilization.'
              ),
          },
        ]}
        notice={buildAccountHealthNotice(profile, 'Studio') ?? {
          title: 'Promotion follows listing truth',
          description:
            'Campaign setup will stay shell-only until listing drafts and release timing are backed by real writes.',
        }}
      />
    </AppShell>
  );
}

export function StudioAnalyticsScreen() {
  const profile = useAccountStore((state) => state.profile);
  const role = useAccountStore((state) => state.role);

  return (
    <AppShell>
      <WorkspaceShellScreen
        experience="studio"
        eyebrow="Studio"
        title="Analytics"
        subtitle="Monitor simple performance signals across your catalog."
        cards={[
          {
            title: 'View Count',
            description: 'Track listing impressions and product page visits.',
            icon: 'analytics',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'View metrics',
                'View metrics will be connected after shell stabilization.'
              ),
          },
          {
            title: 'Listen Count',
            description: 'Track listen behavior and preview completion rates.',
            icon: 'play',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Listen metrics',
                'Listen metrics will be connected after shell stabilization.'
              ),
          },
          {
            title: 'Cart Signals',
            description: 'Track adds to cart and basic conversion trend snapshots.',
            icon: 'cart',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Cart analytics',
                'Cart analytics will be connected after shell stabilization.'
              ),
          },
        ]}
        notice={buildAccountHealthNotice(profile, 'Studio') ?? {
          title: 'Analytics shell only',
          description:
            'Counts shown here will come from real event writes after preview playback and purchases are secured.',
        }}
      />
    </AppShell>
  );
}

function formatStatus(value: string) {
  return value.replace(/_/g, ' ').toUpperCase();
}
