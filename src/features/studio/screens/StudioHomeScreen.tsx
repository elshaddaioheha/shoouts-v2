import { AppShell } from '@/src/features/navigation/components/AppShell';
import { WorkspaceShellScreen } from '@/src/features/navigation/components/WorkspaceShellScreen';
import { Alert } from 'react-native';

function comingSoon(feature: string) {
  Alert.alert('Coming soon', `${feature} will be connected after shell stabilization.`);
}

export function StudioHomeScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        eyebrow="Studio"
        title="Seller workspace"
        subtitle="Publish tracks, manage catalog, and grow discoverability."
        cards={[
          {
            title: 'Upload to Marketplace',
            description: 'Create a listing directly from your Studio workspace.',
            icon: 'upload',
            onPress: () => comingSoon('Studio upload'),
          },
          {
            title: 'Listing Queue',
            description: 'Track drafts, scheduled releases, and published listings.',
            icon: 'listings',
            onPress: () => comingSoon('Listing queue'),
          },
          {
            title: 'Promotion Queue',
            description: 'Prepare placements and boost campaigns for release days.',
            icon: 'promote',
            onPress: () => comingSoon('Promotions'),
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
        eyebrow="Studio"
        title="Listings"
        subtitle="Manage listing lifecycle from draft to live."
        cards={[
          {
            title: 'Create Listing',
            description: 'Define title, artwork, genre, and pricing details.',
            icon: 'add',
            onPress: () => comingSoon('Create listing'),
          },
          {
            title: 'Edit Listing',
            description: 'Update metadata and pricing without rebuilding from scratch.',
            icon: 'settings',
            onPress: () => comingSoon('Edit listing'),
          },
          {
            title: 'Archive Listing',
            description: 'Pause visibility while keeping historical analytics.',
            icon: 'more',
            onPress: () => comingSoon('Archive listing'),
          },
        ]}
      />
    </AppShell>
  );
}

export function StudioUploadScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        eyebrow="Studio"
        title="Upload"
        subtitle="Prepare assets and upload files for marketplace release."
        cards={[
          {
            title: 'Audio File',
            description: 'Upload your primary track file and preview metadata.',
            icon: 'upload',
            onPress: () => comingSoon('Audio upload'),
          },
          {
            title: 'Artwork',
            description: 'Attach cover art optimized for feed and listing views.',
            icon: 'studio',
            onPress: () => comingSoon('Artwork upload'),
          },
        ]}
      />
    </AppShell>
  );
}

export function StudioPromoteScreen() {
  return (
    <AppShell>
      <WorkspaceShellScreen
        eyebrow="Studio"
        title="Promote"
        subtitle="Set up campaigns and audience targeting placeholders."
        cards={[
          {
            title: 'Campaign Draft',
            description: 'Prepare campaign intent and target channels.',
            icon: 'promote',
            onPress: () => comingSoon('Campaign drafts'),
          },
          {
            title: 'Boost Rules',
            description: 'Define basic release boost preferences for future rollout.',
            icon: 'promote',
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
        eyebrow="Studio"
        title="Analytics"
        subtitle="Monitor simple performance signals across your catalog."
        cards={[
          {
            title: 'View Count',
            description: 'Track listing impressions and product page visits.',
            icon: 'analytics',
            onPress: () => comingSoon('View metrics'),
          },
          {
            title: 'Listen Count',
            description: 'Track listen behavior and preview completion rates.',
            icon: 'play',
            onPress: () => comingSoon('Listen metrics'),
          },
          {
            title: 'Cart Signals',
            description: 'Track adds to cart and basic conversion trend snapshots.',
            icon: 'cart',
            onPress: () => comingSoon('Cart analytics'),
          },
        ]}
      />
    </AppShell>
  );
}
