import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, Bookmark, Plus, Check } from 'lucide-react';
import type { Anime } from '../types/anime';
import useLocalStorage from '../hooks/useLocalStorage';

export default function AnimeCard({ anime, rank }: { anime: Anime; rank?: number }) {
  const image = anime.images?.jpg?.image_url || anime.images?.webp?.image_url || '';
  const [favorites, setFavorites] = useLocalStorage<Anime[]>('favorites', []);
  const [watchlist, setWatchlist] = useLocalStorage<Anime[]>('watchlist', []);

  const isFav = favorites.some((f: Anime) => f.mal_id === anime.mal_id);
  const isInWatchlist = watchlist.some((w: Anime) => w.mal_id === anime.mal_id);

  const toggleFav = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (isFav) setFavorites(favorites.filter((f) => f.mal_id !== anime.mal_id));
    else setFavorites([anime, ...favorites]);
  };

  const toggleWatch = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (isInWatchlist) setWatchlist(watchlist.filter((w) => w.mal_id !== anime.mal_id));
    else setWatchlist([anime, ...watchlist]);
  };

  return (
    <article className="group relative bg-gray-950 rounded-2xl overflow-hidden border border-white/5 hover:border-accent/40 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-accent/20 flex flex-col h-full">
      <Link href={`/anime/${anime.mal_id}`} className="block relative aspect-[2/3] overflow-hidden">
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

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          {rank && (
            <div className="flex items-center justify-center w-8 h-8 bg-accent text-white font-black rounded-lg shadow-lg border border-white/20 transform -rotate-12 group-hover:rotate-0 transition-transform duration-300">
              #{rank}
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 shadow-lg ml-auto">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold text-white tracking-wide">{anime.score ?? 'N/A'}</span>
          </div>
        </div>

        {/* Overlay Actions (Visible on Hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Link>

      <div className="p-4 flex-grow flex flex-col justify-between bg-gradient-to-b from-gray-900/50 to-gray-950">
        <h3 className="font-bold text-sm sm:text-base text-gray-100 line-clamp-2 leading-snug group-hover:text-accent transition-colors mb-2" title={anime.title_english || anime.title}>
          {anime.title_english || anime.title}
        </h3>
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
          <div className="flex gap-2">
            <button
              onClick={toggleFav}
              className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${isFav ? 'bg-pink-500/20 text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-pink-500' : ''}`} />
            </button>

            <button
              onClick={toggleWatch}
              className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${isInWatchlist ? 'bg-accent/20 text-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
              title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
          
          <Link href={`/anime/${anime.mal_id}`} className="text-xs font-medium text-accent hover:underline decoration-2 underline-offset-4">
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
