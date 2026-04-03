import { useQuery } from '@tanstack/react-query';
import api, { parseApiError } from '../lib/api';
import type { Anime } from '../types/anime';

async function fetchSeasonalAndAiring() {
  try {
    // We try to get the current season's entries
    const res = await api.get('/seasons/now');
    const rawData = res.data.data as Anime[];

    // Deduplicate by mal_id to avoid repeats in the grid
    const uniqueDict: Record<number, Anime> = {};
    rawData.forEach(anime => {
      if (!uniqueDict[anime.mal_id]) {
        uniqueDict[anime.mal_id] = anime;
      }
    });
    
    let data = Object.values(uniqueDict);

    // We want to prioritize 'Currently Airing', but ensure we have enough items (at least 10)
    // to fill the home page grid nicely.
    const currentlyAiring = data.filter(anime => anime.status === 'Currently Airing');
    
    if (currentlyAiring.length >= 10) {
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
