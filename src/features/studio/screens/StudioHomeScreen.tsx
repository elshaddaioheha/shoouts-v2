import { useAccountStore } from '@/src/features/account/account.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { WorkspaceShellScreen } from '@/src/features/navigation/components/WorkspaceShellScreen';
import { Alert } from 'react-native';

function comingSoon(feature: string) {
  Alert.alert('Coming soon', `${feature} will be connected after shell stabilization.`);
}

export function StudioHomeScreen() {
  const profile = useAccountStore((state) => state.profile);
  const verification = profile?.seller.verificationStatus ?? 'not_started';
  const payoutsEnabled = profile?.seller.payoutsEnabled ?? false;

  return (
    <AppShell>
      <WorkspaceShellScreen
        experience="studio"
        eyebrow="Studio"
        title="Seller workspace"
        subtitle="Publish tracks, manage catalog, and grow discoverability."
        metrics={[
          {
            label: 'Verification',
            value: formatStatus(verification),
            helper: payoutsEnabled ? 'Payouts enabled' : 'Payouts pending',
          },
          {
            label: 'Catalog mode',
            value: 'Shell',
            helper: 'Marketplace reads are live',
          },
        ]}
        cards={[
          {
            title: 'Upload to Marketplace',
            description: 'Create a listing directly from your Studio workspace.',
            icon: 'upload',
            status: 'locked',
            onPress: () => comingSoon('Studio upload'),
          },
          {
            title: 'Listing Queue',
            description: 'Track drafts, scheduled releases, and published listings.',
            icon: 'listings',
            status: 'shell',
            onPress: () => comingSoon('Listing queue'),
          },
          {
            title: 'Promotion Queue',
            description: 'Prepare placements and boost campaigns for release days.',
            icon: 'promote',
            status: 'shell',
            onPress: () => comingSoon('Promotions'),
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
        notice={{
          title: 'Payout verification',
          description:
            'Publishing stays open, while payout access will require KYC verification.',
        }}
      />
    </AppShell>
  );
}

export function StudioListingsScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        experience="studio"
        eyebrow="Studio"
        title="Listings"
        subtitle="Manage listing lifecycle from draft to live."
        cards={[
          {
            title: 'Create Listing',
            description: 'Define title, artwork, genre, and pricing details.',
            icon: 'add',
            status: 'shell',
            onPress: () => comingSoon('Create listing'),
          },
          {
            title: 'Edit Listing',
            description: 'Update metadata and pricing without rebuilding from scratch.',
            icon: 'settings',
            status: 'shell',
            onPress: () => comingSoon('Edit listing'),
          },
          {
            title: 'Archive Listing',
            description: 'Pause visibility while keeping historical analytics.',
            icon: 'more',
            status: 'shell',
            onPress: () => comingSoon('Archive listing'),
          },
        ]}
        notice={{
          title: 'No fake listings',
          description:
            'This shell will show real drafts and published uploads only once write paths are secure.',
        }}
      />
    </AppShell>
  );
}

export function StudioUploadScreen() {
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
            status: 'locked',
            onPress: () => comingSoon('Audio upload'),
          },
          {
            title: 'Artwork',
            description: 'Attach cover art optimized for feed and listing views.',
            icon: 'studio',
            status: 'locked',
            onPress: () => comingSoon('Artwork upload'),
          },
        ]}
        notice={{
          title: 'Upload is intentionally gated',
          description:
            'The shell is ready, but file writes wait for storage rules, validation, and publish review.',
        }}
      />
    </AppShell>
  );
}

export function StudioPromoteScreen() {
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
            status: 'shell',
            onPress: () => comingSoon('Campaign drafts'),
          },
          {
            title: 'Boost Rules',
            description: 'Define basic release boost preferences for future rollout.',
            icon: 'promote',
            status: 'shell',
            onPress: () => comingSoon('Boost rules'),
          },
        ]}
      />
    </AppShell>
  );
}

export function StudioAnalyticsScreen() {
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
            status: 'shell',
            onPress: () => comingSoon('View metrics'),
          },
          {
            title: 'Listen Count',
            description: 'Track listen behavior and preview completion rates.',
            icon: 'play',
            status: 'shell',
            onPress: () => comingSoon('Listen metrics'),
          },
          {
            title: 'Cart Signals',
            description: 'Track adds to cart and basic conversion trend snapshots.',
            icon: 'cart',
            status: 'shell',
            onPress: () => comingSoon('Cart analytics'),
          },
        ]}
        notice={{
          title: 'Analytics shell only',
          description:
            'Counts shown here will come from real event writes after preview playback and purchases are secured.',
        }}
      />
    </AppShell>
  );
}

function formatStatus(value: string) {
  return value.replace('_', ' ').toUpperCase();
}
