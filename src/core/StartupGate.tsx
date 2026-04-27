import { LoadingState } from '@/src/components/ui/LoadingState';
import { useAuthBootstrap } from '@/src/features/auth/useAuthBootstrap';
import { ReactNode } from 'react';

type StartupGateProps = {
  children: ReactNode;
};

export function StartupGate({ children }: StartupGateProps) {
  const { ready } = useAuthBootstrap();

  if (!ready) {
    return <LoadingState label="Starting Shoout..." />;
  }

  return <>{children}</>;
}