import { queryClient } from '@/src/config/queryClient';
import { useAccountStore } from '@/src/features/account/account.store';
import { SuspendedScreen } from '@/src/features/account/screens/SuspendedScreen';
import { useAccountProfileBootstrap } from '@/src/features/account/useAccountProfileBootstrap';
import { GlobalPlayerHost } from '@/src/features/player/components/GlobalPlayerHost';
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

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <>
            <AccountBootstrapBridge />
            <AppContent>{children}</AppContent>
            <GlobalPlayerHost />
          </>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function AccountBootstrapBridge() {
  useAccountProfileBootstrap();
  return null;
}

function AppContent({ children }: { children: ReactNode }) {
  const isSuspended = useAccountStore((s) => s.isSuspended);
  if (isSuspended) return <SuspendedScreen />;
  return <>{children}</>;
}
