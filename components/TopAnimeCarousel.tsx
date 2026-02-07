import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SkeletonCard from './SkeletonCard';
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
      const scrollAmount = 300;
      const target = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: target,
        behavior: 'smooth'
      });
    }
  };

  if (error) {
    return <div className="text-red-400">Error loading top anime carousel.</div>;
  }

  const displayItems = items?.slice(0, 10) || [];

  return (
    <div className="w-full">
      <div className="relative">
        {/* Left scroll button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
          aria-label="Scroll left">
          <ChevronLeft size={24} />
        </button>

        {/* Scroll container */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scroll-smooth snap-x snap-mandatory flex gap-4 pb-4 scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}>
          {isLoading && (
            <>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-40">
                  <SkeletonCard />
                </div>
              ))}
            </>
          )}

          {!isLoading &&
            displayItems.map((anime, idx) => {
              const rankNum = idx + 1;
              const image = anime.images?.jpg?.image_url || anime.images?.webp?.image_url || '';

              return (
                <Link
                  key={anime.mal_id}
                  href={`/anime/${anime.mal_id}`}
                  className="flex-shrink-0 w-40 group">
                  <div className="relative h-56 bg-gray-800 rounded overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-2">
                    {/* Rank badge */}
                    <div className="absolute top-2 left-2 bg-accent text-white font-bold px-3 py-1 rounded-full text-sm z-10 shadow-lg">
                      #{rankNum}
                    </div>

                    {/* Image */}
                    {image ? (
                      <Image
                        src={image}
                        alt={`${anime.title} anime poster`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        priority={false}
                        unoptimized
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                    )}

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      <div className="text-white font-semibold text-sm line-clamp-2">{anime.title}</div>
                      <div className="text-gray-300 text-xs mt-1">⭐ {anime.score ?? 'N/A'}</div>
                    </div>
                  </div>

                  {/* Title (always visible) */}
                  <div className="mt-2 text-sm font-semibold text-gray-100 line-clamp-2 group-hover:text-accent transition-colors">
                    {anime.title}
                  </div>
                </Link>
              );
            })}
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
          aria-label="Scroll right">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
