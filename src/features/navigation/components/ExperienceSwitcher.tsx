import { AppText } from '@/src/components/ui/AppText';
import {
  canAccessExperience,
  canPreviewExperience,
} from '@/src/features/access/access.helpers';
import type { AppExperience } from '@/src/features/access/access.types';
import { useAccountStore } from '@/src/features/account/account.store';
import { EXPERIENCE_NAVIGATION } from '@/src/features/navigation/navigation.config';
import { useExperienceNavigationStore } from '@/src/features/navigation/navigation.store';
import { layout, useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

const experiences: AppExperience[] = ['shoouts', 'vault', 'studio', 'hybrid'];

export function ExperienceSwitcher() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const role = useAccountStore((state) => state.role);
  const activeExperience = useExperienceNavigationStore((state) => state.activeExperience);
  const setActiveExperience = useExperienceNavigationStore((state) => state.setActiveExperience);

  function handleSwitch(experience: AppExperience) {
    const canPreview = canPreviewExperience(role, experience);
    if (!canPreview) return;

    setActiveExperience(experience);
    const config = EXPERIENCE_NAVIGATION[experience];
    router.replace(config.defaultRoute as any);
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        {experiences.map((experience) => {
          const config = EXPERIENCE_NAVIGATION[experience];
          const active = activeExperience === experience;
          const unlocked = canAccessExperience(role, experience);
          const previewable = canPreviewExperience(role, experience);

          return (
            <Pressable
              key={experience}
              onPress={() => handleSwitch(experience)}
              disabled={!previewable}
              style={[
                styles.pill,
                active && styles.activePill,
                !unlocked && styles.previewPill,
                !previewable && styles.disabledPill,
              ]}
            >
              <AppText
                variant="caption"
                tone={active ? 'primary' : 'secondary'}
                numberOfLines={1}
                style={active ? styles.activeText : undefined}
              >
                {config.label}
                {!unlocked ? ' Preview' : ''}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    wrapper: {
      width: '100%',
      height: layout.topSwitcherHeight,
      maxHeight: layout.topSwitcherHeight,
      minHeight: layout.topSwitcherHeight,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xs,
      backgroundColor: theme.colors.background,
    },
    scroll: {
      flexGrow: 0,
      flexShrink: 0,
      height: 42,
      maxHeight: 42,
    },
    content: {
      height: 42,
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
    },
    pill: {
      height: 38,
      minHeight: 38,
      maxHeight: 38,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activePill: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    previewPill: {
      borderStyle: 'dashed',
      borderColor: theme.colors.accentBorder,
    },
    disabledPill: {
      opacity: 0.45,
    },
    activeText: {
      color: '#FFFFFF',
    },
  });
}
