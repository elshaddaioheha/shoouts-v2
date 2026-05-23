import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="reports/[id]" />
      <Stack.Screen name="threads" />
      <Stack.Screen name="thread/[id]" />
      <Stack.Screen name="listings" />
      <Stack.Screen name="listing/[id]" />
      <Stack.Screen name="users" />
      <Stack.Screen name="user/[id]" />
    </Stack>
  );
}
