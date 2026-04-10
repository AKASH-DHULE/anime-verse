import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { PromoItem, JikanPromoResponse } from '../types/news';

export default function usePromos(limit: number = 10) {
  return useQuery({
    queryKey: ['promos', limit],
    queryFn: async () => {
      const response = await api.get<JikanPromoResponse>('/watch/recent/promos');
      return response.data.data.slice(0, limit);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
