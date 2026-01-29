import { useQuery } from '@tanstack/react-query';
import api, { parseApiError } from '../lib/api';

async function fetchSeasonsNow() {
  try {
    const res = await api.get('/seasons/now');
    return res.data.data;
  } catch (err) {
    const parsed = parseApiError(err);
    throw new Error(parsed.message);
  }
}

export default function useSeasonsNow() {
  return useQuery({
    queryKey: ['seasons-now'],
    queryFn: fetchSeasonsNow,
    staleTime: 1000 * 60 * 2
  });
}
