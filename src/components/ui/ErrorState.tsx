import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeTokens } from '@/src/theme';

type ErrorStateProps = {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again.',
  actionLabel = 'Retry',
  onAction,
}: ErrorStateProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {onAction ? (
        <Pressable style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
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
      padding: 24,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 8,
    },
    message: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 20,
    },
    button: {
      backgroundColor: theme.experience.accent,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
  });
}
