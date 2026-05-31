import { SubscriptionGate } from '@/src/features/access/components/SubscriptionGate';
import { canAccessExperience } from '@/src/features/access/access.helpers';
import { useAccountStore } from '@/src/features/account/account.store';
import { Stack } from 'expo-router';

export default function VaultLayout() {
  const role = useAccountStore((state) => state.role);

  if (!canAccessExperience(role, 'vault')) {
    return <SubscriptionGate experience="vault" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="folders" />
      <Stack.Screen name="record" />
      <Stack.Screen name="shared" />
      <Stack.Screen name="more" />
    </Stack>
  );
}
