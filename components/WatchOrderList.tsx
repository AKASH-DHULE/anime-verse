import WatchOrderCard from './WatchOrderCard';

type RawRelation = {
  relation: string;
  entry?:
    | {
        mal_id: number;
        title: string;
        type?: string;
      }
    | Array<{
        mal_id: number;
        title: string;
        type?: string;
      }>;
};

type WatchCard = {
  mal_id: number;
  title: string;
  type?: string;
  relation: string;
};

function relationPriority(relation: string) {
  const r = (relation || '').toLowerCase();
  if (r.includes('prequel')) return 1;
  if (r.includes('main') || r.includes('tv') || r.includes('series')) return 2;
  if (r.includes('sequel')) return 3;
  if (r.includes('side') || r.includes('side story')) return 4;
  if (r.includes('spin')) return 5;
  if (r.includes('movie')) return 6;
  if (r.includes('ova') || r.includes('special')) return 7;
  return 2; // default to main/neutral
}

export default function WatchOrderList({ items }: { items: RawRelation[] }) {
  if (!items || items.length === 0) return <div className="text-gray-400">Watch order not found for this anime.</div>;

  // Normalize relations: some responses include entry array, others single entry
  const normalized: WatchCard[] = [];
  items.forEach((rel) => {
    const entries = Array.isArray(rel.entry) ? rel.entry : rel.entry ? [rel.entry] : [];
    entries.forEach((entry) => {
      normalized.push({
        mal_id: entry.mal_id,
        title: entry.title,
        type: entry.type,
        relation: rel.relation
      });
    });
  });

  normalized.sort((a, b) => {
    const pa = relationPriority(a.relation);
    const pb = relationPriority(b.relation);
    if (pa !== pb) return pa - pb;
    // Some entries can be missing a title; fall back to empty string to avoid runtime errors
    const ta = (a.title || '').toString();
    const tb = (b.title || '').toString();
    return ta.localeCompare(tb);
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {normalized.map((it) => (
        <WatchOrderCard key={it.mal_id} mal_id={it.mal_id} title={it.title} relation={it.relation} />
      ))}
    </div>
  );
}
