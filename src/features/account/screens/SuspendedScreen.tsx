import { AppText } from '@/src/components/ui/AppText';
import { getFirebaseAuth } from '@/src/config/firebase';
import { useAccountStore } from '@/src/features/account/account.store';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { useExperienceNavigationStore } from '@/src/features/navigation/navigation.store';
import { useThemeTokens } from '@/src/theme';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

export function SuspendedScreen() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const clearSession = useAuthStore((s) => s.clearSession);
  const resetAccount = useAccountStore((s) => s.resetAccount);
  const setActiveExperience = useExperienceNavigationStore((s) => s.setActiveExperience);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut(getFirebaseAuth());
    } catch {
      // ignore — onAuthStateChanged handles the rest
    }
    clearSession();
    resetAccount();
    setActiveExperience('shoouts');
  }

  return (
    <View style={styles.container}>
      <AppText variant="sectionHeading" style={styles.title}>
        Account suspended
      </AppText>
      <AppText variant="body" tone="secondary" style={styles.body}>
        Your account has been suspended. If you believe this is a mistake, please contact support.
      </AppText>
      <Pressable style={styles.button} onPress={handleSignOut} disabled={signingOut}>
        {signingOut ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <AppText variant="button" style={styles.buttonText}>
            Sign out
          </AppText>
        )}
      </Pressable>
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
    title: {
      textAlign: 'center',
    },
    body: {
      textAlign: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
      lineHeight: 22,
    },
    button: {
      backgroundColor: theme.colors.accent,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.lg,
      minWidth: 120,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
    },
  });
}
