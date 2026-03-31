import { useQuery } from '@tanstack/react-query';
import api, { parseApiError } from '../lib/api';

export type StreamingService = {
  name: string;
  url: string;
};

async function fetchStreaming(id: number | string): Promise<StreamingService[]> {
  try {
    const res = await api.get(`/anime/${id}/streaming`);
    return res.data.data || [];
  } catch (err) {
    const parsed = parseApiError(err);
    if (parsed.isNotFound) return [];
    console.error('Error fetching streaming services:', err);
    return [];
  }
}

export default function useStreaming(id?: number | string) {
  return useQuery({
    queryKey: ['streaming', id],
    queryFn: () => fetchStreaming(id as number),
    enabled: !!id,
    staleTime: 1000 * 60 * 60, // 1 hour - streaming services don't change often
  });
}
