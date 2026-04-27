import {
  canAccessExperience,
  canPreviewExperience,
} from '@/src/features/access/access.helpers';
import type { AppExperience } from '@/src/features/access/access.types';
import { useAccountStore } from '@/src/features/account/account.store';
import { EXPERIENCE_NAVIGATION } from '@/src/features/navigation/navigation.config';
import { useExperienceNavigationStore } from '@/src/features/navigation/navigation.store';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const experiences: AppExperience[] = ['shoouts', 'vault', 'studio', 'hybrid'];

export function ExperienceSwitcher() {
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
              ]}
            >
              <Text
                numberOfLines={1}
                style={[styles.text, active && styles.activeText]}
              >
                {config.label}
                {!unlocked ? ' Preview' : ''}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 56,
    maxHeight: 56,
    minHeight: 56,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: '#140F10',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    backgroundColor: '#EC5C39',
    borderColor: '#EC5C39',
  },
  previewPill: {
    borderStyle: 'dashed',
  },
  text: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '700',
  },
  activeText: {
    color: '#FFFFFF',
  },
});
