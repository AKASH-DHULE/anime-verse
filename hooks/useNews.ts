import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { NewsArticle, JikanNewsResponse } from '../types/news';
import { Anime } from '../types/anime';

export default function useNews(limit: number = 10) {
  return useQuery({
    queryKey: ['news', limit],
    queryFn: async () => {
      const response = await fetch('/api/news');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      const data: NewsArticle[] = await response.json();
      return data.slice(0, limit);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
