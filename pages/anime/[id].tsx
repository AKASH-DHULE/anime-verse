import { useRouter } from 'next/router';
import Image from 'next/image';
import useAnimeDetails from '../../hooks/useAnimeDetails';
import useReviews from '../../hooks/useReviews';
import useWatchOrder from '../../hooks/useWatchOrder';
import WatchOrderList from '../../components/WatchOrderList';
import ReviewCard from '../../components/ReviewCard';
import SkeletonCard from '../../components/SkeletonCard';
import ErrorFallback from '../../components/ErrorFallback';
import useLocalStorage from '../../hooks/useLocalStorage';
import type { Anime } from '../../types/anime';
import type { Genre } from '../../types/genre';
import type { Review } from '../../types/review';

export default function AnimeDetails(): JSX.Element {
  const router = useRouter();
  const { id } = router.query;
  const { data: details, isLoading: loadingDetails, error: detailsError } = useAnimeDetails(id as string);
  const { data: reviews, isLoading: loadingReviews, error: reviewsError } = useReviews(id as string);
  const { data: relations, isLoading: loadingRelations } = useWatchOrder(id as string);

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

  // PAGE NOT READY: Router not initialized or no ID
  if (!router.isReady || !id) {
    return (
      <div className="max-w-6xl mx-auto mt-12 px-4">
        <div className="h-48 skeleton w-full rounded" />
        <div className="mt-4 h-6 skeleton w-1/3" />
      </div>
    );
  }

  // LOADING STATE: Show skeletons while fetching
  if (loadingDetails) {
    return (
      <div className="max-w-6xl mx-auto mt-12 px-4">
        <div className="h-48 skeleton w-full rounded" />
        <div className="mt-4 h-6 skeleton w-1/3" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="h-80 skeleton rounded" />
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="h-6 skeleton w-full" />
            <div className="h-6 skeleton w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE: Anime not found (404) or other errors
  if (details === null) {
    return (
      <ErrorFallback
        error="This anime does not exist in our database."
        title="Anime Not Found"
        resetError={() => router.reload()}
      />
    );
  }

  // ERROR STATE: Other API errors
  if (detailsError) {
    return (
      <ErrorFallback
        error={(detailsError as Error).message}
        title="Error Loading Anime"
        resetError={() => router.reload()}
      />
    );
  }

  // NORMAL STATE: Anime data loaded successfully
  // TypeScript narrowing: details is guaranteed to be Anime here (not null)
  const anime = details!; // Non-null assertion after null check above
  
  return (
    <div className="max-w-6xl mx-auto mt-12 px-4">
      <div>
        <h1 className="text-4xl font-extrabold">{anime.title}</h1>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Poster and Info */}
          <div className="md:col-span-1">
            {/* Poster Image Container */}
            <div className="relative w-full bg-gray-800 shadow-lg rounded-lg overflow-hidden" style={{ aspectRatio: '2/3' }}>
              {anime.images?.jpg?.image_url ? (
                <Image
                  src={anime.images.jpg.image_url}
                  alt={`${anime.title} anime poster`}
                  fill
                  className="object-cover"
                  priority={false}
                  unoptimized
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 text-gray-400">
                  <div className="text-center">
                    <div className="text-3xl mb-2">📺</div>
                    <p className="text-sm">No Image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Anime Info */}
            <div className="mt-6 space-y-3 text-sm text-gray-400 bg-gray-900 rounded-lg p-4">
              {anime.score !== undefined && anime.score !== null && (
                <div className="flex justify-between items-center">
                  <span><strong>Score:</strong></span>
                  <span className="text-accent font-bold">⭐ {anime.score.toFixed(1)}</span>
                </div>
              )}
              {anime.status && (
                <div className="flex justify-between items-center">
                  <span><strong>Status:</strong></span>
                  <span>{anime.status}</span>
                </div>
              )}
              {anime.episodes && (
                <div className="flex justify-between items-center">
                  <span><strong>Episodes:</strong></span>
                  <span>{anime.episodes}</span>
                </div>
              )}
              {anime.genres && anime.genres.length > 0 && (
                <div>
                  <strong className="block mb-2">Genres:</strong>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((g: Genre) => (
                      <span key={g.mal_id} className="px-2 py-1 bg-gray-800 rounded text-xs">
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={toggleFav}
                aria-pressed={isFav}
                className={`flex-1 px-3 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-accent font-semibold ${isFav ? 'bg-accent text-white' : 'border border-gray-700 text-gray-200 hover:bg-gray-800'}`}>
                {isFav ? '♥ Favorited' : '♡ Favorite'}
              </button>

              <button
                type="button"
                onClick={toggleWatch}
                aria-pressed={isInWatchlist}
                className={`flex-1 px-3 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-accent font-semibold ${isInWatchlist ? 'bg-accent text-white' : 'border border-gray-700 text-gray-200 hover:bg-gray-800'}`}>
                {isInWatchlist ? '✔ Watching' : '+ Watchlist'}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Description and Details */}
          <div className="md:col-span-2">
            {/* Synopsis */}
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-3">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed">
                {anime.synopsis || 'No synopsis available for this anime.'}
              </p>
            </div>

            {/* Background */}
            {/* Background property not available in API - removed */}


            {/* Watch Order / Related Anime */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-2xl font-extrabold mb-4">Watch Order / Related</h3>

              {loadingRelations && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {relations && relations.length === 0 && (
                <div className="text-gray-400 py-8 text-center">
                  📺 No related anime found for this series.
                </div>
              )}

              {relations && relations.length > 0 && (
                <div className="mt-4">
                  <WatchOrderList items={relations} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <section className="mt-12 bg-gray-900 rounded-lg p-6">
        <h3 className="text-2xl font-extrabold mb-4">Reviews</h3>

        {reviewsError && (
          <div className="text-red-400 text-sm bg-red-900/20 p-4 rounded mb-4">
            ⚠️ Unable to load reviews: {(reviewsError as Error).message}
          </div>
        )}

        {loadingReviews && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loadingReviews && reviews && reviews.length === 0 && (
          <div className="text-gray-400 py-8 text-center">
            💬 No reviews available yet. Be the first to review!
          </div>
        )}

        {!loadingReviews && reviews && reviews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviews.map((r: Review) => (
              <ReviewCard key={r.mal_id || r.date} review={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
