import { PropsWithChildren } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

import { ErrorState } from '@/src/components/ui/ErrorState';

function RootFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      title="App error"
      message={error.message || 'An unexpected error occurred.'}
      actionLabel="Try again"
      onAction={resetErrorBoundary}
    />
  );
}

export function RootErrorBoundary({ children }: PropsWithChildren) {
  return <ErrorBoundary FallbackComponent={RootFallback}>{children}</ErrorBoundary>;
}
