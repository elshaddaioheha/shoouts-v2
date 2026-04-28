import { LoadingState } from '@/src/components/ui/LoadingState';
import { useAuthBootstrap } from '@/src/features/auth/useAuthBootstrap';
import { useAppFonts } from '@/src/theme/useAppFonts';
import { ReactNode } from 'react';

type StartupGateProps = {
  children: ReactNode;
};

export function StartupGate({ children }: StartupGateProps) {
  const { ready: authReady } = useAuthBootstrap();
  const { fontsLoaded, fontError } = useAppFonts();

  const ready = authReady && (fontsLoaded || Boolean(fontError));

  if (!ready) {
    return <LoadingState label="Starting Shoout..." />;
  }

  return <>{children}</>;
}
