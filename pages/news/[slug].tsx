import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Share2, 
  Heart, 
  Clock, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import { NewsArticle } from '../../types/news';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../hooks/useUserData';
import ErrorFallback from '../../components/ErrorFallback';

export default function NewsDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const { user } = useAuth();
  const { likedNews, toggleNewsLike } = useUserData();

  // Fetch news list and find by slug
  const { data: newsItems = [], isLoading, error } = useQuery({
    queryKey: ['news-api'],
    queryFn: async () => {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error('Failed to fetch news');
      return res.json() as Promise<NewsArticle[]>;
    },
    staleTime: 5 * 60 * 1000,
  });

  const article = newsItems.find(n => n.id === slug);
  const relatedNews = newsItems.filter(n => n.id !== slug).slice(0, 4);

  const isLiked = article ? likedNews.some(n => n.url === article.url) : false;

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (article) await toggleNewsLike(article);
  };

  const handleShare = async () => {
    if (!article) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-black uppercase tracking-[0.3em] animate-pulse">Decrypting Transmission...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen pt-32 px-4 bg-gray-950">
        <div className="max-w-xl mx-auto">
          <ErrorFallback 
            title="Article Not Found" 
            error={new Error("The transmission was lost or the article has moved.")} 
          />
          <div className="mt-8 text-center">
             <Link href="/news" className="text-accent hover:underline flex items-center justify-center gap-2 font-bold">
               <ArrowLeft className="w-4 h-4" /> Back to Intelligence Hub
             </Link>
          </div>
        </div>
      </div>
    );
  }

  const sanitizedContent = article.content ? DOMPurify.sanitize(article.content) : '';

  return (
    <div className="relative min-h-screen bg-gray-950 pb-24 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-accent/10 to-transparent pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden">
        <Image 
          src={article.image || '/placeholder-news.jpg'} 
          alt={article.title}
          fill
          priority
          className="w-full h-full object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-12 z-20">
          <div className="max-w-4xl mx-auto">
            <Link 
              href="/news"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-xl text-gray-300 hover:text-white transition-all mb-6 border border-white/5 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to News
            </Link>
            
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {article.categories?.map(cat => (
                <span key={cat} className="px-3 py-1 bg-accent text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-lg shadow-accent/20">
                  {cat}
                </span>
              ))}
              <span className="flex items-center gap-1.5 text-gray-400 text-xs font-bold">
                <Calendar className="w-3.5 h-3.5" /> {new Date(article.date).toLocaleDateString()}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-5xl lg:text-6xl font-black text-white leading-tight uppercase italic tracking-tighter">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-30">
        <div className="bg-gray-900/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-6 md:p-12 shadow-2xl">
          
          {/* Article Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-white/5 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center border border-accent/30 overflow-hidden">
                <User className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Dispatched By</p>
                <p className="text-white font-black">{article.author_username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all ${
                  isLiked 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-black text-xs uppercase tracking-widest">{isLiked ? 'Liked' : 'Like'}</span>
              </button>
              
              <button 
                onClick={handleShare}
                className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl transition-all border border-white/5"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Article Text */}
          <div 
            className="prose prose-invert prose-accent max-w-none text-gray-300 leading-relaxed text-lg 
              prose-headings:text-white prose-headings:font-black prose-headings:italic prose-headings:tracking-tighter
              prose-a:text-accent hover:prose-a:underline
              prose-img:rounded-3xl prose-img:border prose-img:border-white/5 prose-img:shadow-2xl
              prose-p:mb-6"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {/* Footer Navigation */}
          <div className="mt-16 pt-10 border-t border-white/5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em]">Source Intel</p>
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-accent hover:underline flex items-center gap-1.5 text-xs font-bold"
              >
                Original Transmission on ANN <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-3 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl transition-all active:scale-90"
            >
              <ArrowLeft className="w-5 h-5 rotate-90" />
            </button>
          </div>
        </div>

        {/* Related News Carousel/Grid */}
        {relatedNews.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-3 mb-10">
              <TrendingUp className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">More Intel</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {relatedNews.map(news => (
                 <Link 
                   href={`/news/${news.id}`} 
                   key={news.id}
                   className="group bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 hover:border-accent/40 transition-all flex items-center gap-5"
                 >
                   <div className="w-24 h-24 shrink-0 overflow-hidden rounded-2xl relative">
                     <Image 
                       src={news.image || '/placeholder-news.jpg'} 
                       alt={news.title}
                       fill
                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                       sizes="100px"
                     />
                   </div>
                   <div className="min-w-0">
                     <h3 className="text-white font-black text-sm line-clamp-2 mb-2 group-hover:text-accent transition-colors">
                       {news.title}
                     </h3>
                     <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                       <Clock className="w-3 h-3" /> {new Date(news.date).toLocaleDateString()}
                     </div>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-accent translate-x-0 group-hover:translate-x-1 transition-all shrink-0" />
                 </Link>
               ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .prose img {
          width: 100%;
          height: auto;
          margin: 2rem 0;
        }
        .prose ul, .prose ol {
          margin-bottom: 2rem;
          padding-left: 1.5rem;
        }
        .prose li {
          margin-bottom: 0.5rem;
          list-style: disc;
        }
      `}</style>
    </div>
  );
}
