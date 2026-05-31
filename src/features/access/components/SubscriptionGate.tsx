import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import type { AppIconKey } from '@/src/components/ui/appIcons';
import { ROLE_CONFIG } from '@/src/features/access/access.config';
import {
  canAccessExperience,
  getRoleConfig,
} from '@/src/features/access/access.helpers';
import type { AppExperience, UserRole } from '@/src/features/access/access.types';
import { useAccountStore } from '@/src/features/account/account.store';
import { experienceTokens, useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { Lock } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Upgrade data per role ──────────────────────────────────────────────────

type PlanGateInfo = {
  planName: string;
  price: string;
  cadence: string;
  features: string[];
};

const PLAN_GATE_INFO: Partial<Record<UserRole, PlanGateInfo>> = {
  vault: {
    planName: 'Vault',
    price: 'Free',
    cadence: '',
    features: [
      '50 private uploads',
      '0.05 GB storage',
      'Folder organisation',
      'Private playback',
    ],
  },
  vault_pro: {
    planName: 'Vault Pro',
    price: '$5.99',
    cadence: '/mo',
    features: [
      '500 private uploads',
      '5 GB storage',
      'Private sharing links',
      'All Vault features',
    ],
  },
  studio: {
    planName: 'Studio',
    price: '$18.99',
    cadence: '/mo',
    features: [
      'Unlimited listings',
      'Seller messaging',
      'Analytics & payouts',
      'Beat publishing',
    ],
  },
  hybrid: {
    planName: 'Hybrid',
    price: '$24.99',
    cadence: '/mo',
    features: [
      '10 GB Vault storage',
      'Vault + Studio in one plan',
      'Publish directly from Vault',
      'Full creator suite',
    ],
  },
};

// ─── Experience descriptions ─────────────────────────────────────────────────

type ExperienceGateInfo = {
  description: string;
  iconName: AppIconKey;
};

const EXPERIENCE_GATE_INFO: Record<AppExperience, ExperienceGateInfo> = {
  shoouts: {
    description: 'Free marketplace for discovering and buying beats.',
    iconName: 'market',
  },
  vault: {
    description: 'Private workspace for audio projects, folders, and secure storage.',
    iconName: 'vault',
  },
  studio: {
    description: 'Seller workspace for publishing beats, promotion, and payouts.',
    iconName: 'studio',
  },
  hybrid: {
    description: 'Complete creator workflow — Vault and Studio in one dashboard.',
    iconName: 'hybrid',
  },
};

// ─── Upgrade target resolution ───────────────────────────────────────────────

/**
 * Returns the cheapest role that provides access to `experience` while also
 * covering the features the current user already has (so e.g. a studio user
 * wanting vault is sent to hybrid, not downgraded to vault).
 */
function resolveUpgradeTarget(
  currentRole: UserRole,
  experience: AppExperience
): UserRole {
  const roleOrder: UserRole[] = [
    'shoouts',
    'vault',
    'vault_pro',
    'studio',
    'hybrid',
  ];
  const currentExperience = ROLE_CONFIG[currentRole].defaultExperience;

  // Find the first role that covers both the requested experience AND the
  // user's current default experience.
  const best = roleOrder.find(
    (r) =>
      ROLE_CONFIG[r].availableExperiences.includes(experience) &&
      ROLE_CONFIG[r].availableExperiences.includes(currentExperience)
  );

  return best ?? 'hybrid';
}

// ─── Gate component ──────────────────────────────────────────────────────────

type SubscriptionGateProps = {
  experience: AppExperience;
  /** Pass children when used outside of a layout (wraps inline content). */
  children?: ReactNode;
};

/**
 * Renders children/the navigator when the user's role grants access to the
 * given experience. Otherwise renders a full-screen upgrade paywall.
 *
 * Intended for use in both layout files (pass no children — the Stack/Slot
 * renders when access is granted) and screen wrappers (pass children).
 */
export function SubscriptionGate({ experience, children }: SubscriptionGateProps) {
  const role = useAccountStore((state) => state.role);

  if (canAccessExperience(role, experience)) {
    return children ?? null;
  }

  return <UpgradePaywall experience={experience} currentRole={role} />;
}

// ─── Paywall ─────────────────────────────────────────────────────────────────

function UpgradePaywall({
  experience,
  currentRole,
}: {
  experience: AppExperience;
  currentRole: UserRole;
}) {
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top, insets.bottom);

  const upgradeRole = resolveUpgradeTarget(currentRole, experience);
  const planInfo = PLAN_GATE_INFO[upgradeRole];
  const expInfo = EXPERIENCE_GATE_INFO[experience];
  const expToken = experienceTokens[experience];
  const currentRoleConfig = getRoleConfig(currentRole);
  const toneMode = theme.isDark ? 'dark' : 'light';

  const ctaLabel =
    planInfo?.price === 'Free'
      ? `Get ${planInfo.planName} – Free`
      : planInfo
        ? `See ${planInfo.planName} plan – ${planInfo.price}${planInfo.cadence}`
        : 'View plans';

  function handleUpgrade() {
    router.push(
      `/settings/subscriptions?experience=${experience}` as any
    );
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)' as any);
    }
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header icon */}
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: expToken[toneMode].accentSoft, borderColor: expToken[toneMode].accentBorder },
          ]}
        >
          <Lock size={22} color={expToken.accent} strokeWidth={2.2} />
        </View>

        {/* Title block */}
        <View style={styles.titleBlock}>
          <AppText variant="eyebrow" tone="accent">
            Upgrade required
          </AppText>
          <AppText variant="pageHeading">
            Unlock {expInfo.iconName.charAt(0).toUpperCase() + expInfo.iconName.slice(1) === experience.charAt(0).toUpperCase() + experience.slice(1)
              ? experience.charAt(0).toUpperCase() + experience.slice(1)
              : expInfo.iconName.charAt(0).toUpperCase() + expInfo.iconName.slice(1)}
          </AppText>
          <AppText variant="body" tone="secondary" style={styles.description}>
            {expInfo.description}
          </AppText>
        </View>

        {/* Current plan indicator */}
        <View style={styles.currentPlanRow}>
          <AppText variant="caption" tone="muted">Your plan</AppText>
          <View style={styles.currentPlanBadge}>
            <AppText variant="caption" tone="secondary">
              {currentRoleConfig.label}
            </AppText>
          </View>
        </View>

        {/* Required plan card */}
        {planInfo ? (
          <View
            style={[
              styles.planCard,
              {
                backgroundColor: expToken[toneMode].accentSoft,
                borderColor: expToken[toneMode].accentBorder,
              },
            ]}
          >
            <View style={styles.planHeader}>
              <View style={styles.planTitleBlock}>
                <AppText variant="sectionHeading">{planInfo.planName}</AppText>
                <AppText variant="caption" tone="secondary">
                  Required to access {experience.charAt(0).toUpperCase() + experience.slice(1)}
                </AppText>
              </View>
              <View style={styles.pricePill}>
                <AppText variant="title" style={{ color: expToken.accent }}>
                  {planInfo.price}
                </AppText>
                {planInfo.cadence ? (
                  <AppText variant="caption" tone="muted">
                    {planInfo.cadence}
                  </AppText>
                ) : null}
              </View>
            </View>

            <View style={styles.featureList}>
              {planInfo.features.map((feature) => (
                <View key={feature} style={styles.featureRow}>
                  <AppIcon name="like" size="xs" tone="accent" variant="plain" />
                  <AppText variant="bodySmall" tone="secondary" style={styles.featureText}>
                    {feature}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky footer CTAs */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.upgradeCta,
            { backgroundColor: expToken.accent },
            pressed && { backgroundColor: expToken.accentPressed },
          ]}
          onPress={handleUpgrade}
        >
          <AppText variant="button" style={styles.upgradeCtaText}>
            {ctaLabel}
          </AppText>
        </Pressable>

        <Pressable style={styles.backButton} onPress={handleBack}>
          <AppText variant="button" tone="secondary">
            Go back
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(
  theme: ReturnType<typeof useThemeTokens>,
  topInset: number,
  bottomInset: number
) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingTop: Math.max(topInset + theme.spacing.lg, theme.spacing.xl),
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.lg,
      alignItems: 'center',
    },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleBlock: {
      alignItems: 'center',
      gap: theme.spacing.sm,
      maxWidth: 320,
    },
    description: {
      textAlign: 'center',
      lineHeight: 22,
    },
    currentPlanRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    currentPlanBadge: {
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
    },
    planCard: {
      width: '100%',
      borderRadius: theme.radius.xxl,
      borderWidth: 1,
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
    },
    planHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
    },
    planTitleBlock: {
      flex: 1,
      minWidth: 0,
      gap: theme.spacing.xs,
    },
    pricePill: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      alignItems: 'flex-end',
      flexShrink: 0,
    },
    featureList: {
      gap: theme.spacing.sm,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    featureText: {
      flex: 1,
      lineHeight: 20,
    },
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: Math.max(bottomInset, theme.spacing.xl),
      paddingTop: theme.spacing.md,
      gap: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    upgradeCta: {
      minHeight: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    upgradeCtaText: {
      color: '#FFFFFF',
    },
    backButton: {
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
