import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { buildFallbackAccountProfile, fetchAccountProfile } from './account.api';
import { useAccountStore } from './account.store';

export function useAccountProfileBootstrap() {
  const ready = useAuthStore((state) => state.ready);
  const user = useAuthStore((state) => state.user);
  const resetAccount = useAccountStore((state) => state.resetAccount);
  const setProfile = useAccountStore((state) => state.setProfile);

  const profileQuery = useQuery({
    queryKey: ['account-profile', user?.uid],
    enabled: ready && Boolean(user?.uid),
    queryFn: () => fetchAccountProfile(user!),
  });

  useEffect(() => {
    if (ready && !user) {
      resetAccount();
    }
  }, [ready, resetAccount, user]);

  useEffect(() => {
    if (profileQuery.data) {
      setProfile(profileQuery.data);
    }
  }, [profileQuery.data, setProfile]);

  useEffect(() => {
    if (profileQuery.error && user) {
      console.warn('Falling back to auth-only account profile.', profileQuery.error);
      setProfile(buildFallbackAccountProfile(user));
    }
  }, [profileQuery.error, setProfile, user]);
}
