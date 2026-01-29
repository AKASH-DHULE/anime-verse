import { useState } from 'react';
import useSearch from '../hooks/useSearch';
import WatchOrderList from '../components/WatchOrderList';
import useWatchOrder from '../hooks/useWatchOrder';
import AnimeCard from '../components/AnimeCard';
import SkeletonCard from '../components/SkeletonCard';
import type { Anime } from '../types/anime';

export default function WatchOrderPage() {
  const [query, setQuery] = useState('');
  const { data: results, isLoading: searching, error: searchError } = useSearch(query || '', 1);

  // show search error if any
  const searchErrorElem = searchError ? <div className="text-red-400">{(searchError as Error).message}</div> : null;

  const [selected, setSelected] = useState<number | null>(null);
  const { data: order, isLoading: loadingOrder, error: orderError } = useWatchOrder(selected || undefined);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold mt-12">ANIME WATCH ORDER GUIDE</h1>
      <p className="text-gray-400">Navigate complex anime franchises with ease</p>

      <div className="mt-6">
        <input className="w-full bg-gray-900 border border-gray-800 rounded p-3" placeholder="Search anime for watch order..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <p className="text-gray-500 mt-2">Search and pick an anime to build a watch order (relations-based).</p>
      </div>

      <div className="mt-8">
        {searchErrorElem}

        {searching && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!searching && results && results.length === 0 && query && <div className="text-gray-400">No anime found.</div>}

        {!searching && results && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((r: Anime) => (
              <div
                key={r.mal_id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(r.mal_id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected(r.mal_id); }}
                className="cursor-pointer"
              >
                <AnimeCard anime={r} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          {orderError && <div className="text-red-400">{(orderError as Error).message}</div>}
          {loadingOrder && <div className="text-gray-400">Building watch order...</div>}

          {!loadingOrder && order && <WatchOrderList items={order} />}

          {!loadingOrder && selected && !order && <div className="text-gray-400">Official watch order not available. Showing related anime instead.</div>}
        </div>
      </div>
    </div>
  );
}
