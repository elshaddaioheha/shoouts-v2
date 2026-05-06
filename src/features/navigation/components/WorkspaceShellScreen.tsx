import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import type { AppIconKey } from '@/src/components/ui/appIcons';
import {
  canAccessExperience,
  getRoleConfig,
} from '@/src/features/access/access.helpers';
import type { AppExperience } from '@/src/features/access/access.types';
import { useAccountStore } from '@/src/features/account/account.store';
import { useThemeTokens } from '@/src/theme';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

type WorkspaceCardStatus = 'available' | 'shell' | 'locked';
type WorkflowStepStatus = 'ready' | 'next' | 'later';

type WorkspaceCard = {
  title: string;
  description: string;
  icon?: AppIconKey;
  status?: WorkspaceCardStatus;
  onPress?: () => void;
};

type WorkspaceHighlight = {
  title: string;
  description: string;
};

type WorkspaceMetric = {
  label: string;
  value: string;
  helper?: string;
};

type WorkflowStep = {
  title: string;
  description: string;
  status: WorkflowStepStatus;
};

type WorkspaceShellScreenProps = {
  experience?: AppExperience;
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: WorkspaceCard[];
  highlight?: WorkspaceHighlight;
  metrics?: WorkspaceMetric[];
  workflow?: WorkflowStep[];
  notice?: WorkspaceHighlight;
};

