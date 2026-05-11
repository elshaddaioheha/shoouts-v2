import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryClient } from '@/src/config/queryClient';
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
      queryClient.removeQueries({ queryKey: ['account-profile'] });
    }
  }, [ready, resetAccount, setNavigationExperience, user]);

  useEffect(() => {
    if (profileQuery.data && user && profileQuery.data.uid === user.uid) {
      setProfile(profileQuery.data);
      setNavigationExperience(profileQuery.data.activeExperience);
    }
  }, [profileQuery.data, setNavigationExperience, setProfile, user]);

  useEffect(() => {
    if (profileQuery.error && user) {
      console.warn('Falling back to auth-only account profile.', profileQuery.error);
      const fallbackProfile = buildFallbackAccountProfile(user, {
        userDocState: 'missing',
        subscriptionDocState: 'missing',
        notes: ['Account profile query failed, so the app fell back to the auth session.'],
        missingFields: ['users/{uid}'],
      });
      setProfile(fallbackProfile);
      setNavigationExperience(fallbackProfile.activeExperience);
    }
  }, [profileQuery.error, setNavigationExperience, setProfile, user]);
}
