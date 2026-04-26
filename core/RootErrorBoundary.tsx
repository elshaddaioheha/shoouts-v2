import { ErrorState } from '@/src/components/ui/ErrorState';
import { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

type RootErrorBoundaryProps = {
  children: ReactNode;
};

export function RootErrorBoundary({ children }: RootErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <ErrorState
          title="Something went wrong"
          message={error instanceof Error ? error.message : 'Unexpected app error.'}
          actionLabel="Try again"
          onAction={resetErrorBoundary}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