export function WorkspaceShellScreen({
  experience,
  eyebrow,
  title,
  subtitle,
  cards,
  highlight,
  metrics,
  workflow,
  notice,
}: WorkspaceShellScreenProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const profile = useAccountStore((state) => state.profile);
  const role = useAccountStore((state) => state.role);
  const roleConfig = getRoleConfig(role);
  const experienceUnlocked = experience ? canAccessExperience(role, experience) : true;
  const planLabel = formatLabel(profile?.subscriptionTier ?? roleConfig.id);
  const statusLabel = formatLabel(profile?.subscriptionStatus ?? 'free');

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AppText variant="eyebrow" tone="accent">
        {eyebrow}
      </AppText>
      <AppText variant="pageHeading">{title}</AppText>
      <AppText variant="body" tone="secondary" style={styles.subtitle}>
        {subtitle}
      </AppText>

      {experience ? (
        <View style={[styles.accessBanner, !experienceUnlocked && styles.previewBanner]}>
          <View style={styles.accessCopy}>
            <AppText variant="caption" tone={experienceUnlocked ? 'success' : 'accent'}>
              {experienceUnlocked ? 'Workspace included' : 'Preview workspace'}
            </AppText>
            <AppText variant="bodySmall" tone="secondary" style={styles.accessText}>
              {experienceUnlocked
                ? `${planLabel} plan - ${statusLabel} status`
                : `${planLabel} can preview this shell. Full actions stay gated until the plan is upgraded.`}
            </AppText>
          </View>
        </View>
      ) : null}

      {highlight ? (
        <View style={styles.highlight}>
          <AppText variant="title">{highlight.title}</AppText>
          <AppText variant="bodySmall" tone="secondary" style={styles.highlightDescription}>
            {highlight.description}
          </AppText>
        </View>
      ) : null}

      {metrics && metrics.length > 0 ? (
        <View style={styles.metricGrid}>
          {metrics.map((metric) => (
            <View key={metric.label} style={styles.metricCard}>
              <AppText variant="caption" tone="muted">
                {metric.label}
              </AppText>
              <AppText variant="sectionHeading">{metric.value}</AppText>
              {metric.helper ? (
                <AppText variant="caption" tone="secondary">
                  {metric.helper}
                </AppText>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.cardList}>
        {cards.map((card) => (
          <Pressable
            key={card.title}
            onPress={card.onPress}
            style={({ pressed }) => [
              styles.card,
              pressed ? styles.cardPressed : undefined,
            ]}
          >
            <View style={styles.cardHeader}>
              {card.icon ? (
                <View style={styles.iconWrap}>
                  <AppIcon name={card.icon} size="sm" tone="accent" stroke="regular" />
                </View>
              ) : null}
              <AppText variant="title" style={styles.cardTitle}>
                {card.title}
              </AppText>
              <View style={styles.cardBadge}>
                <AppText variant="caption" tone={getCardStatusTone(card.status)}>
                  {getCardStatusLabel(card.status)}
                </AppText>
              </View>
            </View>
            <AppText variant="bodySmall" tone="secondary">
              {card.description}
            </AppText>
          </Pressable>
        ))}
      </View>

      {workflow && workflow.length > 0 ? (
        <View style={styles.workflow}>
          <AppText variant="title">MVP workflow</AppText>
          {workflow.map((step, index) => (
            <View key={step.title} style={styles.workflowStep}>
              <View style={styles.stepIndex}>
                <AppText variant="caption" tone="accent">
                  {index + 1}
                </AppText>
              </View>
              <View style={styles.stepCopy}>
                <View style={styles.stepTitleRow}>
                  <AppText variant="bodySmall" style={styles.stepTitle}>
                    {step.title}
                  </AppText>
                  <AppText variant="caption" tone={getStepStatusTone(step.status)}>
                    {getStepStatusLabel(step.status)}
                  </AppText>
                </View>
                <AppText variant="caption" tone="secondary" style={styles.stepDescription}>
                  {step.description}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {notice ? (
        <View style={styles.notice}>
          <AppText variant="title">{notice.title}</AppText>
          <AppText variant="bodySmall" tone="secondary" style={styles.noticeDescription}>
            {notice.description}
          </AppText>
        </View>
      ) : null}
    </ScrollView>
  );
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').toUpperCase();
}

function getCardStatusLabel(status: WorkspaceCardStatus = 'shell') {
  if (status === 'available') return 'Ready';
  if (status === 'locked') return 'Gated';
  return 'Shell';
}

function getCardStatusTone(status: WorkspaceCardStatus = 'shell') {
  if (status === 'available') return 'success';
  if (status === 'locked') return 'warning';
  return 'muted';
}

function getStepStatusLabel(status: WorkflowStepStatus) {
  if (status === 'ready') return 'Ready';
  if (status === 'next') return 'Next';
  return 'Later';
}

function getStepStatusTone(status: WorkflowStepStatus) {
  if (status === 'ready') return 'success';
  if (status === 'next') return 'accent';
  return 'muted';
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      // AppShell.content already reserves bottomBarHeight + bottomBarOffset +
      // insets.bottom + spacing.lg via reserveBottomBarSpace. This padding adds
      // a little extra visual breathing room below the last card.
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.md,
    },
    subtitle: {
      marginBottom: theme.spacing.sm,
    },
    accessBanner: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.successSoft,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.md,
    },
    previewBanner: {
      backgroundColor: theme.colors.accentSoft,
      borderColor: theme.colors.accentBorder,
    },
    accessCopy: {
      gap: theme.spacing.xs,
    },
    accessText: {
      lineHeight: 18,
    },
    highlight: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      padding: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
    highlightDescription: {
      lineHeight: 18,
    },
    metricGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    metricCard: {
      flex: 1,
      minWidth: 140,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    cardList: {
      gap: theme.spacing.md,
    },
    card: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    cardPressed: {
      borderColor: theme.colors.accentBorder,
      backgroundColor: theme.colors.card,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    iconWrap: {
      width: 28,
      height: 28,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    cardTitle: {
      flex: 1,
      minWidth: 0,
    },
    cardBadge: {
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      flexShrink: 1,
    },
    workflow: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    workflowStep: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    stepIndex: {
      width: 28,
      height: 28,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      flexShrink: 0,
    },
    stepCopy: {
      flex: 1,
      gap: 2,
    },
    stepTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    stepTitle: {
      flex: 1,
      fontWeight: '800',
    },
    stepDescription: {
      lineHeight: 18,
    },
    notice: {
      marginTop: theme.spacing.sm,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
    noticeDescription: {
      lineHeight: 18,
    },
  });
}
