'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, PlayCircle } from 'lucide-react';
import type { Anime } from '../types/anime';

interface AiringMarqueeProps {
  items: Anime[] | undefined;
  isLoading: boolean;
}

export default function AiringMarquee({ items, isLoading }: AiringMarqueeProps) {
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Take top 10 for better variety in the marquee
  const displayItems = items?.slice(0, 10) || [];
  const itemCount = displayItems.length;
  
  // Duplicate items for infinite scroll effect - we need enough to cover the screen plus the scroll distance
  const loopItems = [...displayItems, ...displayItems, ...displayItems, ...displayItems];

  if (isLoading) {
    return (
      <div className="w-full h-[340px] md:h-[400px] bg-gray-900/50 rounded-3xl animate-pulse flex items-center justify-center">
        <p className="text-gray-500 font-medium font-outfit uppercase tracking-widest text-xs opacity-50">Loading premium spotlight...</p>
      </div>
    );
  }

  if (itemCount === 0) return null;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden group shadow-2xl border border-white/5 bg-gray-950/40 backdrop-blur-sm">
      {/* Background Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-orange-500/10 pointer-events-none opacity-50"></div>
      
      {/* Marquee Container */}
      <div 
        className="relative overflow-hidden py-6 sm:py-10"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div 
          ref={scrollRef}
          className={`flex gap-4 sm:gap-6 w-max marquee-content ${paused ? 'animate-pause' : 'animate-marquee'}`}
          style={{
            animationDuration: `${itemCount * 5}s`,
            animationPlayState: paused ? 'paused' : 'running',
            // @ts-ignore - custom CSS variable
            '--item-count': itemCount
          } as React.CSSProperties}
        >
          {loopItems.map((anime, idx) => (
            <Link 
              href={`/anime/${anime.mal_id}`} 
              key={`${anime.mal_id}-${idx}`}
              className="relative w-[240px] md:w-[300px] h-[340px] md:h-[400px] rounded-2xl overflow-hidden group/card transition-all duration-700 hover:scale-[1.02] hover:z-10 shadow-xl border border-white/10"
            >
              {/* Image */}
              <Image
                src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || ''}
                alt={anime.title}
                fill
                sizes="300px"
                className="object-cover transition-transform duration-1000 group-hover/card:scale-110"
                unoptimized
              />
              
              {/* Overlays */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
              
              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-[11px] font-bold text-yellow-500">{anime.score || 'N/A'}</span>
                  </div>
                  <span className="text-[11px] font-medium text-white/70 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-wider font-outfit">
                    Top Airing
                  </span>
                </div>
                
                <h3 className="text-lg md:text-xl font-extrabold text-white line-clamp-2 leading-tight group-hover/card:text-accent transition-colors duration-300 tracking-tight">
                  {anime.title_english || anime.title}
                </h3>
                
                <div className="mt-4 flex items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-all duration-500 translate-y-2 group-hover/card:translate-y-0">
                  <span className="text-accent flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider font-outfit">
                    <PlayCircle className="w-5 h-5" />
                    View Series
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Fade Gradients at edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-gray-950 to-transparent z-10"></div>
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-gray-950 to-transparent z-10"></div>

      <style jsx>{`
        .marquee-content {
          --card-width: 240px;
          --gap: 16px;
          animation: marquee linear infinite;
        }
        @media (min-width: 640px) {
          .marquee-content {
            --gap: 24px;
          }
        }
        @media (min-width: 768px) {
          .marquee-content {
            --card-width: 300px;
          }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc((var(--card-width) + var(--gap)) * var(--item-count) * -1)); }
        }
        .animate-pause {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
