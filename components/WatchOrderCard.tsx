import Link from 'next/link';
import Image from 'next/image';
import useAnimeDetail from '../hooks/useAnimeDetail';
import SkeletonCard from './SkeletonCard';

interface WatchOrderCardProps {
  mal_id: number;
  title: string;
  relation: string;
}

function getRelationBadgeColor(relation: string): string {
  const r = (relation || '').toLowerCase();
  if (r.includes('prequel')) return 'bg-blue-600';
  if (r.includes('sequel')) return 'bg-purple-600';
  if (r.includes('side') || r.includes('adaptation')) return 'bg-amber-600';
  if (r.includes('spin')) return 'bg-pink-600';
  if (r.includes('movie')) return 'bg-indigo-600';
  if (r.includes('ova') || r.includes('special')) return 'bg-cyan-600';
  return 'bg-gray-600';
}

function getRelationLabel(relation: string): string {
  const r = (relation || '').toLowerCase();
  if (r.includes('prequel')) return 'Prequel';
  if (r.includes('sequel')) return 'Sequel';
  if (r.includes('adaptation')) return 'Adaptation';
  if (r.includes('side')) return 'Side Story';
  if (r.includes('spin')) return 'Spin-off';
  if (r.includes('movie')) return 'Movie';
  if (r.includes('ova')) return 'OVA';
  if (r.includes('special')) return 'Special';
  return relation;
}

export default function WatchOrderCard({ mal_id, title, relation }: WatchOrderCardProps) {
  const { data: animeDetail, isLoading } = useAnimeDetail(mal_id);

  if (isLoading) {
    return <SkeletonCard />;
  }

  const image = animeDetail?.large_image_url || '';
  const badgeColor = getRelationBadgeColor(relation);
  const badgeLabel = getRelationLabel(relation);

  return (
    <Link href={`/anime/${mal_id}`} className="group block">
      {/* CRITICAL: Parent div must have position: relative for Image fill to work */}
      <div className="relative h-60 bg-gray-800 rounded-lg overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
        {/* Image - using fill with sizes prop and alt attribute */}
        {image ? (
          <Image
            src={image}
            alt={`${title} anime poster`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            priority={false}
            unoptimized
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Relation badge - top left */}
        <div
          className={`absolute top-3 left-3 ${badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg transition-all duration-300 group-hover:scale-110 z-10`}>
          {badgeLabel}
        </div>

        {/* Title and type - bottom, always visible on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white transition-all duration-300 z-10">
          <h3 className="font-bold text-sm line-clamp-2 group-hover:text-accent">{title}</h3>
          {animeDetail?.type && (
            <p className="text-xs text-gray-300 mt-1">{animeDetail.type}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
