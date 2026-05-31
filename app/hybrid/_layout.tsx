import { SubscriptionGate } from '@/src/features/access/components/SubscriptionGate';
import { canAccessExperience } from '@/src/features/access/access.helpers';
import { useAccountStore } from '@/src/features/account/account.store';
import { Stack } from 'expo-router';

export default function HybridLayout() {
  const role = useAccountStore((state) => state.role);

  if (!canAccessExperience(role, 'hybrid')) {
    return <SubscriptionGate experience="hybrid" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="more" />
      <Stack.Screen name="publish" />
      <Stack.Screen name="studio" />
      <Stack.Screen name="vault" />
    </Stack>
  );
}
