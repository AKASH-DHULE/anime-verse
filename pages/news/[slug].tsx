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
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
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
  const [showToast, setShowToast] = React.useState(false);

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
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
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

  // Function to extract YouTube ID from content
  const extractYoutubeId = (content: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
    const matches = Array.from(content.matchAll(regex));
    if (matches.length > 0) {
      // Return the most recent (last found in HTML usually)
      return matches[matches.length - 1][1];
    }
    return null;
  };

  const decorateContent = (content: string) => {
    if (!content) return '';
    
    let decorated = content;

    // Highlight Dates (e.g., April 11, 2024, Fall 2024, July)
    const dateRegex = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?|\b(?:Spring|Summer|Fall|Winter)\s+\d{4}\b/gi;
    decorated = decorated.replace(dateRegex, (match) => `<span class="highlight-date">${match}</span>`);

    // Highlight Release Keywords
    const releaseKeywords = /\b(?:Premieres?|Launches?|Debuts?|Releases?|Opening|Starts? streaming|Announces?|Reveals?)\b/gi;
    decorated = decorated.replace(releaseKeywords, (match) => `<span class="highlight-action">${match}</span>`);

    // Highlight Platforms
    const platforms = /\b(?:Netflix|Crunchyroll|Disney\+|Hulu|Amazon Prime|HIDIVE|YouTube|Steam|Switch|PS5|Xbox)\b/gi;
    decorated = decorated.replace(platforms, (match) => `<span class="highlight-platform">${match}</span>`);

    // Highlight Importance
    const importance = /\b(?:Official|Announcements?|PV|Trailer|Teaser|Main Visual|Key Visual|Special)\b/gi;
    decorated = decorated.replace(importance, (match) => `<span class="highlight-imp">${match}</span>`);

    return decorated;
  };

  const videoId = article?.content ? extractYoutubeId(article.content) : null;
  const decoratedContent = article?.content ? decorateContent(article.content) : '';
  const sanitizedContent = decoratedContent ? DOMPurify.sanitize(decoratedContent) : '';

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = article ? `${article.title} | AnimeVerse News` : 'Anime News';

  return (
    <div className="relative min-h-screen bg-gray-950 pb-24 overflow-hidden">
      <Head>
        <title>{shareTitle}</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:image" content={article.image || '/placeholder-news.jpg'} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

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
        <div className="bg-gray-900/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-6 md:p-12 shadow-2xl relative">
          
          {/* Toast Notification */}
          {showToast && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-accent text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-accent/40 flex items-center gap-3">
                <Share2 className="w-4 h-4" /> Link Copied to Clipboard
              </div>
            </div>
          )}

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

          {/* Trailer Section */}
          {videoId && (
            <div className="mb-12 group">
              <div className="flex items-center gap-2 mb-4 text-accent">
                <TrendingUp className="w-4 h-4" />
                <span className="text-[10px] uppercase font-black tracking-[0.2em]">Latest Transmission</span>
              </div>
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gray-950">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Anime Trailer"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <p className="mt-4 text-gray-500 text-[9px] uppercase font-bold tracking-widest text-center italic">
                Video extracted from official sources
              </p>
            </div>
          )}

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
          margin: 2.5rem 0;
          border-radius: 2rem;
          box-shadow: 0 20px 50px -15px rgba(0,0,0,0.5);
        }
        .prose ul, .prose ol {
          margin-bottom: 2.5rem;
          padding-left: 1.5rem;
        }
        .prose li {
          margin-bottom: 0.75rem;
          list-style: disc;
          color: #9ca3af;
        }
        .prose p {
          margin-bottom: 1.75rem;
        }
        .highlight-date {
          color: #fbbf24;
          font-weight: 900;
          background: rgba(251, 191, 36, 0.1);
          padding: 2px 6px;
          border-radius: 6px;
          border: 1px solid rgba(251, 191, 36, 0.2);
        }
        .highlight-action {
          color: #ec4899;
          font-weight: 900;
          text-transform: uppercase;
          font-style: italic;
          letter-spacing: -0.02em;
        }
        .highlight-platform {
          color: #60a5fa;
          font-weight: 900;
          border-bottom: 2px solid rgba(96, 165, 250, 0.4);
        }
        .highlight-imp {
          color: #10b981;
          font-weight: 900;
          text-transform: uppercase;
          background: rgba(16, 185, 129, 0.1);
          padding: 1px 4px;
          border-radius: 4px;
        }
        /* Style for existing iframe if any */
        .prose iframe {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 1.5rem;
          margin: 2rem 0;
          background: #000;
        }
      `}</style>
    </div>
  );
}
