import { useExperienceNavigationStore } from '@/src/features/navigation/navigation.store';
import { useColorScheme } from 'react-native';
import { darkPalette, lightPalette } from './colors';
import { experienceTokens } from './experienceTokens';
import { radius } from './radius';
import { spacing } from './spacing';
import { typography } from './typography';

export function useThemeTokens() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== 'light';
  const activeExperience = useExperienceNavigationStore((state) => state.activeExperience);

  const palette = isDark ? darkPalette : lightPalette;
  const experience = experienceTokens[activeExperience];

  return {
    isDark,
    colors: {
      ...palette,
      accent: experience.accent,
      accentSoft: isDark ? experience.accentSoftDark : experience.accentSoftLight,
    },
    experience,
    spacing,
    radius,
    typography,
  };
}
