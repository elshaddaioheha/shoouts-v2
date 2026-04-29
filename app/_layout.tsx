import { AppProviders } from '@/src/core/AppProviders';
import { RootErrorBoundary } from '@/src/core/RootErrorBoundary';
import { StartupGate } from '@/src/core/StartupGate';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync().catch(() => null);

export default function RootLayout() {
  return (
    <RootErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProviders>
          <StartupGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </StartupGate>
        </AppProviders>
      </GestureHandlerRootView>
    </RootErrorBoundary>
  );
}
