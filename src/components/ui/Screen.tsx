import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeTokens } from '@/src/theme';

type ScreenProps = {
  children: ReactNode;
  padded?: boolean;
  keyboard?: boolean;
};

export function Screen({ children, padded = true, keyboard = false }: ScreenProps) {
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  const content = (
    <SafeAreaView style={[styles.container, padded && styles.padded]}>
      {children}
    </SafeAreaView>
  );

  if (!keyboard) return content;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    padded: {
      paddingHorizontal: theme.spacing.lg,
    },
  });
}