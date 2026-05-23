import { useQuery } from '@tanstack/react-query';
import { fetchStudioListings } from './studio.api';

export function useStudioListings(uid: string | null) {
  return useQuery({
    queryKey: ['studio', 'listings', uid],
    queryFn: () => fetchStudioListings(uid!),
    enabled: Boolean(uid),
  });
}
