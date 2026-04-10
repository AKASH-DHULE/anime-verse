import React from 'react';
import { Play, Youtube, ExternalLink } from 'lucide-react';
import { PromoItem } from '../types/news';
import Image from 'next/image';

interface PromoCardProps {
  promo: PromoItem;
}

export default function PromoCard({ promo }: PromoCardProps) {
  return (
    <div className="group relative bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden hover:border-accent/40 transition-all duration-500">
      {/* Thumbnail with Overlay */}
      <div className="aspect-video relative overflow-hidden">
        <Image 
          src={promo.trailer.images.large_image_url || promo.entry.images.jpg.large_image_url} 
          alt={promo.entry.title}
          fill
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-gray-950/40 group-hover:bg-gray-950/20 transition-colors duration-500 flex items-center justify-center">
          <div className="w-14 h-14 bg-accent/90 rounded-full flex items-center justify-center shadow-xl shadow-accent/20 transition-all duration-500 group-hover:scale-110 group-hover:bg-accent cursor-pointer">
            <Play className="w-6 h-6 text-white fill-current ml-1" />
          </div>
        </div>

        {/* Source Badge */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-rose-600 rounded-lg flex items-center gap-1 shadow-lg">
          <Youtube className="w-3 h-3 text-white" />
          <span className="text-[10px] font-black text-white uppercase tracking-tighter">YouTube</span>
        </div>
        
        {/* Anime Title Badge */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="px-3 py-1.5 bg-gray-950/80 backdrop-blur-md rounded-lg border border-white/5 inline-block max-w-full">
            <p className="text-[11px] font-bold text-gray-200 truncate uppercase tracking-wide">
              {promo.entry.title}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-100 line-clamp-1 group-hover:text-accent transition-colors">
            Official Trailer
          </h4>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">PV • New Release</p>
        </div>
        
        <a 
          href={promo.trailer.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors group/btn"
        >
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover/btn:text-accent transition-colors" />
        </a>
      </div>

      {/* Hover decoration */}
      <div className="absolute -bottom-1 -left-1 -right-1 h-1 bg-gradient-to-r from-accent via-blue-500 to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
}
