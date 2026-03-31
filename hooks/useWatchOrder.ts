import { useQuery } from '@tanstack/react-query';
import api, { parseApiError } from '../lib/api';

async function fetchRelations(id: number | string) {
  try {
    const res = await api.get(`/anime/${id}/relations`);
    return res.data.data;
  } catch (err) {
    const parsed = parseApiError(err);
    if (parsed.isNotFound) return [];
    throw new Error(parsed.message);
  }
}

type Relation = {
  relation: string;
  entry: { mal_id: number; type: string; name: string }[];
};

function computeOrder(relations: { relation: string; entry: unknown }[]) {
  // Pre-filter: only keep relations that have anime entries
  const animeRelations: Relation[] = relations
    .map((rel) => {
      const entries = Array.isArray(rel.entry) ? rel.entry : [rel.entry];
      const filteredEntries = entries.filter((e: any) => e.type === 'anime') as { mal_id: number; type: string; name: string }[];
      if (filteredEntries.length === 0) return null;
      return { relation: rel.relation, entry: filteredEntries };
    })
    .filter((rel): rel is Relation => rel !== null);

  const group: Record<string, Relation[]> = {
    prequel: [],
    main: [],
    sequel: [],
    others: []
  };

  animeRelations.forEach((rel) => {
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
