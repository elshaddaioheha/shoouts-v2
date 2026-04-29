import { ErrorState } from '@/src/components/ui/ErrorState';
import { assertEnv } from '@/src/config/env';
import { queryClient } from '@/src/config/queryClient';
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
  let envError: string | undefined;

  try {
    assertEnv();
  } catch (error) {
    envError = error instanceof Error ? error.message : 'Missing app configuration.';
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          {envError ? (
            <ErrorState title="Configuration missing" message={envError} />
          ) : (
            children
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
