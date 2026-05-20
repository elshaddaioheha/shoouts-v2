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
      ? 'Your seller verification is complete, so payout settings are ready for activation.'
      : verification === 'pending'
        ? 'Verification is in progress. You can prepare releases now, then enable payouts once approval is complete.'
        : 'Verify your seller profile to unlock payout and release-critical actions.';

  return (
    <AppShell>
      <WorkspaceShellScreen
        experience="studio"
        eyebrow="Studio"
        title="Release workspace"
        subtitle="Prepare music, manage listings, and plan launch activity from one place."
        highlight={{
          title: payoutsEnabled ? 'Payout setup is ready' : 'Studio setup in progress',
          description: sellerStateDescription,
        }}
        metrics={[
          {
            label: 'Verification',
            value: formatStatus(verification),
            helper: payoutsEnabled ? 'Payouts available' : 'Payouts not active yet',
          },
          {
            label: 'Account data',
            value: formatStatus(profile?.dataHealth.userDocState ?? 'missing'),
            helper:
              profile?.dataHealth.profileSource === 'fallback'
                ? 'Using basic profile data'
                : 'Synced from your account profile',
          },
        ]}
        cards={[
          {
            title: 'Upload release assets',
            description: 'Add audio and artwork for your next release.',
            icon: 'upload',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Studio upload',
                'Upload tools are being connected to secure storage.'
              ),
          },
          {
            title: 'Manage listings',
            description: 'Track drafts, scheduled drops, and live listings.',
            icon: 'listings',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Listing queue',
                'Listing management tools are coming in the next release.'
              ),
          },
          {
            title: 'Plan promotions',
            description: 'Set up release campaigns and boost timing.',
            icon: 'promote',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Promotions',
                'Promotion setup will unlock after listing write paths are live.'
              ),
          },
        ]}
        workflow={[
          {
            title: 'Read live marketplace data',
            description: 'Marketplace listing reads are already stable and active.',
            status: 'ready',
          },
          {
            title: 'Create draft listings',
            description: 'Next step is writing draft metadata from Studio.',
            status: 'next',
          },
          {
            title: 'Enable payouts and analytics',
            description: 'KYC, payouts, and full analytics follow secure transaction rollout.',
            status: 'later',
          },
        ]}
        notice={
          healthNotice ?? {
            title: 'Payout verification',
            description: 'Publishing can be prepared now. Payout access requires KYC verification.',
          }
        }
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
        subtitle="Manage each release from draft to live."
        highlight={{
          title: 'Listing activity will reflect real writes',
          description:
            'Marketplace reads are live now. Studio will show draft and release states as soon as secure writes are enabled.',
        }}
        cards={[
          {
            title: 'Create Listing',
            description: 'Set title, artwork, genre, and pricing.',
            icon: 'add',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Create listing',
                'Listing creation is being connected to secure write paths.'
              ),
          },
          {
            title: 'Edit Listing',
            description: 'Update metadata and pricing at any time.',
            icon: 'settings',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Edit listing',
                'Listing editing is coming soon.'
              ),
          },
          {
            title: 'Archive Listing',
            description: 'Pause visibility without losing history.',
            icon: 'more',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Archive listing',
                'Archive controls will unlock after listing lifecycle writes are active.'
              ),
          },
        ]}
        notice={
          buildAccountHealthNotice(profile, 'Studio') ?? {
            title: 'Real listing states only',
            description:
              'Draft and published states will appear here once Studio write security is complete.',
          }
        }
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
        subtitle="Prepare files for your next release."
        cards={[
          {
            title: 'Audio File',
            description: 'Upload your track and confirm audio details.',
            icon: 'upload',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Audio upload',
                'Audio uploads are being connected to secure storage.'
              ),
          },
          {
            title: 'Artwork',
            description: 'Attach cover art for feed and listing views.',
            icon: 'studio',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Artwork upload',
                'Artwork uploads are coming soon.'
              ),
          },
        ]}
        notice={
          buildAccountHealthNotice(profile, 'Studio') ?? {
            title: 'Upload flow in progress',
            description:
              'This screen is ready. File writes will unlock after storage rules and validation are finalized.',
          }
        }
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
        subtitle="Plan campaign ideas and launch timing."
        cards={[
          {
            title: 'Campaign Draft',
            description: 'Outline campaign goals and channels.',
            icon: 'promote',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Campaign drafts',
                'Campaign drafts will unlock after listing writes are live.'
              ),
          },
          {
            title: 'Boost Rules',
            description: 'Set release boost preferences.',
            icon: 'promote',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Boost rules',
                'Boost controls are coming in a later phase.'
              ),
          },
        ]}
        notice={
          buildAccountHealthNotice(profile, 'Studio') ?? {
            title: 'Promotion follows listing state',
            description:
              'Campaign setup becomes fully active after draft listings and release timing are backed by real writes.',
          }
        }
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
        subtitle="Track core performance signals across your catalog."
        cards={[
          {
            title: 'View Count',
            description: 'Measure listing impressions and page visits.',
            icon: 'analytics',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'View metrics',
                'View metrics are coming soon.'
              ),
          },
          {
            title: 'Listen Count',
            description: 'Track plays and preview completion.',
            icon: 'play',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Listen metrics',
                'Listen analytics are in progress.'
              ),
          },
          {
            title: 'Cart Signals',
            description: 'Track add-to-cart and conversion trends.',
            icon: 'cart',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(
                role,
                'studio',
                'Cart analytics',
                'Cart analytics will unlock after commerce events are fully wired.'
              ),
          },
        ]}
        notice={
          buildAccountHealthNotice(profile, 'Studio') ?? {
            title: 'Analytics in progress',
            description:
              'Counts on this screen will be sourced from real event writes after playback and purchase events are secured.',
          }
        }
      />
    </AppShell>
  );
}

function formatStatus(value: string) {
  return value.replace(/_/g, ' ').toUpperCase();
}
