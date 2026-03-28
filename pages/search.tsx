import { useState } from 'react';
import useSearch from '../hooks/useSearch';
import AnimeCard from '../components/AnimeCard';
import SkeletonCard from '../components/SkeletonCard';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Search, Filter, Hash, Sparkles } from 'lucide-react';
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

  const popularGenres = ['Action', 'Romance', 'Adventure', 'Fantasy', 'Comedy'];

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none -mt-48"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -mb-32"></div>

      <div className="max-w-6xl mx-auto relative z-10 px-4">
        {/* Search Hero */}
        <section className="pt-20 pb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-3">
            <Search className="w-8 h-8 text-accent" />
            FIND YOUR <span className="text-accent text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">NEXT ANIME</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Search through thousands of anime series, movies, and specials from our massive database.
          </p>

          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-4 p-2 bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl focus-within:border-accent/40 transition-all">
              <input
                placeholder="Search by name (e.g. Naruto, One Piece)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none p-4 text-lg text-white"
              />
              <div className="flex items-center gap-2 p-1">
                <select className="bg-gray-800 border-none outline-none px-4 py-3 rounded-xl text-sm font-medium text-gray-300 min-w-[140px] cursor-pointer hover:bg-gray-700 transition-colors">
                  <option value="">All Genres</option>
                  {genres?.map((g: Genre) => (
                    <option key={g.mal_id} value={g.mal_id}>{g.name}</option>
                  ))}
                </select>
                <button className="bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-accent/20 active:scale-95">
                  SEARCH
                </button>
              </div>
            </div>

            {/* Quick Filters / Tags */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
              <span className="text-gray-500 flex items-center gap-1"><Hash className="w-4 h-4" /> TRENDING:</span>
              {popularGenres.map((g) => (
                <button
                  key={g}
                  onClick={() => setQuery(g)}
                  className="px-4 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-accent hover:border-accent/50 transition-all active:scale-90"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results Count / Info bar */}
        <div className="mb-8 flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2 text-gray-400 font-medium">
            <Filter className="w-4 h-4" />
            {results ? `Showing ${results.length} results` : 'Exploring...'}
          </div>
        </div>

        {/* Results Grid */}
        <div className="mt-8">
          {error && (
            <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-400 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-red-500/50" />
              <p>{(error as Error).message}</p>
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!isLoading && results && results.length === 0 && (
            <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
               <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
                 <Search className="w-10 h-10 text-gray-700" />
               </div>
               <h3 className="text-xl font-bold mb-2">No results found</h3>
               <p className="text-gray-500">Try searching with a different name or genre.</p>
            </div>
          )}

          {!isLoading && results && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {results.map((r: Anime) => (
                <AnimeCard key={r.mal_id} anime={r} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

