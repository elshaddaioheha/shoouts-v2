import { Stack } from 'expo-router';

export default function HybridVaultLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit/[id]" />
      <Stack.Screen name="promote/[id]" />
    </Stack>
  );
}
