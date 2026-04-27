import { useAuthStore } from '@/src/features/auth/auth.store';
import { Redirect } from 'expo-router';

export default function IndexRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/onboarding" />;
}
