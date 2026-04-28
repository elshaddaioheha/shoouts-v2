import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useThemeTokens } from '@/src/theme';

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Loading...' }: LoadingStateProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.colors.accent} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.md,
    },
    label: {
      color: theme.colors.textPrimary,
      ...theme.typography.body,
    },
  });
}
