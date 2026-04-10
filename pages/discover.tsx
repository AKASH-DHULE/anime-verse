import { useState } from 'react';
import Head from 'next/head';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import AnimeCard from '../components/AnimeCard';
import api from '../lib/api';
import type { Anime } from '../types/anime';

type Recommendation = {
  title: string;
  reason: string;
};

type RecommendedAnime = {
  recommendation: Recommendation;
  animeData: Anime | null;
};

export default function Discover() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<RecommendedAnime[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      // 1. Get recommendations from Groq AI (Llama 3.3 70B)
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('⚠️ AI rate limited. Please try again in a moment.');
        }
        throw new Error(data.error || 'Failed to get recommendations');
      }

      const recs: Recommendation[] = data.recommendations;
      const finalResults: RecommendedAnime[] = [];

      // 2. Fetch Jikan data sequentially to avoid rate limits
      for (const rec of recs) {
        try {
          const searchRes = await api.get('/anime', {
             params: { q: rec.title, limit: 3 } 
          });
          const fetchedAnimeData = searchRes.data.data;
          
          // Match closest title or just use first result
          const exactMatch = fetchedAnimeData.find((a: Anime) => 
            a.title.toLowerCase() === rec.title.toLowerCase() ||
            a.title_english?.toLowerCase() === rec.title.toLowerCase()
          );

          finalResults.push({
            recommendation: rec,
            animeData: exactMatch || fetchedAnimeData[0] || null,
          });
        } catch (jikanError) {
          console.error(`Failed to fetch info for ${rec.title}:`, jikanError);
          finalResults.push({
            recommendation: rec,
            animeData: null,
          });
        }
        // Wait 400ms to respect Jikan's rate limit
        await new Promise((r) => setTimeout(r, 400));
      }

      setResults(finalResults);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>AI Discover - AnimeVerse</title>
        <meta name="description" content="Discover new anime using AI based on your specific mood and taste!" />
      </Head>

      <div className="min-h-screen bg-background pb-16">
        {/* Hero Section */}
        <section className="pt-24 pb-12 px-4 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-accent/20 blur-[100px] rounded-full mt-[-100px] pointer-events-none" />
          
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h1 className="text-3xl md:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight">
              AI <span className="text-accent">Discover</span> ✨
            </h1>
            <p className="text-gray-400 text-lg md:text-xl mb-10">
              Tell me what you&apos;re in the mood for, and I&apos;ll find the perfect anime for you!
            </p>

            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-full p-1.5 md:p-2 shadow-2xl focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/50 transition-all z-10">
                <div className="pl-3 md:pl-4 pr-1 md:pr-2 text-gray-400">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. An epic isekai with..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-transparent outline-none py-2 md:py-3 text-base md:text-lg text-white placeholder-gray-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="bg-accent hover:bg-accent/90 text-white px-4 py-2 md:px-6 md:py-3 rounded-full font-semibold text-sm md:text-base flex items-center gap-1.5 md:gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                  <span className="hidden sm:inline">{loading ? 'Thinking...' : 'Recommend'}</span>
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
              <span className="text-gray-500">Try:</span>
              <button onClick={() => setPrompt('An overpowered main character who hides their true strength')} className="text-gray-400 hover:text-accent transition-colors">&quot;OP MC hides strength&quot;</button>
              <button onClick={() => setPrompt('A psychological thriller with mind-bending plot twists')} className="text-gray-400 hover:text-accent transition-colors">&quot;Mind-bending thriller&quot;</button>
              <button onClick={() => setPrompt('A cozy slice-of-life anime about food and friendship')} className="text-gray-400 hover:text-accent transition-colors">&quot;Cozy slice-of-life&quot;</button>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="max-w-6xl mx-auto px-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg text-center max-w-2xl mx-auto">
              {error}
            </div>
          )}

          {loading && (
            <div className="py-20 flex flex-col items-center justify-center text-accent animate-pulse">
              <Sparkles className="w-12 h-12 mb-4 animate-bounce" />
              <p className="text-xl font-medium">Summoning recommendations from the AnimeVerse...</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {results.map((result, idx) => (
                <div key={idx} className="flex flex-col gap-3 md:gap-4 bg-gray-900/40 p-4 md:p-5 rounded-xl border border-gray-800 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 150}ms` }}>
                  
                  {/* AI Reason Bubble */}
                  <div className="relative bg-gray-800 rounded-lg p-3 pt-6 md:p-4 md:pt-8 shrink-0">
                    <div className="absolute top-0 left-4 -translate-y-1/2 bg-accent text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-accent/20">
                      <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" /> AI Says
                    </div>
                    <p className="text-xs md:text-sm text-gray-300 italic">&quot;{result.recommendation.reason}&quot;</p>
                  </div>

                  {/* Anime Card or Fallback */}
                  <div className="flex-grow mt-2">
                    {result.animeData ? (
                      <AnimeCard anime={result.animeData} />
                    ) : (
                      <div className="bg-gray-800 w-full h-48 rounded flex flex-col items-center justify-center text-center p-4">
                        <span className="text-gray-500 mb-2">Anime not found on Jikan API</span>
                        <span className="font-semibold text-gray-300">{result.recommendation.title}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
