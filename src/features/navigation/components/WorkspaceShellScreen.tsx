import { AppIcon } from '@/src/components/ui/AppIcon';
import { AppText } from '@/src/components/ui/AppText';
import type { AppIconKey } from '@/src/components/ui/appIcons';
import { useThemeTokens } from '@/src/theme';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

type WorkspaceCard = {
  title: string;
  description: string;
  icon?: AppIconKey;
  onPress?: () => void;
};

type WorkspaceHighlight = {
  title: string;
  description: string;
};

type WorkspaceShellScreenProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: WorkspaceCard[];
  highlight?: WorkspaceHighlight;
  notice?: WorkspaceHighlight;
};

export function WorkspaceShellScreen({
  eyebrow,
  title,
  subtitle,
  cards,
  highlight,
  notice,
}: WorkspaceShellScreenProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AppText variant="eyebrow" tone="accent">
        {eyebrow}
      </AppText>
      <AppText variant="pageHeading">{title}</AppText>
      <AppText variant="body" tone="secondary" style={styles.subtitle}>
        {subtitle}
      </AppText>

      {highlight ? (
        <View style={styles.highlight}>
          <AppText variant="title">{highlight.title}</AppText>
          <AppText variant="bodySmall" tone="secondary" style={styles.highlightDescription}>
            {highlight.description}
          </AppText>
        </View>
      ) : null}

      <View style={styles.cardList}>
        {cards.map((card) => (
          <Pressable key={card.title} onPress={card.onPress} style={styles.card}>
            <View style={styles.cardHeader}>
              {card.icon ? (
                <View style={styles.iconWrap}>
                  <AppIcon name={card.icon} size="sm" tone="accent" stroke="regular" />
                </View>
              ) : null}
              <AppText variant="title" style={styles.cardTitle}>
                {card.title}
              </AppText>
            </View>
            <AppText variant="bodySmall" tone="secondary">
              {card.description}
            </AppText>
          </Pressable>
        ))}
      </View>

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

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: 130,
      gap: theme.spacing.md,
    },
    subtitle: {
      marginBottom: theme.spacing.sm,
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
      flexShrink: 1,
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
