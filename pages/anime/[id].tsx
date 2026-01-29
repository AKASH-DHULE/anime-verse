import { useRouter } from 'next/router';
import Image from 'next/image';
import useAnimeDetails from '../../hooks/useAnimeDetails';
import useReviews from '../../hooks/useReviews';
import useWatchOrder from '../../hooks/useWatchOrder';
import WatchOrderList from '../../components/WatchOrderList';
import ReviewCard from '../../components/ReviewCard';
import SkeletonCard from '../../components/SkeletonCard';
import useLocalStorage from '../../hooks/useLocalStorage';
import type { Anime } from '../../types/anime';
import type { Genre } from '../../types/genre';
import type { Review } from '../../types/review';

export default function AnimeDetails(): JSX.Element {
  const router = useRouter();
  const { id } = router.query;
  const { data: details, isLoading: loadingDetails, error: detailsError } = useAnimeDetails(id as string);
  const { data: reviews, isLoading: loadingReviews, error: reviewsError } = useReviews(id as string);
  const { data: relations, isLoading: loadingRelations, error: relationsError } = useWatchOrder(id as string);

  // Local favorites & watchlist for detail page (persisted in localStorage)
  const [favorites, setFavorites] = useLocalStorage<Anime[]>('favorites', []);
  const [watchlist, setWatchlist] = useLocalStorage<Anime[]>('watchlist', []);

  const isFav = details ? favorites.some((f: Anime) => f.mal_id === details.mal_id) : false;
  const isInWatchlist = details ? watchlist.some((w: Anime) => w.mal_id === details.mal_id) : false;

  const toggleFav = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (!details) return;
    if (isFav) setFavorites(favorites.filter((f) => f.mal_id !== details.mal_id));
    else setFavorites([details, ...favorites]);
  };

  const toggleWatch = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (!details) return;
    if (isInWatchlist) setWatchlist(watchlist.filter((w) => w.mal_id !== details.mal_id));
    else setWatchlist([details, ...watchlist]);
  };

  return (
    <div className="max-w-6xl mx-auto mt-12">
      {loadingDetails && (
        <div>
          <div className="h-48 skeleton w-full rounded" />
          <div className="mt-4 h-6 skeleton w-1/3" />
        </div>
      )}

      {details && (
        <>
          <div>
            <h1 className="text-4xl font-extrabold">{details.title}</h1>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="relative w-full h-80 rounded overflow-hidden bg-gray-800">
                {details.images?.jpg?.image_url ? (
                  <Image src={details.images.jpg.image_url} alt={details.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                )}
              </div>

              <div className="mt-3 space-y-1 text-sm text-gray-400">
                <div><strong>Score:</strong> {details.score ?? 'N/A'}</div>
                <div><strong>Status:</strong> {details.status}</div>
                <div><strong>Episodes:</strong> {details.episodes ?? '?'}</div>
                <div><strong>Genres:</strong> {details.genres?.map((g: Genre) => g.name).join(', ')}</div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={toggleFav}
                  aria-pressed={isFav}
                  className={`px-3 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${isFav ? 'bg-accent text-white' : 'border border-gray-700 text-gray-200 hover:bg-gray-800'}`}>
                  {isFav ? '♥ Remove Favorite' : '♡ Add to Favorites'}
                </button>

                <button
                  type="button"
                  onClick={toggleWatch}
                  aria-pressed={isInWatchlist}
                  className={`px-3 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${isInWatchlist ? 'bg-accent text-white' : 'border border-gray-700 text-gray-200 hover:bg-gray-800'}`}>
                  {isInWatchlist ? '✔ In Watchlist' : '+ Add to Watchlist'}
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <h2 className="text-xl font-bold">Synopsis</h2>
              <p className="text-gray-300 mt-2">{details.synopsis || 'No synopsis available.'}</p>

              {details.background && (
                <>
                  <h3 className="text-lg font-bold mt-6">Background</h3>
                  <p className="text-gray-300 mt-2">{details.background}</p>
                </>
              )}

              <h3 className="text-2xl font-extrabold mt-8">Watch Order / Related</h3>

              {loadingRelations && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              )}

              {relations && relations.length === 0 && <div className="text-gray-400 mt-3">Official watch order not available. Showing related anime instead.</div>}

              {relations && relations.length > 0 && (
                <div className="mt-4">
                  <WatchOrderList items={relations} />
                </div>
              )}

              {relationsError && <div className="text-red-400 mt-3">{(relationsError as Error).message}</div>}

            </div>
          </div>
        </div>

        <section className="mt-8">
          <h3 className="text-2xl font-extrabold">Reviews</h3>

          {reviewsError && <div className="text-red-400">{(reviewsError as Error).message}</div>}

          {loadingReviews && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {!loadingReviews && reviews && reviews.length === 0 && <div className="text-gray-400 mt-3">No reviews available for this anime yet.</div>}

          {!loadingReviews && reviews && reviews.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.map((r: Review) => (
                <ReviewCard key={r.mal_id || r.date} review={r} />
              ))}
            </div>
          )}
        </section>
        </>
      )}

      {detailsError && <div className="text-red-400 mt-4">Failed to load anime details.</div>}
    </div>
  );
}
