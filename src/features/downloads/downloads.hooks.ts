import { useQuery } from '@tanstack/react-query';
import { fetchUserPurchases } from './downloads.api';

export function useUserPurchases(uid: string | null, limitCount = 24) {
  return useQuery({
    queryKey: ['user-purchases', uid, limitCount],
    enabled: Boolean(uid),
    queryFn: () => fetchUserPurchases(uid!, limitCount),
  });
}
