import { motion } from 'framer-motion';

export default function SkeletonCard() {
  return (
    <div 
      className="group relative bg-gray-950 rounded-2xl overflow-hidden border border-white/5 flex flex-col h-full shadow-lg"
    >
      {/* Liquid Shimmer Effect */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
        className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
      />

      {/* Poster Skeleton */}
      <div className="relative aspect-[2/3] bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gray-800/50" />
      </div>
      
      {/* Content Skeleton */}
      <div className="p-4 flex-grow flex flex-col justify-between bg-gray-900/20">
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-800 rounded-lg relative overflow-hidden">
             <div className="absolute inset-0 bg-gray-700/30" />
          </div>
          <div className="h-4 w-2/3 bg-gray-800 rounded-lg relative overflow-hidden">
             <div className="absolute inset-0 bg-gray-700/30" />
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex gap-2">
            <div className="w-10 h-10 bg-gray-800 rounded-xl" />
            <div className="w-10 h-10 bg-gray-800 rounded-xl" />
          </div>
          <div className="h-3 w-16 bg-gray-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}
