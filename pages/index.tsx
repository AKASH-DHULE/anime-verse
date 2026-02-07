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
    <div className="max-w-6xl mx-auto">
      <Hero />

      {/* Top 10 Anime Carousel */}
      <section className="mt-12">
        <h2 className="text-3xl font-extrabold">TOP 10 ANIME</h2>
        <p className="text-gray-400 mt-1">The most beloved anime series</p>

        <div className="mt-6 px-4 -mx-4">
          <TopAnimeCarousel items={data} isLoading={isLoading} error={error} />
        </div>

        {error && <div className="mt-4 text-red-400">Error loading top anime.</div>}
      </section>

      {/* Current Season Section */}
      <section className="mt-12">
        <h2 className="text-3xl font-extrabold">TOP CURRENTLY AIRING</h2>
        <p className="text-gray-400 mt-1">The hottest anime this season</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingSeason && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}

          {!loadingSeason && seasonNow?.slice(0, 3).map((anime: Anime) => (
            <AnimeCard key={anime.mal_id} anime={anime} />
          ))}
        </div>
      </section>
    </div>
  );
}
