import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { StyleSheet, Text, View } from 'react-native';

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 28,
      fontWeight: '800',
    },
    subtitle: {
      color: theme.colors.textSecondary,
      marginTop: 8,
    },
  });
}

export function DownloadsScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  return (
    <AppShell>
      <View style={styles.container}>
        <Text style={styles.title}>
          Downloads
        </Text>
        <Text style={styles.subtitle}>
          Downloads workspace coming next.
        </Text>
      </View>
    </AppShell>
  );
}
