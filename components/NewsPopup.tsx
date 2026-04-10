import React, { useState, useEffect } from 'react';
import { X, Zap, ChevronRight, Newspaper } from 'lucide-react';
import { NewsArticle } from '../types/news';
import Link from 'next/link';
import Image from 'next/image';

interface NewsPopupProps {
  newsItems: NewsArticle[];
}

export default function NewsPopup({ newsItems }: NewsPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Initial show after 2 seconds
  useEffect(() => {
    if (newsItems.length === 0) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [newsItems]);

  // Auto-dismiss after 30 seconds
  useEffect(() => {
    if (!isVisible) return;

    const autoDismissTimer = setTimeout(() => {
      setIsVisible(false);
      setIsDismissed(true);
    }, 30000);

    return () => clearTimeout(autoDismissTimer);
  }, [isVisible]);

  // Rotation logic
  useEffect(() => {
    if (!isDismissed) return;

    // Wait 2 minutes before showing the next item
    const rotationTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(newsItems.length, 5));
      setIsVisible(true);
      setIsDismissed(false);
    }, 120000);

    return () => clearTimeout(rotationTimer);
  }, [isDismissed, newsItems.length]);

  if (!isVisible || newsItems.length === 0) return null;

  const currentNews = newsItems[currentIndex];

  return (
    <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-lg md:max-w-xl animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="bg-gray-950/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] group relative">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-white/5 w-full z-20">
           <div className="h-full bg-accent w-full origin-left animate-[progress_30s_linear_infinite]"></div>
        </div>

        <div className="flex flex-row items-stretch">
          {/* Thumbnail - Hidden on very small screens or made very small */}
          <div className="w-24 sm:w-32 md:w-40 relative overflow-hidden shrink-0">
            <Image 
              src={currentNews.image || currentNews.images?.jpg?.image_url || '/placeholder-news.jpg'} 
              alt="Breaking News"
              fill
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              sizes="(max-width: 640px) 100px, (max-width: 768px) 150px, 200px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-950/20"></div>
            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-accent text-[7px] font-black rounded uppercase tracking-tighter shadow-lg z-10">
              #{currentIndex + 1} TOP
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 md:p-6 flex-grow relative min-w-0">
            <button 
              onClick={() => {
                setIsVisible(false);
                setIsDismissed(true);
              }}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-90 z-30"
              title="Dismiss"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <div className="flex items-center gap-1.5 text-accent text-[9px] font-black uppercase tracking-[0.2em] mb-1.5">
              <Zap className="w-2.5 h-2.5 fill-current" />
              <span>Flash News</span>
            </div>

            <h3 className="text-sm sm:text-base md:text-xl font-black text-white leading-tight mb-2 line-clamp-2 pr-6">
              {currentNews.title}
            </h3>
            
            <p className="text-gray-400 text-[10px] md:text-sm line-clamp-1 mb-4 opacity-70 hidden sm:block">
              {currentNews.excerpt}
            </p>

            <div className="flex items-center gap-4">
              <Link
                href={`/news/${currentNews.id}`}
                className="bg-white text-gray-950 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-accent hover:text-white transition-all flex items-center gap-1.5 group/btn active:scale-95 shadow-lg shadow-white/5"
                onClick={() => setIsVisible(false)}
              >
                READ <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/news"
                className="text-gray-500 hover:text-white text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
                onClick={() => setIsVisible(false)}
              >
                <Newspaper className="w-3 h-3" /> ALL
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
