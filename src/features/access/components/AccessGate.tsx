import { can } from '@/src/features/access/access.helpers';
import type { FeaturePermission } from '@/src/features/access/access.types';
import { useAccountStore } from '@/src/features/account/account.store';
import { useThemeTokens } from '@/src/theme';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type AccessGateProps = {
  permission: FeaturePermission;
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onUpgrade?: () => void;
};

export function AccessGate({
  permission,
  children,
  fallbackTitle = 'Upgrade required',
  fallbackMessage = 'This feature is not included in your current plan.',
  onUpgrade,
}: AccessGateProps) {
  const role = useAccountStore((state) => state.role);
  const theme = useThemeTokens();
  const styles = createStyles(theme);

  if (can(role, permission)) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{fallbackTitle}</Text>
      <Text style={styles.message}>{fallbackMessage}</Text>

      {onUpgrade ? (
        <Pressable style={styles.button} onPress={onUpgrade}>
          <Text style={styles.buttonText}>View upgrade options</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      padding: 20,
      borderRadius: 18,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 6,
    },
    message: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 14,
    },
    button: {
      backgroundColor: theme.experience.accent,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '800',
    },
  });
}