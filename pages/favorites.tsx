import { useUserData } from '../hooks/useUserData';
import AnimeCard from '../components/AnimeCard';
import { Heart, Eye, Ghost, Sparkles, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import type { NewsArticle } from '../types/news';

export default function Favorites() {
  const { user } = useAuth();
  const { favorites, watchlist, likedNews, loading } = useUserData();

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
        <Ghost className="w-16 h-16 text-gray-700 mb-6 animate-bounce" />
        <h1 className="text-3xl font-bold mb-4">Identify Yourself</h1>
        <p className="text-gray-400 mb-8 max-w-md">Connect to the AnimeVerse network to access your synced favorites and watchlist from anywhere.</p>
        <Link href="/login" className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 rounded-xl font-bold hover:opacity-90 transition">
          Initialize Link (Login)
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-[80vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none -mt-24"></div>
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-accent/5 blur-[150px] rounded-full pointer-events-none -mb-48"></div>

      <div className="max-w-6xl mx-auto relative z-10 px-4">
        {/* Header Section */}
        <section className="pt-24 pb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-3 bg-accent/10 rounded-2xl">
               <LayoutGrid className="w-8 h-8 text-accent" />
             </div>
             <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
               MY <span className="text-accent">COLLECTION</span>
             </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl">
            Everything you&apos;ve saved while exploring the AnimeVerse. Your favorites and watchlist are synced to your browser.
          </p>
        </section>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-gray-900/40 backdrop-blur-md border border-gray-800 p-4 sm:p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 rounded-xl">
                <Heart className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">FAVORITES</p>
                <p className="text-2xl font-bold">{favorites.length}</p>
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-gray-700" />
          </div>
          <div className="bg-gray-900/40 backdrop-blur-md border border-gray-800 p-4 sm:p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">WATCHLIST</p>
                <p className="text-2xl font-bold">{watchlist.length}</p>
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-gray-700" />
          </div>
        </div>

        {/* Liked News Section */}
        {likedNews.length > 0 && (
          <section className="mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
               <div className="relative">
                 <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                 <div className="absolute inset-0 bg-yellow-500/20 blur-lg"></div>
               </div>
              <h2 className="text-2xl font-bold uppercase tracking-wider">News Updates</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedNews.map((news: NewsArticle) => (
                <div key={news.id || news.url} className="group relative bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden hover:border-accent/50 transition-all duration-500">
                  <Link href={`/news/${news.id || ''}`} className="block aspect-video relative overflow-hidden">
                    <Image 
                      src={news.image || news.images?.jpg?.image_url || '/placeholder-news.jpg'} 
                      alt={news.title}
                      fill
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-accent/90 text-[10px] font-bold rounded uppercase tracking-tighter z-10">
                      News
                    </div>
                  </Link>
                  <div className="p-4">
                    <h3 className="font-bold line-clamp-2 mb-2 group-hover:text-accent transition-colors">
                      <Link href={`/news/${news.id || ''}`}>
                        {news.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">{new Date(news.date).toLocaleDateString()}</p>
                    <Link 
                      href={`/news/${news.id || ''}`} 
                      className="text-xs font-bold text-accent uppercase tracking-widest hover:underline"
                    >
                      Read Full Article
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Favorites Section */}
        <section className="mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
            <Heart className="w-6 h-6 text-rose-500" />
            <h2 className="text-2xl font-bold uppercase tracking-wider">My Favorites</h2>
          </div>
          
          {favorites.length === 0 ? (
            <div className="py-20 bg-gray-900/20 border border-dashed border-gray-800 rounded-3xl text-center">
              <Ghost className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-gray-700" />
              <p className="text-gray-400 font-medium px-4">No favorites yet. Go find some gems!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {favorites.map((a) => (
                <div key={a.mal_id} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-accent rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500"></div>
                  <AnimeCard anime={a} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Watchlist Section */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
            <Eye className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold uppercase tracking-wider">Watchlist</h2>
          </div>
          
          {watchlist.length === 0 ? (
            <div className="py-20 bg-gray-900/20 border border-dashed border-gray-800 rounded-3xl text-center">
              <Ghost className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-gray-700" />
              <p className="text-gray-400 font-medium px-4">Your watchlist is empty. Add something to watch later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {watchlist.map((a) => (
                <div key={a.mal_id} className="relative group">
                   <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500"></div>
                   <AnimeCard anime={a} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

