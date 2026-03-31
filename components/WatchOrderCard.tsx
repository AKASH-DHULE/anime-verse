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
      <div className="flex flex-col items-center text-center">
        {/* Poster Node */}
        <div className="relative w-40 h-56 bg-gray-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] group-hover:-translate-y-2 group-hover:scale-105 border border-white/5">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-500 text-xs">No image</div>
          )}
          
          {/* Badge Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
             <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${badgeColor}`}>
              {badgeLabel}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 px-2">
          <h4 className="text-sm font-bold text-gray-200 line-clamp-2 leading-tight group-hover:text-accent transition-colors duration-300">
            {title}
          </h4>
          {animeDetail?.type && (
            <span className="text-[10px] text-gray-500 mt-1 uppercase font-semibold tracking-widest">{animeDetail.type}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
