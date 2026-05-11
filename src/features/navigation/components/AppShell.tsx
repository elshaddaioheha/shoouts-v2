import { BottomPillBar } from './BottomPillBar';
import { ExperienceSwitcher } from './ExperienceSwitcher';
import { HeaderWithGradient } from './HeaderWithGradient';
import { AppText } from '@/src/components/ui/AppText';
import { getStartupStatusCopy } from '@/src/config/backendStatus';
import {
  canAccessExperience,
  canPreviewExperience,
} from '@/src/features/access/access.helpers';
import { useAccountStore } from '@/src/features/account/account.store';
import { useAuthStore } from '@/src/features/auth/auth.store';
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
  showStartupNotice?: boolean;
};

export function AppShell({
  children,
  showSwitcher = true,
  showBottomBar = true,
  reserveBottomBarSpace = true,
  showBottomBarBackdrop = true,
  showStartupNotice = true,
}: AppShellProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const routeExperience = deriveExperienceFromPathname(pathname);
  const accountRole = useAccountStore((state) => state.role);
  const accountExperience = useAccountStore((state) => state.activeExperience);
  const setAccountExperience = useAccountStore((state) => state.setActiveExperience);
  const setPreviewExperience = useAccountStore((state) => state.setPreviewExperience);
  const activeExperience = useExperienceNavigationStore((state) => state.activeExperience);
  const setActiveExperience = useExperienceNavigationStore((state) => state.setActiveExperience);
  const startupStatus = useAuthStore((state) => state.startupStatus);
  const startupMessage = useAuthStore((state) => state.startupMessage);
  const bottomBarThemeKey = `${theme.mode}:${routeExperience}`;
  const startupCopy = getStartupStatusCopy(startupStatus, startupMessage);

  useEffect(() => {
    if (routeExperience !== activeExperience) {
      setActiveExperience(routeExperience);
    }
  }, [activeExperience, routeExperience, setActiveExperience]);

  useEffect(() => {
    if (routeExperience === accountExperience) {
      setPreviewExperience(null);
      return;
    }

    if (canAccessExperience(accountRole, routeExperience)) {
      setAccountExperience(routeExperience);
      setPreviewExperience(null);
      return;
    }

    if (canPreviewExperience(accountRole, routeExperience)) {
      setPreviewExperience(routeExperience);
    }
  }, [accountExperience, accountRole, routeExperience, setAccountExperience, setPreviewExperience]);

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
        {showStartupNotice && startupCopy ? (
          <View style={styles.startupNotice}>
            <AppText variant="caption" tone="accent">
              {startupCopy.title}
            </AppText>
            <AppText variant="bodySmall" tone="secondary" style={styles.startupNoticeText}>
              {startupCopy.message}
            </AppText>
          </View>
        ) : null}
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
    startupNotice: {
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    startupNoticeText: {
      lineHeight: 18,
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
