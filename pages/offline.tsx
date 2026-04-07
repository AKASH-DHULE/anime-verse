import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { Home, RefreshCw, WifiOff } from 'lucide-react';

export default function Offline() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <Head>
        <title>Offline | AnimeVerse</title>
      </Head>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-500/5 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Main Illustration */}
        <div className="relative mb-8 inline-block group">
          <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-700 animate-pulse" />
          <Image 
            src="/images/error-sticker.png" 
            alt="Offline anime sticker"
            width={280}
            height={280}
            className="relative z-10 mx-auto drop-shadow-[0_0_40px_rgba(var(--accent-rgb),0.5)] animate-float"
            unoptimized
          />
          <div className="absolute top-4 right-4 bg-red-500 p-4 rounded-3xl shadow-2xl animate-bounce">
            <WifiOff className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase italic bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
          Connection Lost!
        </h1>
        
        <p className="text-xl text-gray-400 mb-12 max-w-md mx-auto leading-relaxed">
          It looks like your internet headed to a different world (Isekai&apos;d). Please check your connection and try again!
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-3 px-10 py-5 bg-accent text-white font-black rounded-2xl hover:bg-accent/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-accent/25 w-full sm:w-auto uppercase tracking-widest text-sm"
          >
            <RefreshCw className="w-5 h-5" />
            Try Reconnecting
          </button>

          <Link 
            href="/"
            className="flex items-center gap-3 px-10 py-5 bg-white/5 border border-white/10 text-gray-200 font-black rounded-2xl hover:bg-white/10 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto uppercase tracking-widest text-sm"
          >
            <Home className="w-5 h-5" />
            Return Home
          </Link>
        </div>

        {/* Status indicator */}
        <div className="mt-16 flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-white/10 px" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">
            AnimeVerse Offline Engine v1.0
          </span>
          <div className="h-px w-12 bg-white/10" />
        </div>
      </div>

      <style jsx>{`
        .animate-float {
          animation: float 6s infinite ease-in-out;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
