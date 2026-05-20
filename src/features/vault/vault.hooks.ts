import { useQuery } from '@tanstack/react-query';
import { fetchVaultProjects } from './vault.api';

type UseVaultProjectsOptions = {
  enabled?: boolean;
};

export function useVaultProjects(
  uid: string | null,
  limitCount = 24,
  options?: UseVaultProjectsOptions
) {
  return useQuery({
    queryKey: ['vault-projects', uid, limitCount],
    enabled: Boolean(uid) && (options?.enabled ?? true),
    queryFn: () => fetchVaultProjects(uid!, limitCount),
  });
}
