import { AppText } from '@/src/components/ui/AppText';
import { useAccountStore } from '@/src/features/account/account.store';
import { MoreOptionCard } from '@/src/features/more/components/MoreOptionCard';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import {
  CreditCard,
  Download,
  Heart,
  MessageCircle,
  ReceiptText,
  Settings as SettingsIcon,
  Sparkles,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

const contentOptions = [
  {
    title: 'Downloads',
    description: 'View purchased and free-downloadable beats.',
    route: '/downloads',
    icon: Download,
  },
  {
    title: 'Purchase History',
    description: 'Review your past beat purchases.',
    route: '/purchases',
    icon: ReceiptText,
  },
  {
    title: 'Saved & Favourites',
    description: 'Your liked beats and saved creators.',
    route: '/saved',
    icon: Heart,
  },
  {
    title: 'Messages',
    description: 'Buyer and seller conversations.',
    route: '/messages',
    icon: MessageCircle,
  },
] as const;

const accountOptions = [
  {
    title: 'Subscriptions',
    description: 'Manage Shoouts, Vault, Studio, and Hybrid access.',
    route: '/settings/subscriptions',
    icon: CreditCard,
  },
  {
    title: 'Settings',
    description: 'Account, privacy, preferences, and support.',
    route: '/settings',
    icon: SettingsIcon,
  },
] as const;

export function MoreScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const profile = useAccountStore((state) => state.profile);
  const role = useAccountStore((state) => state.role);
  const displayName = profile?.displayName?.trim() || 'Creator';
  const initials = getInitials(displayName);
  const planLabel = formatPlanLabel(profile?.subscriptionTier ?? role);
  const statusLabel = formatStatusLabel(profile?.subscriptionStatus ?? 'free');

  return (
    <AppShell>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <AppText variant="caption" tone="accent">
              More
            </AppText>

            <AppText variant="pageHeading">Account & tools</AppText>

            <AppText variant="body" tone="secondary" style={styles.subtitle}>
              Manage downloads, purchases, subscriptions, settings, and support.
            </AppText>
          </View>

          <View style={styles.greetingCard}>
            <View style={styles.avatar}>
              <AppText variant="button" style={styles.avatarText}>
                {initials}
              </AppText>
            </View>

            <View style={styles.greetingText}>
              <AppText variant="navItem" numberOfLines={1}>
                Hi, {displayName}
              </AppText>
              <AppText variant="bodySmall" tone="secondary" numberOfLines={1}>
                {planLabel} - {statusLabel}
              </AppText>
            </View>
          </View>

          <View style={styles.section}>
            <AppText variant="caption" tone="muted">
              Library
            </AppText>

            <View style={styles.optionList}>
              {contentOptions.map((option) => (
                <MoreOptionCard
                  key={option.title}
                  title={option.title}
                  description={option.description}
                  icon={option.icon}
                  onPress={() => router.push(option.route as any)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <AppText variant="caption" tone="muted">
              Account
            </AppText>

            <View style={styles.optionList}>
              {accountOptions.map((option) => (
                <MoreOptionCard
                  key={option.title}
                  title={option.title}
                  description={option.description}
                  value={option.title === 'Subscriptions' ? statusLabel : undefined}
                  icon={option.icon}
                  onPress={() => router.push(option.route as any)}
                />
              ))}
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.subscriptionCard,
              pressed ? styles.subscriptionCardPressed : undefined,
            ]}
            onPress={() => router.push('/settings/subscriptions' as any)}
          >
            <View style={styles.subscriptionIcon}>
              <Sparkles size={20} color={theme.colors.accent} />
            </View>

            <View style={styles.subscriptionCopy}>
              <AppText variant="sectionHeading" style={styles.subscriptionTitle}>
                Upgrade your plan
              </AppText>
              <AppText variant="bodySmall" style={styles.subscriptionText}>
                Unlock more creator tools when subscriptions are connected.
              </AppText>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </AppShell>
  );
}

function getInitials(name: string) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return initials || 'C';
}

function formatPlanLabel(value: string) {
  return value.replace('_', ' ').toUpperCase();
}

function formatStatusLabel(value: string) {
  return value.replace('_', ' ').toUpperCase();
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },
    content: {
      width: '100%',
      maxWidth: 720,
      alignSelf: 'center',
      gap: theme.spacing.xl,
    },
    header: {
      gap: theme.spacing.sm,
    },
    subtitle: {
      maxWidth: 520,
    },
    greetingCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      ...theme.shadows.md,
    },
    avatar: {
      width: theme.layout.minTouchTarget,
      height: theme.layout.minTouchTarget,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    avatarText: {
      color: theme.colors.textOnAccent,
    },
    greetingText: {
      flex: 1,
      minWidth: 0,
    },
    section: {
      gap: theme.spacing.sm,
    },
    optionList: {
      gap: theme.spacing.sm,
    },
    subscriptionCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.accent,
      padding: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      ...theme.shadows.md,
    },
    subscriptionCardPressed: {
      backgroundColor: theme.colors.accentPressed,
    },
    subscriptionIcon: {
      width: theme.layout.minTouchTarget,
      height: theme.layout.minTouchTarget,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    subscriptionCopy: {
      flex: 1,
      minWidth: 0,
      gap: theme.spacing.xs,
    },
    subscriptionTitle: {
      color: theme.colors.textOnAccent,
    },
    subscriptionText: {
      color: theme.colors.textOnAccent,
    },
  });
}
