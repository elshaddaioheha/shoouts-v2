import { getFirebaseAuth } from '@/src/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { useAuthStore } from './auth.store';

export function useAuthBootstrap() {
  const ready = useAuthStore((s) => s.ready);
  const setReady = useAuthStore((s) => s.setReady);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    let settled = false;

    const settle = () => {
      if (settled) return;
      settled = true;
      setReady(true);
    };

    const timeout = setTimeout(() => {
      clearSession();
      settle();
    }, 5000);

    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onAuthStateChanged(
        getFirebaseAuth(),
        (user) => {
          clearTimeout(timeout);

          if (user) {
            setSession({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
            });
          } else {
            clearSession();
          }

          settle();
        },
        () => {
          clearTimeout(timeout);
          clearSession();
          settle();
        }
      );
    } catch (error) {
      console.warn('[auth] Firebase auth bootstrap failed.', error);
      clearTimeout(timeout);
      clearSession();
      settle();
    }

    return () => {
      clearTimeout(timeout);
      unsubscribe?.();
    };
  }, [clearSession, setReady, setSession]);

  return { ready };
}
