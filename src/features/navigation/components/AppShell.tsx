import { ExperienceSwitcher } from './ExperienceSwitcher';
import { BottomPillBar } from './BottomPillBar';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeTokens } from '@/src/theme';

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
      paddingBottom: 96,
    },
  });
}
