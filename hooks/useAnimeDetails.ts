import { useQuery } from '@tanstack/react-query';
import api, { parseApiError } from '../lib/api';
import type { Anime } from '../types/anime';

/**
 * Fetches detailed anime information from Jikan API
 * Handles 404s gracefully when anime ID doesn't exist
 */
async function fetchDetails(id: number | string): Promise<Anime | null> {
  try {
    const res = await api.get(`/anime/${id}`);
    
    // Verify response has data
    if (!res.data || !res.data.data) {
      throw new Error('Invalid response from API');
    }

    return res.data.data as Anime;
  } catch (err) {
    const parsed = parseApiError(err);
    
    // If anime not found (404), return null instead of throwing
    // This allows graceful fallback UI rendering
    if (parsed.isNotFound) {
      console.warn(`⚠ Anime with ID ${id} not found in Jikan API`);
      return null;
    }

    // For other errors, throw so React Query handles retry/error state
    throw new Error(parsed.message);
  }
}

/**
 * Hook to fetch anime details
 * Returns null if anime doesn't exist (404)
 * Throws error for network/other issues
 */
export default function useAnimeDetails(id?: number | string) {
  return useQuery({
    queryKey: ['anime-details', id],
    queryFn: () => fetchDetails(id as number),
    enabled: !!id,
    retry: 1, // Retry once for network errors, but not for 404s
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });
}

