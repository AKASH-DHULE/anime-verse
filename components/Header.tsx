import Link from 'next/link';
import { useRouter } from 'next/router';
import { Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="max-w-7xl mx-auto flex items-center justify-between px-3.5 sm:px-6 lg:px-8 py-4">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-accent to-blue-600 rounded-xl font-black text-xl shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
              A
            </div>
          </div>
          <span className="font-bold text-base sm:text-xl tracking-tight">
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

        {/* Mobile Actions */}
        <div className="flex items-center gap-3">
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-gray-900/60 border border-gray-800 text-gray-400 hover:bg-gray-800 transition-colors"
          >
             {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-gray-950/95 border-b border-gray-800/50 backdrop-blur-xl animate-in slide-in-from-top-4 fade-in duration-200">
          <nav className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => {
              const isActive = router.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    px-4 py-3 rounded-xl font-bold flex items-center gap-2
                    ${isActive 
                      ? 'bg-accent/10 text-accent border border-accent/20' 
                      : 'text-gray-300 hover:bg-gray-900 border border-transparent'
                    }
                  `}
                >
                  {link.icon && <span>{link.icon}</span>}
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

