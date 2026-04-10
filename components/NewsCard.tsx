import React from 'react';
import { Heart, Share2, ExternalLink, Calendar, User, ArrowRight } from 'lucide-react';
import { NewsArticle } from '../types/news';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../hooks/useUserData';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

interface NewsCardProps {
  news: NewsArticle;
  featured?: boolean;
}

export default function NewsCard({ news, featured }: NewsCardProps) {
  const { user } = useAuth();
  const { likedNews, toggleNewsLike } = useUserData();
  const router = useRouter();

  const isLiked = likedNews.some(n => n.url === news.url);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    await toggleNewsLike(news);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const shareData = {
      title: news.title,
      text: news.excerpt,
      url: news.url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(news.url);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (featured) {
    return (
      <Link href={`/news/${news.id}`} className="group relative block w-full h-[350px] sm:h-[450px] md:h-[500px] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-700 hover:border-accent/40 bg-gray-950">
        <Image 
          src={news.image || news.images?.jpg?.image_url || '/placeholder-news.jpg'} 
          alt={news.title}
          fill
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-60"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 p-5 sm:p-8 md:p-10 w-full space-y-3 sm:space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-accent text-white text-[10px] sm:text-xs font-black rounded-lg uppercase tracking-widest shadow-lg shadow-accent/20 animate-pulse">
              HOT UPDATE
            </span>
            <span className="text-gray-300 text-[10px] sm:text-xs font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(news.date).toLocaleDateString()}
            </span>
          </div>
          
          <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-tight line-clamp-2 group-hover:text-accent transition-colors duration-300">
            {news.title}
          </h2>
          
          <p className="text-gray-300 text-xs sm:text-sm md:text-base line-clamp-2 max-w-3xl opacity-80 font-medium">
            {news.excerpt}
          </p>

          <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-white/10">
            <div className="flex items-center gap-4 sm:gap-6">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 group/btn transition-all p-1 -m-1 ${isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'}`}
                title="Like Article"
              >
                <div className={`p-2.5 rounded-full transition-colors ${isLiked ? 'bg-rose-500/15' : 'bg-white/5 group-hover/btn:bg-rose-500/15'}`}>
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </div>
              </button>
              
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-all group/btn p-1 -m-1"
                title="Share Article"
              >
                <div className="p-2.5 rounded-full bg-white/5 group-hover/btn:bg-blue-500/15 transition-colors">
                  <Share2 className="w-5 h-5" />
                </div>
              </button>
            </div>

            <div 
              className="px-4 sm:px-6 py-2 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-2xl text-[10px] sm:text-xs font-black tracking-widest transition-all flex items-center gap-2 group/more active:scale-95"
            >
              READ <span className="hidden sm:inline">ARTICLE</span> <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="group bg-gray-900/30 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden hover:border-accent/40 hover:bg-gray-900/50 transition-all duration-500 flex flex-col h-full shadow-lg">
      <Link href={`/news/${news.id}`} className="block aspect-video relative overflow-hidden">
        <Image 
          src={news.image || news.images?.jpg?.image_url || '/placeholder-news.jpg'} 
          alt={news.title}
          fill
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-4 left-4 px-2 py-1 bg-accent/90 backdrop-blur-md rounded-lg text-[8px] uppercase font-black tracking-[0.2em] text-white shadow-lg z-10">
          DISPATCH
        </div>
      </Link>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-4 uppercase font-bold tracking-[0.1em]">
           <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(news.date).toLocaleDateString()}</span>
           <span className="opacity-30">•</span>
           <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {news.author_username}</span>
        </div>
        
        <h3 className="font-black text-lg mb-3 line-clamp-2 leading-snug group-hover:text-accent transition-colors">
          {news.title}
        </h3>
        
        <p className="text-gray-400 text-sm line-clamp-3 mb-8 flex-grow leading-relaxed font-medium">
          {news.excerpt}
        </p>

        <div className="flex items-center justify-between pt-5 border-t border-white/5">
          <div className="flex items-center gap-5">
            <button 
              onClick={handleLike}
              className={`transition-all p-1 -m-1 ${isLiked ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'}`}
              title="Like"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current animate-in zoom-in-75' : 'hover:scale-110'}`} />
            </button>
            <button 
              onClick={handleShare}
              className="text-gray-500 hover:text-blue-400 transition-all p-1 -m-1"
              title="Share"
            >
              <Share2 className="w-5 h-5 hover:scale-110" />
            </button>
          </div>
          
          <Link 
            href={`/news/${news.id}`} 
            className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-1.5 group/link hover:underline underline-offset-4"
          >
            READ MORE <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
