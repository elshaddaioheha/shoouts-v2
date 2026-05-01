import { ErrorState } from '@/src/components/ui/ErrorState';
import { getMissingEnvVars } from '@/src/config/env';
import { queryClient } from '@/src/config/queryClient';
import { useAccountProfileBootstrap } from '@/src/features/account/useAccountProfileBootstrap';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const colorScheme = useColorScheme();
  const missingEnvVars = getMissingEnvVars();
  const envError = missingEnvVars.length
    ? `Missing required environment variables: ${missingEnvVars.join(', ')}`
    : undefined;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          {envError ? (
            <ErrorState title="Configuration missing" message={envError} />
          ) : (
            <>
              <AccountBootstrapBridge />
              {children}
            </>
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function AccountBootstrapBridge() {
  useAccountProfileBootstrap();
  return null;
}
