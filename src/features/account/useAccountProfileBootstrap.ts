import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from '@/src/features/auth/auth.store';
import { useExperienceNavigationStore } from '@/src/features/navigation/navigation.store';
import { buildFallbackAccountProfile, fetchAccountProfile } from './account.api';
import { useAccountStore } from './account.store';

export function useAccountProfileBootstrap() {
  const ready = useAuthStore((state) => state.ready);
  const user = useAuthStore((state) => state.user);
  const resetAccount = useAccountStore((state) => state.resetAccount);
  const setProfile = useAccountStore((state) => state.setProfile);
  const setNavigationExperience = useExperienceNavigationStore(
    (state) => state.setActiveExperience
  );

  const profileQuery = useQuery({
    queryKey: ['account-profile', user?.uid],
    enabled: ready && Boolean(user?.uid),
    queryFn: () => fetchAccountProfile(user!),
  });

  useEffect(() => {
    if (ready && !user) {
      resetAccount();
      setNavigationExperience('shoouts');
    }
  }, [ready, resetAccount, setNavigationExperience, user]);

  useEffect(() => {
    if (profileQuery.data) {
      setProfile(profileQuery.data);
      setNavigationExperience(profileQuery.data.activeExperience);
    }
  }, [profileQuery.data, setNavigationExperience, setProfile]);

  useEffect(() => {
    if (profileQuery.error && user) {
      console.warn('Falling back to auth-only account profile.', profileQuery.error);
      const fallbackProfile = buildFallbackAccountProfile(user);
      setProfile(fallbackProfile);
      setNavigationExperience(fallbackProfile.activeExperience);
    }
  }, [profileQuery.error, setNavigationExperience, setProfile, user]);
}
