import { useState, useCallback } from 'react';
import useSearch from '../hooks/useSearch';
import AnimeCard from '../components/AnimeCard';
import SkeletonCard from '../components/SkeletonCard';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Search, Filter, Hash, Zap } from 'lucide-react';
import type { Genre } from '../types/genre';
import type { Anime } from '../types/anime';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('newest');

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const res = await api.get('/genres/anime');
      return res.data.data;
    }
  });

  // Fetch newest anime from current season
  const { data: newestAnime, isLoading: loadingNewest } = useQuery<Anime[]>({
    queryKey: ['seasons-now-search'],
    queryFn: async () => {
      const res = await api.get('/seasons/now', { params: { limit: 24 } });
      return res.data.data as Anime[];
    },
    enabled: selectedGenre === 'newest' && !query,
  });

  const { data: searchResults, isLoading: loadingSearch } = useSearch(
    query || (selectedGenre !== 'newest' && selectedGenre !== 'all' ? ' ' : ''),
    1,
    selectedGenre !== 'newest' && selectedGenre !== 'all' ? selectedGenre : undefined
  );

  const showNewest = !query && selectedGenre === 'newest';
  const isLoading = showNewest ? loadingNewest : loadingSearch;
  const results = showNewest ? newestAnime : searchResults;

  const popularGenres = ['Action', 'Romance', 'Adventure', 'Fantasy', 'Comedy'];

  const handleGenreClick = useCallback((genre: string) => {
    setQuery(genre);
    setSelectedGenre('all');
  }, []);

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none -mt-48"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -mb-32"></div>

      <div className="max-w-6xl mx-auto relative z-10 px-4">
        {/* Search Hero */}
        <section className="pt-20 pb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-start sm:items-center justify-center gap-2 sm:gap-4">
            <Search className="w-7 h-7 sm:w-10 sm:h-10 text-accent mt-1 sm:mt-0 flex-shrink-0" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-accent bg-[length:200%_auto] animate-gradient-x">
              FIND YOUR NEXT ANIME
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Search through thousands of anime series, movies, and specials from our massive database.
          </p>

          <div className="max-w-3xl mx-auto mb-10">
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 p-1.5 md:p-2 bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl focus-within:border-accent/40 transition-all">
              <input
                placeholder={showNewest ? 'Browsing newest anime... or type to search' : 'Search by name (e.g. Naruto, One Piece)...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none p-3 md:p-4 text-base md:text-lg text-white placeholder-gray-600"
              />
              <div className="flex items-center gap-2 p-1">
                <select
                  value={selectedGenre}
                  onChange={(e) => {
                    setSelectedGenre(e.target.value);
                    if (e.target.value === 'newest') setQuery('');
                  }}
                  className="bg-gray-800 border-none outline-none px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-xs sm:text-sm font-medium text-gray-300 min-w-[120px] md:min-w-[150px] cursor-pointer hover:bg-gray-700 transition-colors"
                >
                  <option value="newest">🆕 Newest</option>
                  <option value="all">Genres</option>
                  {genres?.map((g: Genre) => (
                    <option key={g.mal_id} value={String(g.mal_id)}>{g.name}</option>
                  ))}
                </select>
                <button
                  className="bg-accent hover:bg-accent/90 text-white px-6 py-2.5 md:px-8 md:py-3 rounded-xl font-bold text-sm md:text-base transition-all shadow-lg shadow-accent/20 active:scale-95"
                >
                  SEARCH
                </button>
              </div>
            </div>

            {/* Quick Filters / Tags */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-sm">
              <span className="text-gray-500 flex items-center gap-1 w-full sm:w-auto justify-center mb-1 sm:mb-0"><Hash className="w-4 h-4" /> TRENDING:</span>
              {popularGenres.map((g) => (
                <button
                  key={g}
                  onClick={() => handleGenreClick(g)}
                  className="px-3.5 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-accent hover:border-accent/50 transition-all active:scale-95"
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
            {showNewest
              ? <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-accent" />Showing newest airing anime</span>
              : results ? `Showing ${results.length} results` : 'Exploring...'
            }
          </div>
        </div>

        {/* Results Grid */}
        <div className="mt-8">
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!isLoading && results && results.length === 0 && (
            <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
                 <Search className="w-8 h-8 md:w-10 md:h-10 text-gray-700" />
               </div>
               <h3 className="text-lg md:text-xl font-bold mb-2">No results found</h3>
               <p className="text-gray-500 text-sm md:text-base">Try searching with a different name or genre.</p>
            </div>
          )}

          {!isLoading && results && results.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
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
