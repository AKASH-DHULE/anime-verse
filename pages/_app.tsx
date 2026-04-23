import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OfflineOverlay from '../components/OfflineOverlay';
import MioAI from '../components/MioAI';
import NewsPopup from '../components/NewsPopup';
import useNews from '../hooks/useNews';
import { useState } from 'react';
import { AuthProvider } from '../context/AuthContext';
import NextTopLoader from 'nextjs-toploader';

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();

  const isHome = router.pathname === '/';

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NextTopLoader
          color="#ff2d7a"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #ff2d7a,0 0 5px #ff2d7a"
        />
        <div className="min-h-screen bg-black text-white selection:bg-accent/30 overflow-x-hidden">
          <OfflineOverlay />
          <Header />
          <main className="px-4 md:px-8 lg:px-16 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={router.asPath}
                initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <Component {...pageProps} />
              </motion.div>
            </AnimatePresence>
          </main>
          <Footer />
          <MioAI />
          <NewsPopupWrapper isHome={isHome} />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function NewsPopupWrapper({ isHome }: { isHome: boolean }) {
  const { data: news = [] } = useNews(5);
  if (!isHome) return null;
  return <NewsPopup newsItems={news} />;
}
