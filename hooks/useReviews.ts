import { useQuery } from '@tanstack/react-query';
import api, { parseApiError } from '../lib/api';
import type { Review } from '../types/review';

async function fetchReviews(id: number | string) {
  try {
    const res = await api.get(`/anime/${id}/reviews`);
    return res.data.data as Review[];
  } catch (err) {
    const parsed = parseApiError(err);
    throw new Error(parsed.message);
  }
}

export default function useReviews(id?: number | string) {
  return useQuery<Review[], Error>({
    queryKey: ['anime-reviews', id],
    queryFn: () => fetchReviews(id as number),
    enabled: !!id
  });
}
