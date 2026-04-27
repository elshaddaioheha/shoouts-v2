import { LoadingState } from '@/src/components/ui/LoadingState';
import { ReactNode, useEffect, useState } from 'react';

type StartupGateProps = {
  children: ReactNode;
};

export function StartupGate({ children }: StartupGateProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setReady(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  if (!ready) {
    return <LoadingState label="Starting Shoout..." />;
  }

  return <>{children}</>;
}