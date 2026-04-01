import { useQuery } from '@tanstack/react-query';
import api, { parseApiError } from '../lib/api';
import type { Anime } from '../types/anime';

async function fetchSeasonalAndAiring() {
  try {
    // We try to get the current season's entries
    const res = await api.get('/seasons/now');
    let data = res.data.data as Anime[];

    // If the seasonal list is empty or we're in a season transition (like April 1st),
    // we want to ensure we still have something to show.
    // First, let's try to prioritize 'Currently Airing'
    const currentlyAiring = data.filter(anime => anime.status === 'Currently Airing');
    
    // If we have 'Currently Airing' shows, we use them.
    // If not (transition period), we include 'Not yet aired' but sort them carefully.
    if (currentlyAiring.length < 5) {
      // Keep everything but sort strictly
    } else {
      data = currentlyAiring;
    }

    // Comprehensive sort: Score first, then popularity, then those that have started already
    return data.sort((a, b) => {
      // 1. Prioritize those that have scores (already airing/active)
      const scoreA = a.score ?? 0;
      const scoreB = b.score ?? 0;
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      
      // 2. Prioritize "Currently Airing" status over "Not yet aired"
      if (a.status === 'Currently Airing' && b.status !== 'Currently Airing') return -1;
      if (a.status !== 'Currently Airing' && b.status === 'Currently Airing') return 1;

      // 3. Use popularity as the final tie-breaker
      return (a.popularity || 99999) - (b.popularity || 99999);
    });
  } catch (err) {
    const parsed = parseApiError(err);
    if (parsed.isNotFound) return [];
    throw new Error(parsed.message);
  }
}

export default function useSeasonsNow() {
  return useQuery({
    queryKey: ['top-active-seasonal-anime'],
    queryFn: fetchSeasonalAndAiring,
    staleTime: 1000 * 60 * 5,
    retry: 1
  });
}
