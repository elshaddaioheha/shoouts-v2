import { BottomPillBar } from './BottomPillBar';
import { ExperienceSwitcher } from './ExperienceSwitcher';
import { HeaderWithGradient } from './HeaderWithGradient';
import { deriveExperienceFromPathname } from '@/src/features/navigation/navigation.helpers';
import { useExperienceNavigationStore } from '@/src/features/navigation/navigation.store';
import { layout, useThemeTokens } from '@/src/theme';
import { usePathname } from 'expo-router';
import { ReactNode, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const activeExperience = useExperienceNavigationStore((state) => state.activeExperience);
  const setActiveExperience = useExperienceNavigationStore((state) => state.setActiveExperience);

  useEffect(() => {
    const routeExperience = deriveExperienceFromPathname(pathname);

    if (routeExperience !== activeExperience) {
      setActiveExperience(routeExperience);
    }
  }, [activeExperience, pathname, setActiveExperience]);

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
        <View
          pointerEvents="none"
          style={[
            styles.bottomBarBackdrop,
            {
              height:
                layout.bottomBarHeight +
                layout.bottomBarOffset +
                insets.bottom +
                theme.spacing.lg,
            },
          ]}
        />
      ) : null}

      {showBottomBar ? <BottomPillBar /> : null}
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
      backgroundColor: theme.colors.background,
    },
  });
}
