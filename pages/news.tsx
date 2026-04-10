import React from 'react';
import { Newspaper, Play, TrendingUp, Sparkles, Ghost, ArrowRight } from 'lucide-react';
import useNews from '../hooks/useNews';
import usePromos from '../hooks/usePromos';
import NewsCard from '../components/NewsCard';
import PromoCard from '../components/PromoCard';
import ErrorFallback from '../components/ErrorFallback';

export default function NewsPage() {
  const { data: news = [], isLoading: loadingNews, error: newsError } = useNews(20);
  const { data: promos = [], isLoading: loadingPromos, error: promoError } = usePromos(6);

  const featuredNews = Array.isArray(news) ? news.slice(0, 5) : [];
  const regularNews = Array.isArray(news) ? news.slice(5) : [];

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Background radial decorations for premium look */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none -mr-48 -mt-24"></div>
      <div className="absolute top-[800px] left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none -ml-64"></div>

      <div className="max-w-6xl mx-auto relative z-10 px-4">
        {/* Page Header */}
        <section className="pt-24 sm:pt-28 pb-8 sm:pb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="p-2 sm:p-3 bg-accent/10 rounded-2xl relative group">
              <div className="absolute inset-0 bg-accent/20 blur-xl group-hover:bg-accent/30 transition-colors rounded-2xl"></div>
              <Newspaper className="relative w-6 h-6 sm:w-8 sm:h-8 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
                Anime<span className="text-accent underline decoration-4 underline-offset-8">Intel</span>
              </h1>
              <div className="w-16 sm:w-24 h-1 sm:h-1.5 bg-accent rounded-full mt-2"></div>
            </div>
          </div>
          <p className="text-gray-400 text-sm sm:text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
            Daily dispatches from the frontlines of Japanese animation. 
            Trailers, announcements, and deep dives.
          </p>
        </section>

        {/* Featured News Section - Horizontal Scroll or Large Cards */}
        <section className="relative z-20 mb-16 sm:mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
           <div className="flex items-center gap-2 mb-6 sm:mb-8 uppercase tracking-[0.3em] font-black text-[10px] sm:text-xs text-gray-500">
             <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
             <span>Trending SitRep</span>
           </div>

           {newsError ? (
             <ErrorFallback 
               title="Failed to Load Trending News"
               error={newsError}
               className="mt-0"
             />
           ) : loadingNews ? (
             <div className="h-[300px] sm:h-[400px] bg-gray-900/20 animate-pulse rounded-[2rem] border border-gray-800 flex items-center justify-center">
               <div className="flex flex-col items-center gap-4 text-gray-600">
                 <Newspaper className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
                 <p className="font-bold uppercase tracking-widest text-[10px]">Scanning Frequencies...</p>
               </div>
             </div>
           ) : news.length > 0 ? (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
                {/* Main Featured card */}
                <div className="lg:col-span-1 lg:sticky lg:top-28">
                   <NewsCard news={featuredNews[0]} featured />
                </div>
                {/* secondary featured items list */}
                <div className="space-y-4 sm:space-y-6">
                   {featuredNews.slice(1, 4).map((item) => (
                     <NewsCard key={item.url} news={item} />
                   ))}
                </div>
             </div>
           ) : (
             <div className="py-20 text-center bg-gray-900/10 border border-dashed border-gray-800 rounded-[2rem]">
               <Ghost className="w-12 h-12 mx-auto mb-4 text-gray-700" />
               <p className="text-gray-500 font-bold uppercase tracking-widest">No news data received.</p>
             </div>
           )}
        </section>

        {!promoError && (
          <section className="relative z-10 mb-16 sm:mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="flex items-center justify-between mb-8 sm:mb-10 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                 <Play className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 fill-current" />
                 <h2 className="text-xl sm:text-2xl md:text-3xl font-black italic uppercase tracking-tighter">New Transmission (PVs)</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {loadingPromos ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-video bg-gray-900/40 animate-pulse rounded-2xl border border-gray-800"></div>
                ))
              ) : promos.map((promo) => (
                <PromoCard key={promo.trailer.youtube_id || promo.entry.mal_id} promo={promo} />
              ))}
            </div>
          </section>
        )}

        {/* Regular News Feed */}
        {!newsError && news.length > 0 && (
          <section className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <div className="flex items-center gap-3 mb-8 sm:mb-10 pb-4 border-b border-white/5">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Latest Dispatches</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {loadingNews ? (
                Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-64 bg-gray-900/40 animate-pulse rounded-2xl border border-gray-800"></div>
                ))
              ) : regularNews.map((item) => (
                <NewsCard key={item.url} news={item} />
              ))}
            </div>

            <div className="mt-16 sm:mt-20 text-center">
               <button className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gray-950 border border-white/5 hover:border-accent/40 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-sm transition-all overflow-hidden active:scale-95 shadow-xl">
                 <span className="relative z-10 flex items-center gap-2">
                    Access Archive <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </span>
                 <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
