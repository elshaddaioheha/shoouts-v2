import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import type { AppIconKey } from '@/src/components/ui/appIcons';
import {
  canAccessExperience,
  getRoleConfig,
} from '@/src/features/access/access.helpers';
import type { AppExperience, UserRole } from '@/src/features/access/access.types';
import { useAccountStore } from '@/src/features/account/account.store';
import { openExperienceWelcome } from '@/src/features/navigation/experienceWelcome';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { experienceTokens, useThemeTokens } from '@/src/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

type SubscriptionFeature = {
  title: string;
  description: string;
};

type SubscriptionPlanCard = {
  id: UserRole;
  name: string;
  price: string;
  cadence: string;
  summary: string;
  features: string[];
};

type SubscriptionExperienceConfig = {
  experience: AppExperience;
  title: string;
  subtitle: string;
  icon: AppIconKey;
  features: SubscriptionFeature[];
  plans: SubscriptionPlanCard[];
};

const experienceOrder: AppExperience[] = ['shoouts', 'vault', 'studio', 'hybrid'];

const subscriptionConfig: Record<AppExperience, SubscriptionExperienceConfig> = {
  shoouts: {
    experience: 'shoouts',
    title: 'Shoouts',
    subtitle: 'Buyer-first discovery, cart, downloads, and marketplace access.',
    icon: 'market',
    features: [
      {
        title: 'Discover public uploads',
        description: 'Browse real marketplace listings from Firestore.',
      },
      {
        title: 'Review cart locally',
        description: 'Save items for checkout without pretending payment is live.',
      },
    ],
    plans: [
      {
        id: 'shoouts',
        name: 'Shoouts',
        price: 'Free',
        cadence: 'included',
        summary: 'Marketplace browsing and buyer library access.',
        features: ['Explore feed', 'Cart review', 'Downloads shell'],
      },
    ],
  },
  vault: {
    experience: 'vault',
    title: 'Vault',
    subtitle: 'Private creator workspace for ideas, folders, drafts, and safe storage.',
    icon: 'vault',
    features: [
      {
        title: 'Private workspace shell',
        description: 'Folders, recording, sharing, and storage states are mapped.',
      },
      {
        title: 'Upgrade path ready',
        description: 'Vault Pro limits are visible before storage writes go live.',
      },
    ],
    plans: [
      {
        id: 'vault',
        name: 'Vault',
        price: 'Free',
        cadence: 'starter',
        summary: 'Private workspace shell with starter storage limits.',
        features: ['50 private uploads', '0.05 GB storage', 'Folder shell'],
      },
      {
        id: 'vault_pro',
        name: 'Vault Pro',
        price: '$5.99',
        cadence: 'per month',
        summary: 'Higher-storage private workspace for creators.',
        features: ['500 private uploads', '5 GB storage', 'Private sharing path'],
      },
    ],
  },
  studio: {
    experience: 'studio',
    title: 'Studio',
    subtitle: 'Seller workspace for listings, publishing, promotion, and analytics.',
    icon: 'studio',
    features: [
      {
        title: 'Listing lifecycle',
        description: 'Draft, edit, archive, and analytics shells are in place.',
      },
      {
        title: 'Seller readiness',
        description: 'Verification and payout state are surfaced from account profile.',
      },
    ],
    plans: [
      {
        id: 'studio',
        name: 'Studio',
        price: '$18.99',
        cadence: 'per month',
        summary: 'Seller catalog tools and marketplace publishing path.',
        features: ['Unlimited listing shell', 'Seller messaging path', 'Analytics shell'],
      },
    ],
  },
  hybrid: {
    experience: 'hybrid',
    title: 'Hybrid',
    subtitle: 'Vault and Studio together for private-to-public creator workflows.',
    icon: 'hybrid',
    features: [
      {
        title: 'Vault to Studio',
        description: 'Move from private drafts to marketplace-ready releases.',
      },
      {
        title: 'Publish checkpoint',
        description: 'Publishing remains gated until secure storage and entitlement work lands.',
      },
    ],
    plans: [
      {
        id: 'hybrid',
        name: 'Hybrid',
        price: '$24.99',
        cadence: 'per month',
        summary: 'Complete creator workflow across Vault, Studio, and publishing.',
        features: ['10 GB storage', 'Publish from Vault path', 'Promotion and analytics shells'],
      },
    ],
  },
};

