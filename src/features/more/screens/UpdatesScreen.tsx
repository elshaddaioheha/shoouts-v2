import { AppText } from '@/src/components/ui/AppText';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { normalizeExperienceValue } from '@/src/features/navigation/navigation.helpers';
import { useThemeTokens } from '@/src/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { Bell, ShieldCheck, Sparkles } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

type UpdateItem = {
  id: string;
  title: string;
  description: string;
  icon: 'bell' | 'security' | 'release';
};

const DEFAULT_UPDATES: UpdateItem[] = [
  {
    id: 'security',
    title: 'Account hardening active',
    description: 'Profile and subscription fallbacks are now used when user docs are sparse.',
    icon: 'security',
  },
  {
    id: 'player',
    title: 'Player behavior update',
    description: 'Explore and settings now suppress playback so those surfaces stay focused.',
    icon: 'release',
  },
  {
    id: 'alerts',
    title: 'Notification inbox shell',
    description: 'This page is now your shared updates destination across all workspaces.',
    icon: 'bell',
  },
];

export function UpdatesScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const { source } = useLocalSearchParams<{ source?: string }>();
  const sourceExperience = normalizeExperienceValue(source);
  const sourceLabel = sourceExperience
    ? `${sourceExperience.charAt(0).toUpperCase()}${sourceExperience.slice(1)} updates`
    : 'App updates';

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <AppText variant="button" tone="secondary">
            Back
          </AppText>
        </Pressable>

        <AppText variant="eyebrow" tone="accent">
          Updates
        </AppText>
        <AppText variant="pageHeading">Notifications</AppText>
        <AppText variant="bodySmall" tone="secondary">
          {sourceLabel}
        </AppText>

        <View style={styles.list}>
          {DEFAULT_UPDATES.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.iconWrap}>{renderIcon(item.icon)}</View>
              <View style={styles.copy}>
                <AppText variant="title">{item.title}</AppText>
                <AppText variant="bodySmall" tone="secondary">
                  {item.description}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </AppShell>
  );

  function renderIcon(icon: UpdateItem['icon']) {
    if (icon === 'security') {
      return <ShieldCheck size={20} color={theme.colors.accent} />;
    }

    if (icon === 'release') {
      return <Sparkles size={20} color={theme.colors.accent} />;
    }

    return <Bell size={20} color={theme.colors.accent} />;
  }
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      backgroundColor: theme.colors.background,
      gap: theme.spacing.md,
    },
    backButton: {
      alignSelf: 'flex-start',
      minHeight: 34,
      justifyContent: 'center',
    },
    list: {
      gap: theme.spacing.sm,
    },
    card: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      padding: theme.spacing.md,
      flexDirection: 'row',
      gap: theme.spacing.md,
      alignItems: 'flex-start',
    },
    iconWrap: {
      width: theme.layout.minTouchTarget,
      height: theme.layout.minTouchTarget,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    copy: {
      flex: 1,
      gap: theme.spacing.xs,
    },
  });
}
