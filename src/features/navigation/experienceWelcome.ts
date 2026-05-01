import type { AppExperience } from '@/src/features/access/access.types';
import { EXPERIENCE_NAVIGATION } from '@/src/features/navigation/navigation.config';
import { router } from 'expo-router';

export const EXPERIENCE_WELCOME_ROUTE = '/experience-welcome';

type WelcomeRouteParams = {
  experience: AppExperience;
  nextRoute?: string;
};

export function openExperienceWelcome({
  experience,
  nextRoute = EXPERIENCE_NAVIGATION[experience].defaultRoute,
}: WelcomeRouteParams) {
  router.replace({
    pathname: EXPERIENCE_WELCOME_ROUTE,
    params: {
      experience,
      nextRoute,
    },
  } as any);
}
