import { can } from '@/src/features/access/access.helpers';
import type { FeaturePermission } from '@/src/features/access/access.types';
import { useAccountStore } from '@/src/features/account/account.store';
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

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  message: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#EC5C39',
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