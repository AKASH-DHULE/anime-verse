export default function SkeletonCard() {
  return (
    <div className="group relative bg-gray-900/40 rounded-2xl overflow-hidden border border-white/5 flex flex-col h-full animate-pulse">
      {/* Poster Skeleton */}
      <div className="relative aspect-[2/3] bg-gray-800" />
      
      {/* Content Skeleton */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-800 rounded-lg" />
          <div className="h-4 w-2/3 bg-gray-800 rounded-lg" />
        </div>
        
        <div className="flex items-center justify-between mt-6 pt-2 border-t border-white/5">
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-800 rounded-xl" />
            <div className="w-8 h-8 bg-gray-800 rounded-xl" />
          </div>
          <div className="h-3 w-12 bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );
}
