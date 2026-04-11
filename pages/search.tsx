import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import useSearch from '../hooks/useSearch';
import AnimeCard from '../components/AnimeCard';
import SkeletonCard from '../components/SkeletonCard';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Search, Filter, Hash, Zap, Loader2, TrendingUp, ChevronRight } from 'lucide-react';
import type { Genre } from '../types/genre';
import type { Anime } from '../types/anime';
import debounce from 'lodash.debounce';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('newest');
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce function
  const debouncedSearch = useMemo(
    () => debounce((...args: unknown[]) => {
      const val = args[0] as string;
      setQuery(val);
    }, 500),
    []
  );

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch?.(searchTerm);
    } else {
      setQuery('');
      debouncedSearch?.cancel?.();
    }
    return () => debouncedSearch?.cancel?.();
  }, [searchTerm, debouncedSearch]);

  // Close hints when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const { data: searchResults, isLoading: loadingSearch, isFetching } = useSearch(
    query || (selectedGenre !== 'newest' && selectedGenre !== 'all' ? ' ' : ''),
    1,
    selectedGenre !== 'newest' && selectedGenre !== 'all' ? selectedGenre : undefined
  );

  const showNewest = !query && selectedGenre === 'newest';
  const isLoading = showNewest ? loadingNewest : loadingSearch;
  const results = showNewest ? newestAnime : searchResults;

  const popularGenres = ['Action', 'Romance', 'Adventure', 'Fantasy', 'Comedy'];

  const handleGenreClick = useCallback((genre: string) => {
    setSearchTerm(genre);
    setQuery(genre);
    setSelectedGenre('all');
    setIsFocused(false);
  }, []);

  const handleHintClick = (title: string) => {
    setSearchTerm(title);
    setQuery(title);
    setIsFocused(false);
  };

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none -mt-48"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -mb-32"></div>

      <div className="max-w-6xl mx-auto relative z-10 px-4">
        {/* Search Hero */}
        <section className="pt-12 sm:pt-24 pb-8 sm:pb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-start sm:items-center justify-center gap-2 sm:gap-4">
            <Search className="w-7 h-7 sm:w-10 sm:h-10 text-accent mt-1 sm:mt-0 flex-shrink-0" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-accent bg-[length:200%_auto] animate-gradient-x">
              FIND YOUR NEXT ANIME
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Search through thousands of anime series, movies, and specials from our massive database.
          </p>

          <div className="max-w-3xl mx-auto mb-10" ref={searchRef}>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 p-1.5 md:p-2 bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl focus-within:border-accent/40 transition-all relative z-[60]">
              <div className="flex-1 flex items-center px-1">
                <input
                  placeholder={showNewest ? 'Browsing newest anime... or type to search' : 'Search by name (e.g. Naruto, One Piece)...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  className="flex-1 bg-transparent border-none outline-none p-3 md:p-4 text-base md:text-lg text-white placeholder-gray-600"
                />
                {(loadingSearch || isFetching) && query && (
                  <Loader2 className="w-5 h-5 text-accent animate-spin mr-4" />
                )}
              </div>
              <div className="flex items-center gap-2 p-1">
                <select
                  value={selectedGenre}
                  onChange={(e) => {
                    setSelectedGenre(e.target.value);
                    if (e.target.value === 'newest') {
                      setSearchTerm('');
                      setQuery('');
                    }
                  }}
                  className="bg-gray-800 border-none outline-none px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-xs sm:text-sm font-medium text-gray-300 min-w-[120px] md:min-w-[150px] cursor-pointer hover:bg-gray-700 transition-colors"
                >
                  <option value="newest">🆕 Newest</option>
                  <option value="all">Genres</option>
                  {genres?.map((g: Genre) => (
                    <option key={g.mal_id} value={String(g.mal_id)}>{g.name}</option>
                  ))}
                </select>
                <div className="hidden md:flex items-center px-4 bg-accent/10 border border-accent/20 rounded-xl">
                  <span className="text-accent text-[10px] font-black uppercase tracking-widest animate-pulse">Live</span>
                </div>
              </div>

              {/* Smart Hints / Autocomplete Dropdown */}
              <AnimatePresence>
                {isFocused && searchTerm.length >= 2 && searchResults && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                    className="absolute top-[calc(100%+8px)] left-0 right-0 bg-gray-900/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_-20px_rgba(0,0,0,1)] overflow-hidden z-[100] max-h-[60vh] overflow-y-auto scrollbar-hide"
                  >
                    <div className="p-2">
                      <div className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5 mb-1">
                        <TrendingUp className="w-3 h-3 text-accent" /> Intelligence Hints
                      </div>
                      {searchResults.slice(0, 8).map((anime) => (
                        <button
                          key={anime.mal_id}
                          onClick={() => handleHintClick(anime.title)}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-xl transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-10 rounded-md overflow-hidden shrink-0 border border-white/5 relative">
                              <Image 
                                src={anime.images?.jpg?.image_url || '/placeholder-news.jpg'} 
                                alt="" 
                                fill
                                className="object-cover"
                                sizes="32px"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] sm:text-sm font-bold text-gray-200 truncate group-hover:text-accent transition-colors">
                                {anime.title}
                              </p>
                              <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                                {anime.type} • {anime.score || 'N/A'} Score
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                      {searchResults.length > 8 && (
                        <button 
                          onClick={() => { setQuery(searchTerm); setIsFocused(false); }}
                          className="w-full py-2 text-center text-[10px] font-black uppercase tracking-widest text-accent hover:text-white transition-colors border-t border-white/5 mt-1"
                        >
                          View All Results
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
