import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import {
  buildAccountHealthNotice,
  getWorkspaceCardStatus,
  openWorkspaceGate,
} from '@/src/features/navigation/workspaceShell.helpers';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { WorkspaceShellScreen } from '@/src/features/navigation/components/WorkspaceShellScreen';
import { useAccountStore } from '@/src/features/account/account.store';
import { useThemeTokens } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { StudioStreamsGraph } from '../components/StudioStreamsGraph';
import { useStudioListings } from '../studio.hooks';
import type { StreamDataPoint, StreamsTimeRange } from '../studio.types';

export function StudioHomeScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const router = useRouter();
  const profile = useAccountStore((state) => state.profile);
  const role = useAccountStore((state) => state.role);
  const uid = profile?.uid ?? null;

  const { data: listings = [] } = useStudioListings(uid);

  const [streamsRange, setStreamsRange] = useState<StreamsTimeRange>('7d');

  const totalStreams = listings.reduce((sum, l) => sum + l.listenCount, 0);
  const activeListings = listings.filter((l) => l.lifecycleStatus === 'published').length;

  const streamData = useMemo<StreamDataPoint[]>(() => {
    const count = streamsRange === '7d' ? 7 : streamsRange === '30d' ? 30 : 90;
    const perDay = count > 0 ? Math.floor(totalStreams / count) : 0;
    const today = Date.now();
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(today - (count - 1 - i) * 86400000);
      return {
        day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: perDay,
      };
    });
  }, [streamsRange, totalStreams]);

  const healthNotice = buildAccountHealthNotice(profile, 'Studio');
  const verification = profile?.seller.verificationStatus ?? 'not_started';
  const payoutsEnabled = profile?.seller.payoutsEnabled ?? false;

  return (
    <AppShell>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: theme.spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={
            theme.isDark
              ? [theme.colors.surfaceElevated, theme.colors.accentSoft]
              : [theme.colors.accentSoft, theme.colors.surfaceElevated]
          }
          style={styles.hero}
        >
          <View style={styles.heroTopRow}>
            <AppText variant="eyebrow" tone="accent">
              Studio
            </AppText>
            <View style={styles.heroBadge}>
              <AppText
                variant="caption"
                tone={payoutsEnabled ? 'success' : 'accent'}
              >
                {payoutsEnabled ? 'Payouts active' : 'Setup in progress'}
              </AppText>
            </View>
          </View>
          <AppText variant="pageHeading">Release workspace</AppText>
          <AppText variant="body" tone="secondary" style={styles.heroSubtitle}>
            Upload tracks, set prices, and monitor your catalog performance.
          </AppText>
        </LinearGradient>

        {healthNotice ? (
          <View style={styles.noticeBanner}>
            <AppText variant="caption" tone="accent">
              {healthNotice.title}
            </AppText>
            <AppText variant="bodySmall" tone="secondary" style={styles.noticeText}>
              {healthNotice.description}
            </AppText>
          </View>
        ) : null}

        <StudioStreamsGraph
          data={streamData}
          range={streamsRange}
          onRangeChange={setStreamsRange}
        />

        <View style={styles.summaryRow}>
          <SummaryCard
            label="Total Streams"
            value={totalStreams.toLocaleString()}
            theme={theme}
          />
          <SummaryCard
            label="Revenue"
            value="$0.00"
            theme={theme}
          />
          <SummaryCard
            label="Live Tracks"
            value={String(activeListings)}
            theme={theme}
          />
        </View>

        <View style={styles.actionsSection}>
          <AppText variant="caption" tone="muted" style={styles.actionsLabel}>
            Quick actions
          </AppText>
          <Pressable
            onPress={() => router.push('/studio/upload')}
            style={({ pressed }) => [
              styles.primaryAction,
              pressed && styles.actionPressed,
            ]}
          >
            <AppIcon name="upload" size="sm" tone="inverse" />
            <AppText variant="button" style={styles.primaryActionText}>
              New Upload
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => router.push('/studio/listings')}
            style={({ pressed }) => [
              styles.secondaryAction,
              pressed && styles.actionPressed,
            ]}
          >
            <AppIcon name="listings" size="sm" tone="accent" />
            <AppText variant="button" tone="accent">
              View Listings
            </AppText>
          </Pressable>
        </View>

        <View style={styles.verificationCard}>
          <AppText variant="title">Seller verification</AppText>
          <AppText variant="bodySmall" tone="secondary" style={styles.verificationText}>
            {verification === 'verified'
              ? 'Verified — payout settings are ready for activation.'
              : verification === 'pending'
                ? 'Verification in progress. You can prepare releases while we review.'
                : 'Verify your seller profile to unlock payout and publish actions.'}
          </AppText>
          <View style={styles.verificationStatus}>
            <AppText
              variant="caption"
              tone={
                verification === 'verified'
                  ? 'success'
                  : verification === 'pending'
                    ? 'warning'
                    : 'muted'
              }
            >
              {formatStatus(verification)}
            </AppText>
          </View>
        </View>
      </ScrollView>
    </AppShell>
  );
}

function SummaryCard({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useThemeTokens>;
}) {
  const styles = createStyles(theme);
  return (
    <View style={styles.summaryCard}>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText variant="sectionHeading">{value}</AppText>
    </View>
  );
}

function formatStatus(value: string) {
  return value.replace(/_/g, ' ').toUpperCase();
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.md,
    },
    hero: {
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    heroBadge: {
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
    },
    heroSubtitle: {
      marginBottom: theme.spacing.xs,
    },
    noticeBanner: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    noticeText: {
      lineHeight: 18,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    summaryCard: {
      flex: 1,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.md,
      gap: 4,
    },
    actionsSection: {
      gap: theme.spacing.sm,
    },
    actionsLabel: {
      marginBottom: theme.spacing.xs,
    },
    primaryAction: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.accent,
    },
    primaryActionText: {
      color: '#FFFFFF',
    },
    secondaryAction: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    actionPressed: {
      opacity: 0.72,
    },
    verificationCard: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
    verificationText: {
      lineHeight: 18,
    },
    verificationStatus: {
      marginTop: theme.spacing.xs,
    },
  });
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
              openWorkspaceGate(role, 'studio', 'Edit listing', 'Listing editing is coming soon.')
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
              openWorkspaceGate(role, 'studio', 'Boost rules', 'Boost controls are coming in a later phase.'),
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
              openWorkspaceGate(role, 'studio', 'View metrics', 'View metrics are coming soon.'),
          },
          {
            title: 'Listen Count',
            description: 'Track plays and preview completion.',
            icon: 'play',
            status: getWorkspaceCardStatus(role, 'studio'),
            onPress: () =>
              openWorkspaceGate(role, 'studio', 'Listen metrics', 'Listen analytics are in progress.'),
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
