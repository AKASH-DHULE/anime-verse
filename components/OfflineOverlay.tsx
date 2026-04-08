import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { WifiOff, RefreshCcw } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function OfflineOverlay() {
  const isOnline = useOnlineStatus();
  const [show, setShow] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
    } else {
      // Small delay to show "reconnected" state or just fade out
      const timer = setTimeout(() => setShow(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!show) return null;

  const handleRetry = () => {
    setIsReconnecting(true);
    setTimeout(() => {
      setIsReconnecting(false);
      if (navigator.onLine) {
        setShow(false);
      }
    }, 1500);
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-700 ${
      isOnline ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" />
      
      {/* Animated background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:1s]" />

      <div className="relative max-w-lg w-full mx-4 overflow-hidden bg-gray-900/40 border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl">
        {/* Glow behind sticker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/20 blur-[80px] rounded-full pointer-events-none" />

        {/* Sticker */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-accent/10 blur-xl rounded-full scale-110 animate-pulse" />
          <Image 
            src="/images/error-sticker.png" 
            alt="Offline anime sticker"
            width={200}
            height={200}
            className="relative z-10 mx-auto drop-shadow-[0_0_30px_rgba(var(--accent-rgb),0.4)] animate-bounce-slow"
            unoptimized
          />
          <div className="absolute -top-2 -right-2 bg-red-500 p-3 rounded-2xl shadow-lg animate-bounce [animation-delay:0.5s]">
            <WifiOff className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-2xl md:text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">
          Network Lost!
        </h2>
        <p className="text-gray-400 font-medium mb-10 max-w-[280px] mx-auto leading-relaxed">
          The connection broke, but don&apos;t panic! I&apos;m trying to get you back...
        </p>

        {/* Status indicator */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={handleRetry}
            disabled={isReconnecting}
            className="group relative flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw className={`w-5 h-5 ${isReconnecting ? 'animate-spin text-accent' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            {isReconnecting ? 'Reconnecting...' : 'Check Again'}
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">
              {isOnline ? 'Connected' : 'Offline Mode'}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}
