import { useQuery } from '@tanstack/react-query';
import api, { parseApiError } from '../lib/api';

async function fetchRelations(id: number | string) {
  try {
    const res = await api.get(`/anime/${id}/relations`);
    return res.data.data;
  } catch (err) {
    const parsed = parseApiError(err);
    throw new Error(parsed.message);
  }
}

function computeOrder(relations: any[]) {
  // Basic heuristic: include prequel(s) first, then main, then sequels, then movies/ovas/side-stories
  const group: any = {
    prequel: [],
    main: [],
    sequel: [],
    others: []
  };

  relations.forEach((rel) => {
    if (rel.relation === 'Prequel') group.prequel.push(rel);
    else if (rel.relation === 'Sequel') group.sequel.push(rel);
    else group.others.push(rel);
  });

  return [...group.prequel, ...group.main, ...group.sequel, ...group.others];
}

export default function useWatchOrder(id?: number | string) {
  return useQuery({
    queryKey: ['watch-order', id],
    queryFn: async () => {
      const relations = await fetchRelations(id as number);
      return computeOrder(relations);
    },
    enabled: !!id
  });
}
