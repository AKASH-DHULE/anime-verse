import Link from 'next/link';

import Image from 'next/image';

type ImgSet = {
  jpg?: { image_url?: string };
  webp?: { image_url?: string };
};

type RawRelation = {
  relation: string;
  entry?:
    | {
        mal_id: number;
        title: string;
        images?: ImgSet;
        type?: string;
      }
    | Array<{
        mal_id: number;
        title: string;
        images?: ImgSet;
        type?: string;
      }>;
};

type WatchCard = {
  mal_id: number;
  title: string;
  image: string;
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
        image: entry.images?.jpg?.image_url || entry.images?.webp?.image_url || '',
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {normalized.map((it) => (
        <Link key={it.mal_id} href={`/anime/${it.mal_id}`} className="block bg-gray-900 rounded overflow-hidden shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
          <div className="relative h-40 bg-gray-800">
            {it.image ? (
              <Image src={it.image} alt={it.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
            )}
            <div className="absolute top-2 left-2 bg-black/60 text-xs px-2 py-1 rounded text-white">{it.relation}</div>
          </div>

          <div className="p-3">
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm text-gray-400 mt-1">{it.type}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
