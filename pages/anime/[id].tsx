import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import { Heart, BookmarkPlus, CheckCircle, HeartOff, Play, Star, Tv, Clock, Info } from 'lucide-react';
import useAnimeDetails from '../../hooks/useAnimeDetails';
import useReviews from '../../hooks/useReviews';
import useWatchOrder from '../../hooks/useWatchOrder';
import useStreaming from '../../hooks/useStreaming';
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
  const { data: streaming, isLoading: loadingStreaming } = useStreaming(id as string);

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

  if (!router.isReady || !id) {
    return <HeroSkeleton />;
  }

  if (loadingDetails) {
    return <HeroSkeleton />;
  }

  if (details === null) {
    return (
      <ErrorFallback
        error="This anime does not exist in our database."
        title="Anime Not Found"
        resetError={() => router.reload()}
      />
    );
  }

  if (detailsError) {
    return (
      <ErrorFallback
        error={(detailsError as Error).message}
        title="Error Loading Anime"
        resetError={() => router.reload()}
      />
    );
  }

  const anime = details!;
  const title = anime.title_english || anime.title;
  const bannerImage = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';

  return (
    <>
      <Head>
        <title>{title} — AnimeVerse</title>
        <meta name="description" content={anime.synopsis?.slice(0, 155) || `Details for ${title}`} />
      </Head>

      <div className="min-h-screen bg-black">
        {/* ─── CINEMATIC HERO ─── */}
        <div className="relative w-full overflow-hidden" style={{ minHeight: '480px' }}>
          {/* Blurred background */}
          {bannerImage && (
            <div className="absolute inset-0 z-0">
              <Image
                src={bannerImage}
                alt=""
                fill
                className="object-cover scale-110"
                unoptimized
                priority
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black" />
            </div>
          )}
          {!bannerImage && (
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black" />
          )}

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 flex flex-col items-center md:items-end md:flex-row gap-8 text-center md:text-left">
            {/* Poster */}
            <div className="flex-shrink-0 w-44 md:w-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10 animate-fade-in" style={{ aspectRatio: '2/3', position: 'relative' }}>
              {bannerImage ? (
                <Image
                  src={bannerImage}
                  alt={`${title} poster`}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500 text-sm">No Image</div>
              )}
            </div>

            {/* Title & meta */}
            <div className="animate-slide-up pb-2 flex-1 flex flex-col items-center md:items-start w-full">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                {anime.status && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${anime.status === 'Currently Airing' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-700/60 text-gray-300 border border-gray-600/50'}`}>
                    {anime.status}
                  </span>
                )}
                {anime.type && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-accent/20 text-accent border border-accent/30">
                    {anime.type}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 leading-tight tracking-tight drop-shadow-lg">
                {title}
              </h1>
              {anime.title !== title && (
                <p className="text-gray-400 text-sm mb-4 italic">{anime.title}</p>
              )}

              {/* Quick stats row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-gray-300 mb-6">
                {anime.score != null && (
                  <div className="flex items-center gap-1.5 font-semibold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-lg border border-yellow-400/20">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{anime.score.toFixed(1)}</span>
                  </div>
                )}
                {anime.episodes && (
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <Tv className="w-4 h-4 text-gray-400" />
                    <span>{anime.episodes} eps</span>
                  </div>
                )}
                {anime.duration && (
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{anime.duration.split(' ')[0]} {anime.duration.split(' ')[1] || ''}</span>
                  </div>
                )}
                {anime.year && (
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <Info className="w-4 h-4 text-gray-400" />
                    <span>{anime.year}</span>
                  </div>
                )}
              </div>

              {/* Genre chips */}
              {anime.genres && anime.genres.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
                  {anime.genres.map((g: Genre) => (
                    <span key={g.mal_id} className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-xs font-medium text-gray-200 hover:bg-white/20 transition-colors">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-row items-center justify-center md:justify-start gap-2 sm:gap-3 w-full">
                <button
                  type="button"
                  id="btn-favorite"
                  onClick={toggleFav}
                  aria-pressed={isFav}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent/50 ${isFav ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600 active:scale-95' : 'bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 active:scale-95'}`}
                >
                  {isFav ? <HeartOff className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                  <span className="truncate">{isFav ? 'Unfavorite' : 'Favorite'}</span>
                </button>
                <button
                  type="button"
                  id="btn-watchlist"
                  onClick={toggleWatch}
                  aria-pressed={isInWatchlist}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent/50 ${isInWatchlist ? 'bg-accent text-white shadow-lg shadow-accent/30 hover:bg-accent/90 active:scale-95' : 'bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 active:scale-95'}`}
                >
                  {isInWatchlist ? <CheckCircle className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
                  <span className="truncate">{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── MAIN CONTENT ─── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pb-20 space-y-8">

          {/* Trailer + Synopsis Row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Left: Trailer + Synopsis */}
            <div className="lg:col-span-3 space-y-6">
              {/* Trailer */}
              {anime.trailer?.embed_url && (
                <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5 bg-gray-900 group/trailer">
                  <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Play className="w-4 h-4 text-accent fill-current" />
                    </div>
                    <span className="text-sm font-bold text-gray-200 tracking-wide uppercase">Official Trailer</span>
                  </div>
                  <div className="aspect-video w-full">
                    <iframe
                      src={anime.trailer.embed_url}
                      title={`${title} Trailer`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Synopsis */}
              <GlassPanel title="Synopsis">
                <p className="text-gray-300 leading-relaxed text-[15px]">
                  {anime.synopsis || 'No synopsis available for this anime.'}
                </p>
              </GlassPanel>
            </div>

            {/* Right: Info + Where to Watch */}
            <div className="lg:col-span-2 space-y-6">
              {/* Anime Info */}
              <GlassPanel title="Details">
                <div className="space-y-3 text-sm">
                  {anime.score != null && <InfoRow label="Score" value={`⭐ ${anime.score.toFixed(1)}`} accent />}
                  {anime.rank && <InfoRow label="Rank" value={`#${anime.rank}`} />}
                  {anime.popularity && <InfoRow label="Popularity" value={`#${anime.popularity}`} />}
                  {anime.status && <InfoRow label="Status" value={anime.status} />}
                  {anime.episodes && <InfoRow label="Episodes" value={String(anime.episodes)} />}
                  {anime.duration && <InfoRow label="Duration" value={anime.duration} />}
                  {anime.season && anime.year && <InfoRow label="Season" value={`${capitalize(anime.season)} ${anime.year}`} />}
                  {anime.studios && anime.studios.length > 0 && (
                    <InfoRow label="Studio" value={anime.studios.map((s) => s.name).join(', ')} />
                  )}
                  {anime.source && <InfoRow label="Source" value={anime.source} />}
                  {anime.rating && <InfoRow label="Rating" value={anime.rating} />}
                </div>
              </GlassPanel>

              {/* Where to Watch */}
              <GlassPanel title="Where to Watch" icon="📺">
                {loadingStreaming ? (
                  <div className="space-y-2">
                    <div className="h-10 skeleton w-full rounded-lg" />
                    <div className="h-10 skeleton w-full rounded-lg" />
                  </div>
                ) : streaming && streaming.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {streaming.map((s) => (
                      <a
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-white/5 hover:bg-accent/20 hover:border-accent/40 border border-white/5 rounded-xl transition-all group"
                      >
                        <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">{s.name}</span>
                        <span className="text-xs font-bold text-gray-500 group-hover:text-accent transition-colors uppercase tracking-wider">Watch ↗</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No streaming data available.</p>
                )}
              </GlassPanel>
            </div>
          </div>

          {/* Watch Order Timeline */}
          <GlassPanel title="Watch Order / Related">
            {loadingRelations && (
              <div className="flex gap-4 overflow-hidden pt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-44">
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            )}
            {!loadingRelations && relations && relations.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Tv className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No related anime found for this series.</p>
              </div>
            )}
            {!loadingRelations && relations && relations.length > 0 && (
              <WatchOrderList items={relations} />
            )}
          </GlassPanel>

          {/* Reviews */}
          <GlassPanel title="Community Reviews">
            {reviewsError && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-4">
                ⚠️ Unable to load reviews: {(reviewsError as Error).message}
              </div>
            )}
            {loadingReviews && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}
            {!loadingReviews && reviews && reviews.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>💬 No reviews available yet. Be the first to review!</p>
              </div>
            )}
            {!loadingReviews && reviews && reviews.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reviews.map((r: Review) => (
                  <ReviewCard key={r.mal_id || r.date} review={r} />
                ))}
              </div>
            )}
          </GlassPanel>
        </div>
      </div>
    </>
  );
}

// ─── Helper Components ───

function GlassPanel({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/5">
        {icon && <span className="text-lg">{icon}</span>}
        <h2 className="text-base font-bold text-gray-100">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-gray-500 font-medium shrink-0">{label}</span>
      <span className={`text-right font-semibold ${accent ? 'text-yellow-400' : 'text-gray-200'}`}>{value}</span>
    </div>
  );
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function HeroSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <div className="relative w-full bg-gray-900/50" style={{ minHeight: '480px' }}>
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-20 flex items-end gap-8">
          <div className="w-44 rounded-2xl skeleton" style={{ aspectRatio: '2/3' }} />
          <div className="flex-1 space-y-4 pb-4">
            <div className="h-5 skeleton w-24 rounded-full" />
            <div className="h-10 skeleton w-3/4 rounded-xl" />
            <div className="h-4 skeleton w-1/2 rounded" />
            <div className="flex gap-2 mt-4">
              <div className="h-10 skeleton w-28 rounded-xl" />
              <div className="h-10 skeleton w-36 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="aspect-video skeleton rounded-2xl" />
          <div className="h-48 skeleton rounded-2xl" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 skeleton rounded-2xl" />
          <div className="h-40 skeleton rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
