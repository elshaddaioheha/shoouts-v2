import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '@/src/config/firebase';
import { useAuthStore } from '@/src/features/auth/auth.store';

export default function DebugSignOut() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await signOut(auth);
      } catch {
        // ignore errors during sign-out
      }

      if (!mounted) return;

      clearSession();
      router.replace('/(auth)/onboarding');
    })();

    return () => {
      mounted = false;
    };
  }, [clearSession, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Signing out locally…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff' },
});
