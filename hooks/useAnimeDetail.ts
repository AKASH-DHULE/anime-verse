import { useQuery } from '@tanstack/react-query';
import api, { parseApiError } from '../lib/api';

export type AnimeDetailImage = {
  mal_id: number;
  title: string;
  large_image_url: string;
  type?: string;
};

async function fetchAnimeDetail(mal_id: number) {
  try {
    const res = await api.get(`/anime/${mal_id}`);
    const data = res.data.data;
    return {
      mal_id: data.mal_id,
      title: data.title,
      large_image_url: data.images?.jpg?.large_image_url || data.images?.jpg?.image_url || '',
      type: data.type
    } as AnimeDetailImage;
  } catch (err) {
    const parsed = parseApiError(err);
    throw new Error(parsed.message);
  }
}

export default function useAnimeDetail(mal_id?: number) {
  return useQuery({
    queryKey: ['anime-detail', mal_id],
    queryFn: () => fetchAnimeDetail(mal_id as number),
    enabled: !!mal_id,
    staleTime: 1000 * 60 * 5
  });
}
