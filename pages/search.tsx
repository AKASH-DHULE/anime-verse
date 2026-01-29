import { useState } from 'react';
import useSearch from '../hooks/useSearch';
import AnimeCard from '../components/AnimeCard';
import SkeletonCard from '../components/SkeletonCard';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Genre } from '../types/genre';
import type { Anime } from '../types/anime';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const res = await api.get('/genres/anime');
      return res.data.data;
    }
  });

  const { data: results, isLoading, error } = useSearch(query || '', 1);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold mt-12">SEARCH ANIME</h1>
      <p className="text-gray-400">Find your next favorite series</p>

      <div className="mt-6 flex gap-4">
        <input placeholder="Search anime by name..." value={query} onChange={onChange} className="flex-1 bg-gray-900 border border-gray-800 rounded p-3" />
        <button className="btn-accent px-4 py-2 rounded">SEARCH</button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-4">
          <select className="bg-gray-900 border border-gray-800 p-2 rounded">
            <option value="">All Genres</option>
            {genres?.map((g: Genre) => (
              <option key={g.mal_id} value={g.mal_id}>{g.name}</option>
            ))}
          </select>

          <select className="bg-gray-900 border border-gray-800 p-2 rounded">
            <option value="">All Years</option>
            {/* TODO: populate years dynamically */}
            <option>2024</option>
            <option>2023</option>
          </select>
        </div>
      </div>

      <div className="mt-8">
        {error && <div className="text-red-400">{(error as Error).message}</div>}

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!isLoading && results && results.length === 0 && <div className="text-gray-400">No anime found.</div>}

        {!isLoading && results && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((r: Anime) => (
              <AnimeCard key={r.mal_id} anime={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
