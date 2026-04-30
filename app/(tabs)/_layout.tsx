import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="marketplace" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="more" />
    </Stack>
  );
}
