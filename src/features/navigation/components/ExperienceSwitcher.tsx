import { AppText } from '@/src/components/ui/AppText';
import {
  canAccessExperience,
  canPreviewExperience,
} from '@/src/features/access/access.helpers';
import type { AppExperience } from '@/src/features/access/access.types';
import { useAccountStore } from '@/src/features/account/account.store';
import { EXPERIENCE_NAVIGATION } from '@/src/features/navigation/navigation.config';
import { useExperienceNavigationStore } from '@/src/features/navigation/navigation.store';
import { useThemeTokens } from '@/src/theme';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

const experiences: AppExperience[] = ['shoouts', 'vault', 'studio', 'hybrid'];

export function ExperienceSwitcher() {
  const role = useAccountStore((state) => state.role);
  const activeExperience = useExperienceNavigationStore((state) => state.activeExperience);
  const setActiveExperience = useExperienceNavigationStore((state) => state.setActiveExperience);
  const theme = useThemeTokens();
  const styles = createStyles(theme);

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
              ]}
            >
              <AppText
                variant="caption"
                tone={active ? 'primary' : 'secondary'}
                numberOfLines={1}
                style={active && styles.activeText}
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
      height: 56,
      maxHeight: 56,
      minHeight: 56,
      paddingTop: 8,
      paddingBottom: 6,
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
      gap: 8,
      paddingHorizontal: 16,
    },
    pill: {
      height: 38,
      maxHeight: 38,
      minHeight: 38,
      paddingHorizontal: 14,
      borderRadius: 999,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activePill: {
      backgroundColor: theme.experience.accent,
      borderColor: theme.experience.accent,
    },
    previewPill: {
      borderStyle: 'dashed',
    },
    activeText: {
      color: '#FFFFFF',
    },
  });
}
