import { BottomPillBar } from './BottomPillBar';
import { ExperienceSwitcher } from './ExperienceSwitcher';
import { layout, useThemeTokens } from '@/src/theme';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type AppShellProps = {
  children: ReactNode;
  showSwitcher?: boolean;
  showBottomBar?: boolean;
};

export function AppShell({
  children,
  showSwitcher = true,
  showBottomBar = true,
}: AppShellProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {showSwitcher ? <ExperienceSwitcher /> : null}

      <View style={styles.content}>{children}</View>

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
      paddingBottom: layout.bottomBarHeight + layout.bottomBarOffset + theme.spacing.lg,
    },
  });
}
