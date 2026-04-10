import { Flame, Trophy } from 'lucide-react';
import AiringMarquee from '../components/AiringMarquee';
import TopAnimeCarousel from '../components/TopAnimeCarousel';
import useTopAnime from '../hooks/useTopAnime';
import useSeasonsNow from '../hooks/useSeasonsNow';
import useNews from '../hooks/useNews';
import AnimeCard from '../components/AnimeCard';
import SkeletonCard from '../components/SkeletonCard';
import ErrorFallback from '../components/ErrorFallback';
import NewsPopup from '../components/NewsPopup';
import type { Anime } from '../types/anime';

export default function Home() {
  const { data, isLoading, error } = useTopAnime(1);
  const { data: seasonNow, isLoading: loadingSeason, error: seasonError } = useSeasonsNow();
  const { data: news = [] } = useNews(5);

  return (
    <div className="relative pb-24 overflow-hidden">
      {/* Background radial decorations for premium look */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none -mr-48 -mt-24"></div>
      <div className="absolute top-[800px] left-0 w-[600px] h-[600px] bg-accent/5 blur-[150px] rounded-full pointer-events-none -ml-64"></div>

      <div className="max-w-6xl mx-auto relative z-10 px-4 pt-24">
        {/* Replace Hero with Auto-scrolling Marquee */}
        <div className="mb-20">
          {seasonError ? (
            <ErrorFallback 
              error={seasonError} 
              title="Error Loading Spotlight" 
              className="w-full"
            />
          ) : (
            <AiringMarquee items={seasonNow} isLoading={loadingSeason} />
          )}
        </div>

        {/* Global Top 10 Anime Carousel - Now Second (First section below marquee) */}
        <section className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
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
            <TopAnimeCarousel items={data} isLoading={isLoading} />
          </div>

          {error && (
            <ErrorFallback 
              error={error} 
              title="Error Loading Top Anime" 
              className="mt-10"
            />
          )}
        </section>

        {/* Current Season Section - Now Third */}
        <section className="mt-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative p-2 bg-orange-500/10 rounded-lg overflow-hidden group">
              <div className="absolute inset-0 bg-orange-500/20 blur-xl group-hover:bg-orange-500/30 transition-colors duration-500"></div>
              <Flame className="relative w-6 h-6 text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                TOP AIRING NOW
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-transparent rounded-full mt-1"></div>
            </div>
          </div>
          <p className="text-gray-400 text-lg">The most popular series currently broadcasting</p>

          <div className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
            {loadingSeason && Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}

            {!loadingSeason && seasonNow?.slice(0, 10).map((anime: Anime, idx: number) => (
              <div
                key={anime.mal_id}
                className="animate-in fade-in zoom-in-95 slide-in-from-bottom-5 duration-700 hover:z-10"
                style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
              >
                <AnimeCard anime={anime} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* News Rotation Popup - Fixed Bottom */}
      <NewsPopup newsItems={news} />
    </div>
  );
}
