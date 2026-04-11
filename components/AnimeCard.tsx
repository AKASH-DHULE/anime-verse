import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, Plus, Check } from 'lucide-react';
import type { Anime } from '../types/anime';
import { useUserData } from '../hooks/useUserData';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function AnimeCard({ anime, rank }: { anime: Anime; rank?: number }) {
  const image = anime.images?.jpg?.image_url || anime.images?.webp?.image_url || '';
  const { user } = useAuth();
  const { favorites, watchlist, toggleFavorite, toggleWatchlist } = useUserData();
  const router = useRouter();

  const isFav = favorites?.some((f: Anime) => f.mal_id === anime.mal_id);
  const isInWatchlist = watchlist?.some((w: Anime) => w.mal_id === anime.mal_id);

  const toggleFav = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    await toggleFavorite(anime);
  };

  const toggleWatch = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    await toggleWatchlist(anime);
  };

  return (
    <article className="group relative bg-gray-950 rounded-2xl overflow-hidden border border-white/5 hover:border-accent/40 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-accent/20 flex flex-col h-full">
      <div className="relative aspect-[2/3] overflow-hidden">
        <Link href={`/anime/${anime.mal_id}`} className="block w-full h-full">
          {/* Poster Image */}
          {image ? (
            <Image
              src={image}
              alt={`${anime.title_english || anime.title} anime poster`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              priority={false}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-400">No Image</div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>

        {/* Floating Quick Actions Container */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out">
          <button
            onClick={toggleFav}
            className={`w-10 h-10 rounded-xl backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isFav ? 'bg-pink-500 text-white border-pink-500/50' : 'bg-black/40 text-white hover:bg-accent hover:border-accent/50'
            }`}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={toggleWatch}
            className={`w-10 h-10 rounded-xl backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isInWatchlist ? 'bg-accent text-white border-accent/50' : 'bg-black/40 text-white hover:bg-accent hover:border-accent/50'
            }`}
            title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {isInWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>

        {/* Badges (Top Left) */}
        <div className="absolute top-3 left-3 z-10 flex items-center pointer-events-none">
          {rank && (
            <div className="flex items-center justify-center w-8 h-8 bg-accent text-white font-black rounded-lg shadow-lg border border-white/20 transform -rotate-12 group-hover:rotate-0 transition-transform duration-300">
              #{rank}
            </div>
          )}
        </div>

        {/* Score Badge (Bottom Right on Image) */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 shadow-lg pointer-events-none transition-opacity duration-300 opacity-100 group-hover:opacity-0">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-white tracking-wide">{anime.score ?? 'N/A'}</span>
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col justify-between bg-gradient-to-b from-gray-901/50 to-gray-950">
        <Link href={`/anime/${anime.mal_id}`}>
          <h3 className="font-bold text-sm sm:text-base text-gray-100 line-clamp-2 leading-snug group-hover:text-accent transition-colors mb-2" title={anime.title_english || anime.title}>
            {anime.title_english || anime.title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5 text-[10px] sm:text-xs">
          <div className="text-gray-500 font-bold uppercase tracking-widest truncate max-w-[120px]">
            {anime.type || 'TV'} • {anime.episodes || '?'} EPS
          </div>
          
          <Link href={`/anime/${anime.mal_id}`} className="font-black text-accent hover:text-white uppercase tracking-wider flex items-center gap-1 transition-colors">
            DETAILS <Plus className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
