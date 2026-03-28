import Link from 'next/link';
import { useRouter } from 'next/router';
import { User, Sparkles } from 'lucide-react';

export default function Header() {
  const router = useRouter();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Search', href: '/search' },
    { 
      name: 'AI Discover', 
      href: '/discover', 
      icon: <Sparkles className="w-3.5 h-3.5" />, 
      isSpecial: true 
    },
    { name: 'Favorites', href: '/favorites' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-black/60 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-accent to-blue-600 rounded-xl font-black text-xl shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
              A
            </div>
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">
            Anime<span className="text-accent">Verse</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1.5 bg-gray-900/40 border border-gray-800/50 rounded-2xl backdrop-blur-sm">
          {navLinks.map((link) => {
            const isActive = router.pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5
                  ${isActive 
                    ? 'bg-accent text-white shadow-lg shadow-accent/25' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }
                  ${link.isSpecial && !isActive ? 'text-accent hover:bg-accent/10' : ''}
                `}
              >
                {link.icon && <span>{link.icon}</span>}
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile & Mobile Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center justify-center p-2 rounded-xl bg-gray-900/60 border border-gray-800 cursor-pointer hover:border-accent/50 hover:bg-gray-800 transition-all group">
             <User className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" />
          </div>
          
          <button className="md:hidden p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>

      </div>
    </header>
  );
}

