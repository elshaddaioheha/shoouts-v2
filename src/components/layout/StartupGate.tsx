import { PropsWithChildren, useCallback, useEffect, useState } from 'react';

import { ErrorState } from '@/src/components/ui/ErrorState';
import { LoadingState } from '@/src/components/ui/LoadingState';

type StartupStatus = 'loading' | 'ready' | 'error';

export function StartupGate({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<StartupStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [attempt, setAttempt] = useState(0);

  const bootstrap = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(undefined);

    try {
      // Keep startup intentionally lightweight and side-effect free.
      // Do not initialize audio, notifications, payments, Google Sign-In,
      // subscriptions, or Firestore profile checks in this gate.
      await Promise.resolve();
      setStatus('ready');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start app.';
      setErrorMessage(message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap, attempt]);

  if (status === 'loading') {
    return <LoadingState label="Starting app..." />;
  }

  if (status === 'error') {
    return (
      <ErrorState
        title="Startup failed"
        message={errorMessage || 'Unable to start app.'}
        actionLabel="Retry"
        onAction={() => setAttempt((value) => value + 1)}
      />
    );
  }

  return <>{children}</>;
}
