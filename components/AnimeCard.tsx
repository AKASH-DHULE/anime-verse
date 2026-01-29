import Link from 'next/link';
import Image from 'next/image';
import type { Anime } from '../types/anime';
import useLocalStorage from '../hooks/useLocalStorage';

export default function AnimeCard({ anime }: { anime: Anime }) {
  const image = anime.images?.jpg?.image_url || anime.images?.webp?.image_url || '';
  const [favorites, setFavorites] = useLocalStorage<Anime[]>('favorites', []);
  const [watchlist, setWatchlist] = useLocalStorage<Anime[]>('watchlist', []);

  const isFav = favorites.some((f: Anime) => f.mal_id === anime.mal_id);
  const isInWatchlist = watchlist.some((w: Anime) => w.mal_id === anime.mal_id);

  const toggleFav = (e?: React.MouseEvent) => {
    // prevent parent click handlers from triggering
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
    <article className="relative bg-gray-900 rounded overflow-hidden shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
      <Link href={`/anime/${anime.mal_id}`}>
        <div className="relative h-48 w-full bg-gray-800">
          {image ? (
            <Image src={image} alt={anime.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <h3 className="font-semibold">{anime.title}</h3>
        <div className="mt-2 text-sm text-gray-400 flex items-center justify-between">
          <span>⭐ {anime.score ?? 'N/A'}</span>
          <div className="space-x-2 flex items-center">
            <button
              type="button"
              aria-pressed={isFav}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
              onClick={toggleFav}
              className={`pointer-events-auto z-20 px-2 py-1 text-xs rounded transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${isFav ? 'bg-accent text-white border-none' : 'border border-gray-700 text-gray-200 hover:bg-gray-800'}`}>
              {isFav ? '♥' : '♡'}
            </button>

            <button
              type="button"
              aria-pressed={isInWatchlist}
              title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              onClick={toggleWatch}
              className={`pointer-events-auto z-20 px-2 py-1 text-xs rounded transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${isInWatchlist ? 'bg-accent text-white border-none' : 'border border-gray-700 text-gray-200 hover:bg-gray-800'}`}>
              {isInWatchlist ? '✔' : '+'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
