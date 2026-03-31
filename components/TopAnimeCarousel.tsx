import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SkeletonCard from './SkeletonCard';
import AnimeCard from './AnimeCard';
import type { Anime } from '../types/anime';

interface TopAnimeCarouselProps {
  items: Anime[] | undefined;
  isLoading: boolean;
  error?: Error | null;
}

export default function TopAnimeCarousel({ items, isLoading, error }: TopAnimeCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const target = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: target,
        behavior: 'smooth'
      });
    }
  };

  if (error) {
    return <div className="text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20 text-center">Error loading top anime carousel.</div>;
  }

  const displayItems = items?.slice(0, 10) || [];

  return (
    <div className="w-full relative group/carousel">
      {/* Scroll Controls (Desktop only) */}
      <div className="hidden md:block">
        <button
          onClick={() => scroll('left')}
          className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 bg-black/80 hover:bg-accent text-white p-3 rounded-full shadow-2xl transition-all opacity-0 group-hover/carousel:opacity-100 -translate-x-4 group-hover/carousel:translate-x-0"
          aria-label="Scroll left">
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 bg-black/80 hover:bg-accent text-white p-3 rounded-full shadow-2xl transition-all opacity-0 group-hover/carousel:opacity-100 translate-x-4 group-hover/carousel:translate-x-0"
          aria-label="Scroll right">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scroll-smooth snap-x snap-mandatory flex gap-3 sm:gap-6 pb-4 sm:pb-8 pt-4 px-4 sm:px-2 scrollbar-hide">
        {isLoading && (
          <>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[150px] sm:w-[220px] snap-start">
                <SkeletonCard />
              </div>
            ))}
          </>
        )}

        {!isLoading &&
          displayItems.map((anime, idx) => (
            <div key={anime.mal_id} className="flex-shrink-0 w-[150px] sm:w-[220px] snap-start">
              <AnimeCard anime={anime} rank={idx + 1} />
            </div>
          ))}
      </div>
    </div>
  );
}
