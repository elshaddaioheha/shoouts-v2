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
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              {/* Welcome screen runs its own opacity/scale animation; let the
                  Stack swap instantly so the two don't fight each other. */}
              <Stack.Screen name="experience-welcome" options={{ animation: 'none' }} />
              <Stack.Screen name="checkout" options={{ presentation: 'modal' }} />
            </Stack>
          </StartupGate>
        </AppProviders>
      </GestureHandlerRootView>
    </RootErrorBoundary>
  );
}
