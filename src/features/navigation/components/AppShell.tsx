import { BottomPillBar } from './BottomPillBar';
import { ExperienceSwitcher } from './ExperienceSwitcher';
import { layout, useThemeTokens } from '@/src/theme';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type AppShellProps = {
  children: ReactNode;
  showSwitcher?: boolean;
  showBottomBar?: boolean;
  reserveBottomBarSpace?: boolean;
};

export function AppShell({
  children,
  showSwitcher = true,
  showBottomBar = true,
  reserveBottomBarSpace = true,
}: AppShellProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {showSwitcher ? <ExperienceSwitcher /> : null}

      <View
        style={[
          styles.content,
          reserveBottomBarSpace && styles.contentWithBottomBarSpace,
        ]}
      >
        {children}
      </View>

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
    contentWithBottomBarSpace: {
      paddingBottom: layout.bottomBarHeight + layout.bottomBarOffset + theme.spacing.lg,
    },
  });
}
