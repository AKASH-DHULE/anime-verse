import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RefreshCcw, Home, Search } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error | string;
  resetError?: () => void;
  title?: string;
  className?: string; // Allow custom styling for smaller placements
}

export default function ErrorFallback({ 
  error, 
  resetError, 
  title = 'Something Went Wrong',
  className = "max-w-6xl mx-auto mt-12 px-4"
}: ErrorFallbackProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const isNetworkError = errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch');

  return (
    <div className={className}>
      <div className="relative overflow-hidden bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-white/5 p-8 md:p-12 text-center group">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-accent/20 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-pink-500/10 blur-[60px] rounded-full pointer-events-none"></div>

        {/* Anime Girl Sticker */}
        <div className="relative mb-6 inline-block">
          <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full scale-75 animate-pulse"></div>
          <Image 
            src="/images/error-sticker.png" 
            alt="Error illustration"
            width={180}
            height={180}
            className="relative z-10 drop-shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] animate-in zoom-in-50 duration-500 [mix-blend-mode:screen]"
            unoptimized
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
          {isNetworkError ? 'Network Connection Lost!' : title}
        </h1>

        {/* Error Message */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <p className="text-gray-400 font-medium max-w-md mx-auto line-clamp-2">
            {errorMessage}
          </p>
          <div className="h-px w-12 bg-white/10 rounded-full"></div>
          <p className="text-gray-500 text-sm italic">
            &quot;Sorry about that! I tried my best, but couldn&apos;t get the data.&quot;
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
          {resetError && (
            <button
              onClick={resetError}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-white font-bold rounded-2xl hover:bg-accent/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent/25">
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>
          )}

          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-gray-200 font-bold rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all">
            <Home className="w-4 h-4" />
            Home
          </Link>

          <Link
            href="/search"
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-gray-200 font-bold rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all">
            <Search className="w-4 h-4" />
            Find Another
          </Link>
        </div>
      </div>
    </div>
  );
}
