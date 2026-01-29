import { useQuery } from '@tanstack/react-query';
import api, { parseApiError } from '../lib/api';

async function fetchDetails(id: number | string) {
  try {
    const res = await api.get(`/anime/${id}`);
    return res.data.data;
  } catch (err) {
    const parsed = parseApiError(err);
    throw new Error(parsed.message);
  }
}

export default function useAnimeDetails(id?: number | string) {
  return useQuery({
    queryKey: ['anime-details', id],
    queryFn: () => fetchDetails(id as number),
    enabled: !!id
  });
}
