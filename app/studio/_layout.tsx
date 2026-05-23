import { Stack } from 'expo-router';

export default function StudioLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="listings" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="promote" />
      <Stack.Screen name="upload" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