export function SubscriptionsScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const role = useAccountStore((state) => state.role);
  const profile = useAccountStore((state) => state.profile);
  const { experience: rawExperience } = useLocalSearchParams<{ experience?: string }>();
  const activeExperience = normalizeExperience(rawExperience);
  const activeConfig = activeExperience ? subscriptionConfig[activeExperience] : null;
  const roleConfig = getRoleConfig(role);
  const planLabel = formatLabel(profile?.subscriptionTier ?? roleConfig.id);
  const statusLabel = formatLabel(profile?.subscriptionStatus ?? 'free');
  const toneMode = theme.isDark ? 'dark' : 'light';

  function openExperience(experience: AppExperience) {
    openExperienceWelcome({
      experience,
      nextRoute: `/settings/subscriptions?experience=${experience}`,
    });
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <AppText variant="button" tone="secondary">
            Back
          </AppText>
        </Pressable>

        <View style={styles.header}>
          <AppText variant="eyebrow" tone="accent">
            Subscriptions
          </AppText>
          <AppText variant="pageHeading">Choose your experience</AppText>
          <AppText variant="body" tone="secondary" style={styles.subtitle}>
            Select a workspace to preview the plan details. Each experience opens with its
            own welcome transition so switching feels intentional.
          </AppText>
        </View>

        <View style={styles.currentPlanCard}>
          <AppText variant="caption" tone="muted">
            Current account state
          </AppText>
          <AppText variant="sectionHeading">{planLabel}</AppText>
          <AppText variant="bodySmall" tone="secondary">
            Subscription status: {statusLabel}
          </AppText>
        </View>

        <View style={styles.categoryGrid}>
          {experienceOrder.map((experience) => {
            const config = subscriptionConfig[experience];
            const token = experienceTokens[experience];
            const isActive = activeExperience === experience;
            const included = canAccessExperience(role, experience);

            return (
              <Pressable
                key={experience}
                onPress={() => openExperience(experience)}
                style={({ pressed }) => [
                  styles.categoryCard,
                  {
                    borderColor: isActive ? token.accent : theme.colors.borderStrong,
                    backgroundColor: isActive
                      ? token[toneMode].accentSoft
                      : theme.colors.surfaceElevated,
                  },
                  pressed ? styles.cardPressed : undefined,
                ]}
              >
                <View style={[styles.categoryIcon, { backgroundColor: token[toneMode].accentSoft }]}>
                  <AppIcon name={config.icon} size="sm" tone="accent" stroke="bold" />
                </View>
                <View style={styles.categoryCopy}>
                  <AppText variant="title">{config.title}</AppText>
                  <AppText variant="caption" tone={included ? 'success' : 'accent'}>
                    {included ? 'Included' : 'Preview'}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </View>

        {activeConfig ? (
          <ExperiencePlanSection config={activeConfig} />
        ) : (
          <View style={styles.emptyPrompt}>
            <AppText variant="title">Pick an experience</AppText>
            <AppText variant="bodySmall" tone="secondary" style={styles.emptyText}>
              Choose Shoouts, Vault, Studio, or Hybrid above to see its subscription screen.
            </AppText>
          </View>
        )}
      </ScrollView>
    </AppShell>
  );
}

function ExperiencePlanSection({ config }: { config: SubscriptionExperienceConfig }) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const token = experienceTokens[config.experience];
  const toneMode = theme.isDark ? 'dark' : 'light';

  return (
    <View style={styles.planSection}>
      <View
        style={[
          styles.planHero,
          {
            backgroundColor: token[toneMode].accentSoft,
            borderColor: token[toneMode].accentBorder,
          },
        ]}
      >
        <View style={styles.planHeroIcon}>
          <AppIcon name={config.icon} size="lg" tone="accent" stroke="bold" />
        </View>
        <View style={styles.planHeroCopy}>
          <AppText variant="eyebrow" tone="accent">
            Welcome path active
          </AppText>
          <AppText variant="pageHeading">{config.title}</AppText>
          <AppText variant="bodySmall" tone="secondary" style={styles.planHeroText}>
            {config.subtitle}
          </AppText>
        </View>
      </View>

      <View style={styles.featureList}>
        {config.features.map((feature) => (
          <View key={feature.title} style={styles.featureCard}>
            <AppText variant="title">{feature.title}</AppText>
            <AppText variant="bodySmall" tone="secondary" style={styles.featureDescription}>
              {feature.description}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.planList}>
        {config.plans.map((plan) => (
          <View key={plan.id} style={styles.planCard}>
            <View style={styles.planHeader}>
              <View>
                <AppText variant="sectionHeading">{plan.name}</AppText>
                <AppText variant="bodySmall" tone="secondary">
                  {plan.summary}
                </AppText>
              </View>
              <View style={styles.pricePill}>
                <AppText variant="title" tone="accent">
                  {plan.price}
                </AppText>
                <AppText variant="caption" tone="muted">
                  {plan.cadence}
                </AppText>
              </View>
            </View>

            <View style={styles.planFeatureList}>
              {plan.features.map((feature) => (
                <View key={feature} style={styles.planFeatureRow}>
                  <View style={styles.featureDot} />
                  <AppText variant="bodySmall" tone="secondary" style={styles.planFeatureText}>
                    {feature}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={styles.paymentNotice}>
              <AppText variant="caption" tone="muted">
                Checkout remains gated until secure subscription activation is connected.
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function normalizeExperience(value: unknown): AppExperience | null {
  if (
    value === 'shoouts' ||
    value === 'vault' ||
    value === 'studio' ||
    value === 'hybrid'
  ) {
    return value;
  }

  return null;
}

function formatLabel(value: string) {
  return value.replace('_', ' ').toUpperCase();
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: 130,
      gap: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    backButton: {
      alignSelf: 'flex-start',
      minHeight: 34,
      justifyContent: 'center',
    },
    header: {
      gap: theme.spacing.sm,
    },
    subtitle: {
      lineHeight: 22,
      maxWidth: 620,
    },
    currentPlanCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    categoryCard: {
      flexGrow: 1,
      flexBasis: '47%',
      minWidth: 150,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    cardPressed: {
      opacity: 0.9,
    },
    categoryIcon: {
      width: 42,
      height: 42,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      flexShrink: 0,
    },
    categoryCopy: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    emptyPrompt: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    emptyText: {
      lineHeight: 20,
    },
    planSection: {
      gap: theme.spacing.lg,
    },
    planHero: {
      borderRadius: theme.radius.xxl,
      borderWidth: 1,
      padding: theme.spacing.lg,
      flexDirection: 'row',
      gap: theme.spacing.md,
      alignItems: 'center',
    },
    planHeroIcon: {
      width: 58,
      height: 58,
      borderRadius: theme.radius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      flexShrink: 0,
    },
    planHeroCopy: {
      flex: 1,
      minWidth: 0,
      gap: theme.spacing.xs,
    },
    planHeroText: {
      lineHeight: 20,
    },
    featureList: {
      gap: theme.spacing.sm,
    },
    featureCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
    featureDescription: {
      lineHeight: 20,
    },
    planList: {
      gap: theme.spacing.md,
    },
    planCard: {
      borderRadius: theme.radius.xxl,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
      ...theme.shadows.md,
    },
    planHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      alignItems: 'flex-start',
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
    planFeatureList: {
      gap: theme.spacing.sm,
    },
    planFeatureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    featureDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.accent,
    },
    planFeatureText: {
      flex: 1,
      lineHeight: 20,
    },
    paymentNotice: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.md,
    },
  });
}
