import useLocalStorage from '../hooks/useLocalStorage';
import AnimeCard from '../components/AnimeCard';

import type { Anime } from '../types/anime';

export default function Favorites() {
  const [favorites] = useLocalStorage<Anime[]>('favorites', []);
  const [watchlist] = useLocalStorage<Anime[]>('watchlist', []);

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <h1 className="text-4xl font-extrabold">Favorites & Watchlist</h1>
      <p className="text-gray-400">Items saved locally will appear here.</p>

      <section className="mt-6">
        <h2 className="text-2xl font-bold">Favorites</h2>
        {favorites.length === 0 ? <div className="text-gray-400 mt-3">No favorites yet.</div> : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((a) => <AnimeCard key={a.mal_id} anime={a} />)}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold">Watchlist</h2>
        {watchlist.length === 0 ? <div className="text-gray-400 mt-3">No items in watchlist.</div> : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {watchlist.map((a) => <AnimeCard key={a.mal_id} anime={a} />)}
          </div>
        )}
      </section>
    </div>
  );
}
