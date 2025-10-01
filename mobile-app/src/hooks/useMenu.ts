import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../config';

/**
 * React Query hook to fetch the current dining hall menu. It constructs
 * the endpoint from the configured API base URL. Any fetch errors will
 * be surfaced in the query's `error` property. Consumers can use
 * `isLoading`, `error` and `data` to render appropriate UI states.
 */
export function useMenu() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/menu`);
      if (!response.ok) {
        throw new Error('Failed to fetch menu');
      }
      return response.json();
    },
  });
}