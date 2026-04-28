import { useExperienceNavigationStore } from '@/src/features/navigation/navigation.store';
import { useColorScheme } from 'react-native';
import { experienceTokens } from './experienceTokens';
import { neutralPalettes } from './neutralPalettes';
import { radius } from './radius';
import { semanticColors } from './semanticColors';
import { spacing } from './spacing';
import { typography } from './typography';

export function useThemeTokens() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== 'light';
  const activeExperience = useExperienceNavigationStore((state) => state.activeExperience);

  const mode = isDark ? 'dark' : 'light';
  const neutral = isDark ? neutralPalettes.dark : neutralPalettes.light;
  const experience = experienceTokens[activeExperience];
  const experienceMode = isDark ? experience.dark : experience.light;

  return {
    isDark,
    mode,
    experience,

    colors: {
      ...neutral,

      background: experienceMode.background,
      surface: experienceMode.surface,
      surfaceElevated: experienceMode.surfaceElevated,

      accent: experience.accent,
      accentHover: experience.accentHover,
      accentPressed: experience.accentPressed,
      accentSoft: experienceMode.accentSoft,
      accentSoftDark: experience.dark.accentSoft,
      accentSoftLight: experience.light.accentSoft,
      accentBorder: experienceMode.accentBorder,

      success: semanticColors.success.base,
      warning: semanticColors.warning.base,
      danger: semanticColors.danger.base,
      error: semanticColors.danger.base,
      info: semanticColors.info.base,

      successSoft: isDark
        ? semanticColors.success.softDark
        : semanticColors.success.softLight,
      warningSoft: isDark
        ? semanticColors.warning.softDark
        : semanticColors.warning.softLight,
      dangerSoft: isDark
        ? semanticColors.danger.softDark
        : semanticColors.danger.softLight,
      infoSoft: isDark
        ? semanticColors.info.softDark
        : semanticColors.info.softLight,

      card: experienceMode.surfaceElevated,
      cardBorder: neutral.border,
    },

    spacing,
    radius,
    typography,
  };
}
