import { ExperienceSwitcher } from './ExperienceSwitcher';
import { BottomPillBar } from './BottomPillBar';
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
  return (
    <View style={styles.container}>
      {showSwitcher ? <ExperienceSwitcher /> : null}

      <View style={styles.content}>{children}</View>

      {showBottomBar ? <BottomPillBar /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#140F10',
  },
  content: {
    flex: 1,
    paddingBottom: 96,
  },
});
