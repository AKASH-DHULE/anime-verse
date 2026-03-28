import { Star, Flame, Trophy } from 'lucide-react';
import Hero from '../components/Hero';
import TopAnimeCarousel from '../components/TopAnimeCarousel';
import useTopAnime from '../hooks/useTopAnime';
import useSeasonsNow from '../hooks/useSeasonsNow';
import AnimeCard from '../components/AnimeCard';
import SkeletonCard from '../components/SkeletonCard';
import type { Anime } from '../types/anime';

export default function Home() {
  const { data, isLoading, error } = useTopAnime(1);
  const { data: seasonNow, isLoading: loadingSeason } = useSeasonsNow();

  return (
    <div className="relative pb-24 overflow-hidden">
      {/* Background radial decorations for premium look */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none -mr-48 -mt-24"></div>
      <div className="absolute top-[800px] left-0 w-[600px] h-[600px] bg-accent/5 blur-[150px] rounded-full pointer-events-none -ml-64"></div>

      <div className="max-w-6xl mx-auto relative z-10 px-4">
        <Hero />

        {/* Top 10 Anime Carousel */}
        <section className="mt-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Trophy className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">GLOBAL TOP 10</h2>
              <div className="w-12 h-1 bg-accent rounded-full mt-1"></div>
            </div>
          </div>
          <p className="text-gray-400 text-lg">The most beloved anime series of all time</p>

          <div className="mt-10">
            <TopAnimeCarousel items={data} isLoading={isLoading} error={error} />
          </div>

          {error && <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-center">Error loading top anime. Please try refreshing.</div>}
        </section>

        {/* Current Season Section */}
        <section className="mt-24 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">CURRENTLY AIRING</h2>
              <div className="w-12 h-1 bg-orange-500 rounded-full mt-1"></div>
            </div>
          </div>
          <p className="text-gray-400 text-lg">The hottest anime airing right now</p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingSeason && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}

            {!loadingSeason && seasonNow?.slice(0, 3).map((anime: Anime) => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

