import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { AppText } from '@/src/components/ui/AppText';
import { getFirebaseAuth } from '@/src/config/firebase';
import { useAccountStore } from '@/src/features/account/account.store';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { useCartStore } from '@/src/features/cart/cart.store';
import { useExperienceNavigationStore } from '@/src/features/navigation/navigation.store';
import { AppShell } from '@/src/features/navigation/components/AppShell';
import { useThemeTokens } from '@/src/theme';
import { StyleSheet, View } from 'react-native';

export default function SignOut() {
  const theme = useThemeTokens();
  const styles = createStyles(theme);
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);
  const resetAccount = useAccountStore((s) => s.resetAccount);
  const clearCart = useCartStore((s) => s.clearCart);
  const setActiveExperience = useExperienceNavigationStore((s) => s.setActiveExperience);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await signOut(getFirebaseAuth());
      } catch {
        // ignore errors during sign-out
      }

      if (!mounted) return;

      clearSession();
      resetAccount();
      clearCart();
      setActiveExperience('shoouts');
      router.replace('/(auth)/login');
    })();

    return () => {
      mounted = false;
    };
  }, [clearCart, clearSession, resetAccount, router, setActiveExperience]);

  return (
    <AppShell showBottomBar={false}>
      <View style={styles.container}>
        <AppText variant="sectionHeading">Signing out...</AppText>
        <AppText variant="bodySmall" tone="secondary" style={styles.copy}>
          Clearing local session and workspace state.
        </AppText>
      </View>
    </AppShell>
  );
}

function createStyles(theme: ReturnType<typeof useThemeTokens>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      backgroundColor: theme.colors.background,
      gap: theme.spacing.sm,
    },
    copy: {
      textAlign: 'center',
      lineHeight: 20,
    },
  });
}
