import { useQuery } from '@tanstack/react-query';
import api, { parseApiError } from '../lib/api';
import type { Anime } from '../types/anime';

async function fetchFeaturedAnime() {
  try {
    // Fetch top anime, take the first one as featured
    const res = await api.get(`/top/anime`, { params: { page: 1, limit: 1 } });
    return res.data.data[0] as Anime;
  } catch (err) {
    const parsed = parseApiError(err);
    throw new Error(parsed.message);
  }
}

export default function useFeaturedAnime() {
  return useQuery({
    queryKey: ['featured-anime'],
    queryFn: fetchFeaturedAnime,
    staleTime: 1000 * 60 * 10,
    retry: 1
  });
}
