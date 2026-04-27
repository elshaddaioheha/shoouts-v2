import { LoadingState } from '@/src/components/ui/LoadingState';
import { useAuthBootstrap } from '@/src/features/auth/useAuthBootstrap';
import { ReactNode, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/src/config/firebase';
import { useAuthStore } from '@/src/features/auth/auth.store';

type StartupGateProps = {
  children: ReactNode;
};

export function StartupGate({ children }: StartupGateProps) {
  const { ready } = useAuthBootstrap();
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    // Force sign-out on startup (temporary, dev-only helper).
    // This ensures onboarding appears for local testing even when
    // a Firebase session was persisted on the device.
    let mounted = true;

    (async () => {
      try {
        await signOut(auth);
      } catch {
        // ignore sign-out errors
      }

      if (!mounted) return;
      clearSession();
    })();

    return () => {
      mounted = false;
    };
  }, [clearSession]);

  if (!ready) {
    return <LoadingState label="Starting Shoout..." />;
  }

  return <>{children}</>;
}