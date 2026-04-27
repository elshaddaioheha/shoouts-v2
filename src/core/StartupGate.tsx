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
  // NOTE: Temporary forced sign-out removed so onboarding/role selection
  // no longer get triggered unexpectedly. If you need a dev-only
  // forced sign-out, wrap the logic below with a feature flag or
  // set `if (__DEV__) { ... }` and uncomment.

  if (!ready) {
    return <LoadingState label="Starting Shoout..." />;
  }

  return <>{children}</>;
}