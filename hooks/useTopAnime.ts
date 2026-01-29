import { useQuery } from '@tanstack/react-query';
import api, { parseApiError } from '../lib/api';
import type { Anime } from '../types/anime';

async function fetchTop(page = 1) {
  try {
    const res = await api.get(`/top/anime`, { params: { page } });
    return res.data.data as Anime[];
  } catch (err) {
    const parsed = parseApiError(err);
    throw new Error(parsed.message);
  }
}

export default function useTopAnime(page = 1) {
  return useQuery({
    queryKey: ['top-anime', page],
    queryFn: () => fetchTop(page),
    retry: 1,
    staleTime: 1000 * 60 * 2
  });
}
