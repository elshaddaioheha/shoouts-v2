import { classifyAuthStartupFailure } from '@/src/config/backendStatus';
import { getMissingEnvVars, hasRequiredEnv } from '@/src/config/env';
import { getFirebaseAuth } from '@/src/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { useAuthStore } from './auth.store';

export function useAuthBootstrap() {
  const ready = useAuthStore((s) => s.ready);
  const setReady = useAuthStore((s) => s.setReady);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);
  const setStartupState = useAuthStore((s) => s.setStartupState);

  useEffect(() => {
    let settled = false;

    const settle = () => {
      if (settled) return;
      settled = true;
      setReady(true);
    };

    if (!hasRequiredEnv()) {
      const missingVars = getMissingEnvVars();
      clearSession();
      setStartupState(
        'degraded_config',
        `Firebase configuration is missing: ${missingVars.join(', ')}. Buyer navigation still opens, but auth and synced reads stay limited.`
      );
      settle();
      return;
    }

    setStartupState('ready', null);

    const timeout = setTimeout(() => {
      clearSession();
      setStartupState(
        'degraded_auth',
        'Firebase auth did not respond during startup, so Shoouts opened in limited mode.'
      );
      settle();
    }, 5000);

    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onAuthStateChanged(
        getFirebaseAuth(),
        (user) => {
          clearTimeout(timeout);
          setStartupState('ready', null);

          if (user) {
            user.getIdTokenResult().then((tokenResult) => {
              setSession({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                isAdmin: tokenResult.claims['role'] === 'admin',
              });
            }).catch(() => {
              setSession({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
              });
            });
          } else {
            clearSession();
          }

          settle();
        },
        (error) => {
          clearTimeout(timeout);
          console.warn('[auth] Firebase auth listener failed.', error);
          clearSession();
          setStartupState(
            classifyAuthStartupFailure(error),
            error instanceof Error
              ? error.message
              : 'Firebase auth failed during startup, so Shoouts opened in limited mode.'
          );
          settle();
        }
      );
    } catch (error) {
      console.warn('[auth] Firebase auth bootstrap failed.', error);
      clearTimeout(timeout);
      clearSession();
      setStartupState(
        classifyAuthStartupFailure(error),
        error instanceof Error
          ? error.message
          : 'Firebase auth failed during startup, so Shoouts opened in limited mode.'
      );
      settle();
    }

    return () => {
      clearTimeout(timeout);
      unsubscribe?.();
    };
  }, [clearSession, setReady, setSession, setStartupState]);

  return { ready };
}
