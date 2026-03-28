import { useQuery } from '@tanstack/react-query';
import api, { parseApiError } from '../lib/api';

import type { Anime } from '../types/anime';

async function searchAnime(q: string, page = 1, genres?: string, year?: string): Promise<Anime[]> {
  try {
    const params: any = { q, page };
    if (genres) params.genres = genres;
    if (year) params.year = year;
    const res = await api.get('/anime', { params });
    return res.data.data as Anime[];
  } catch (err) {
    const parsed = parseApiError(err);
    if (parsed.isNotFound) return [];
    throw new Error(parsed.message);
  }
}

export default function useSearch(q: string, page = 1, genres?: string, year?: string) {
  return useQuery<Anime[], Error>({
    queryKey: ['search', q, page, genres, year],
    queryFn: () => searchAnime(q, page, genres, year),
    enabled: !!q
  });
}
