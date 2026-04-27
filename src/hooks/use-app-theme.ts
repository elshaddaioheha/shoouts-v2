import { useColorScheme } from 'react-native';

const darkColors = {
  background: '#140F10',
  surface: '#1E1819',
  surfaceElevated: '#2A2022',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.72)',
  textMuted: 'rgba(255,255,255,0.5)',
  textPlaceholder: 'rgba(255,255,255,0.45)',
  border: 'rgba(255,255,255,0.14)',
  primary: '#EC5C39',
  accent: '#EC5C39',
};

const lightColors = {
  background: '#FFF4EE',
  surface: '#FFF9F6',
  surfaceElevated: '#FFFFFF',
  textPrimary: '#2F2624',
  textSecondary: '#6F5A53',
  textMuted: '#8A756D',
  textPlaceholder: '#A08D86',
  border: '#D8B9AD',
  primary: '#EC5C39',
  accent: '#EC5C39',
};

export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
  };
}
