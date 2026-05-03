import { BottomPillBar } from './BottomPillBar';
import { ExperienceSwitcher } from './ExperienceSwitcher';
import { HeaderWithGradient } from './HeaderWithGradient';
import { deriveExperienceFromPathname } from '@/src/features/navigation/navigation.helpers';
import { useExperienceNavigationStore } from '@/src/features/navigation/navigation.store';
import { layout, useThemeTokens } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname } from 'expo-router';
import { ReactNode, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Appends an 8-bit alpha hex suffix to a 6-digit hex color string. */
function withAlpha(hex: string, alphaHex: string) {
  if (hex.startsWith('#') && hex.length === 7) {
    return `${hex}${alphaHex}`;
  }
  return hex;
}

type AppShellProps = {
  children: ReactNode;
  showSwitcher?: boolean;
  showBottomBar?: boolean;
  reserveBottomBarSpace?: boolean;
  showBottomBarBackdrop?: boolean;
};

export function AppShell({
  children,
  showSwitcher = true,
  showBottomBar = true,
  reserveBottomBarSpace = true,
  showBottomBarBackdrop = true,
}: AppShellProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const routeExperience = deriveExperienceFromPathname(pathname);
  const activeExperience = useExperienceNavigationStore((state) => state.activeExperience);
  const setActiveExperience = useExperienceNavigationStore((state) => state.setActiveExperience);
  const bottomBarThemeKey = `${theme.mode}:${routeExperience}`;

  useEffect(() => {
    if (routeExperience !== activeExperience) {
      setActiveExperience(routeExperience);
    }
  }, [activeExperience, routeExperience, setActiveExperience]);

  return (
    <View style={styles.container}>
      {showSwitcher ? (
        <HeaderWithGradient>
          <ExperienceSwitcher />
        </HeaderWithGradient>
      ) : null}

      <View
        style={[
          styles.content,
          reserveBottomBarSpace && {
            paddingBottom:
              layout.bottomBarHeight +
              layout.bottomBarOffset +
              insets.bottom +
              theme.spacing.lg,
          },
        ]}
      >
        {children}
      </View>

      {showBottomBar && showBottomBarBackdrop ? (
        <LinearGradient
          key={`bottom-backdrop:${bottomBarThemeKey}`}
          pointerEvents="none"
          // Transparent at the top → opaque at the bottom so the pill floats
          // freely instead of sitting on a solid shelf.
          colors={[
            withAlpha(theme.colors.background, '00'),
            withAlpha(theme.colors.background, 'CC'),
            withAlpha(theme.colors.background, 'FF'),
          ]}
          locations={[0, 0.55, 1]}
          style={[
            styles.bottomBarBackdrop,
            {
              height:
                layout.bottomBarHeight +
                layout.bottomBarOffset +
                insets.bottom +
                theme.spacing.xxxl,
            },
          ]}
        />
      ) : null}

      {showBottomBar ? <BottomPillBar key={`bottom-bar:${bottomBarThemeKey}`} /> : null}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
    bottomBarBackdrop: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      // No backgroundColor — the gradient itself provides all coloring.
    },
  });
}
