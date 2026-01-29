import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="px-4 md:px-8 lg:px-16">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
