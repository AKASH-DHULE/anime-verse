import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SkeletonCard from './SkeletonCard';
import AnimeCard from './AnimeCard';
import type { Anime } from '../types/anime';
import { motion, AnimatePresence } from 'framer-motion';

interface TopAnimeCarouselProps {
  items: Anime[] | undefined;
  isLoading: boolean;
}

export default function TopAnimeCarousel({ items, isLoading }: TopAnimeCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 640 ? 300 : 500;
      const target = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: target,
        behavior: 'smooth'
      });
    }
  };

  const displayItems = items?.slice(0, 10) || [];

  return (
    <div className="w-full relative group/carousel py-4">
      {/* Scroll Controls (Desktop only) */}
      <div className="hidden md:block">
        <motion.button
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => scroll('left')}
          className="absolute -left-6 top-1/2 -translate-y-1/2 z-30 bg-gray-950/80 backdrop-blur-md border border-white/10 text-white p-4 rounded-2xl shadow-2xl transition-opacity opacity-0 group-hover/carousel:opacity-100"
          aria-label="Scroll left">
          <ChevronLeft size={24} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => scroll('right')}
          className="absolute -right-6 top-1/2 -translate-y-1/2 z-30 bg-gray-950/80 backdrop-blur-md border border-white/10 text-white p-4 rounded-2xl shadow-2xl transition-opacity opacity-0 group-hover/carousel:opacity-100"
          aria-label="Scroll right">
          <ChevronRight size={24} />
        </motion.button>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide flex gap-4 sm:gap-8 pb-12 pt-6 px-4 scroll-smooth snap-x snap-mandatory"
      >
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <motion.div 
                key={`skeleton-${i}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex-shrink-0 w-[150px] sm:w-[240px] snap-center"
              >
                <SkeletonCard />
              </motion.div>
            ))
          ) : (
            displayItems.map((anime, idx) => (
              <motion.div 
                key={anime.mal_id}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                whileInView={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                }}
                viewport={{ 
                  once: false, 
                  amount: 0.6,
                  margin: "0px -20px 0px -20px"
                }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 25,
                  delay: idx * 0.02
                }}
                className="flex-shrink-0 w-[150px] sm:w-[240px] snap-center relative"
              >
                <AnimeCard anime={anime} rank={idx + 1} />
                
                {/* Glow effect for centered items */}
                <div className="absolute inset-x-0 -bottom-4 h-1 bg-accent/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
