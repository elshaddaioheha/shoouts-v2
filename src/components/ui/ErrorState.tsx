import { AppText } from '@/src/components/ui/AppText';
import { useThemeTokens } from '@/src/theme';
import { Pressable, StyleSheet, View } from 'react-native';

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
      <AppText variant="sectionHeading">{title}</AppText>

      <AppText variant="body" tone="secondary" style={styles.message}>
        {message}
      </AppText>

      {onAction ? (
        <Pressable style={styles.button} onPress={onAction}>
          <AppText variant="button" style={styles.buttonText}>
            {actionLabel}
          </AppText>
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
      padding: theme.spacing.xxl,
    },
    message: {
      textAlign: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },
    button: {
      backgroundColor: theme.colors.accent,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.lg,
    },
    buttonText: {
      color: '#FFFFFF',
    },
  });
}
