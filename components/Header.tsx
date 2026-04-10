import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Sparkles, Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, userProfile } = useAuth();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Search', href: '/search' },
    { 
      name: 'AI Discover', 
      href: '/discover', 
      icon: <Sparkles className="w-3.5 h-3.5" />, 
      isSpecial: true 
    },
    { name: 'News', href: '/news' },
    { name: 'Favorites', href: '/favorites' },
  ];

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const displayName = userProfile?.name || user?.displayName || 'Anime Fan';
  const displayPhoto = userProfile?.photoURL || user?.photoURL || '';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-black/90 backdrop-blur-xl transition-all duration-300">
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

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center gap-3 relative">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
                className="w-10 h-10 rounded-full bg-gray-800 border-2 border-accent overflow-hidden transition-transform hover:scale-105 shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center justify-center relative group"
                title="Profile"
              >
                {displayPhoto ? (
                  <div className="relative w-full h-full">
                    <Image 
                      src={displayPhoto} 
                      alt="Profile" 
                      fill 
                      className="object-cover" 
                      unoptimized={displayPhoto.startsWith('data:')}
                    />
                  </div>
                ) : (
                  <span className="text-sm font-bold text-accent">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Menu className="w-4 h-4 text-white" />
                </div>
              </button>
              
              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-gray-950/95 backdrop-blur-xl border border-gray-800/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="p-4 border-b border-gray-800/50 bg-gradient-to-b from-gray-900 to-transparent">
                    <p className="text-sm font-bold text-white truncate">{displayName}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-xl transition-colors">
                      <UserIcon className="w-4 h-4 text-pink-400" /> Edit Profile
                    </Link>
                    <Link href="/favorites" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-xl transition-colors">
                      <Sparkles className="w-4 h-4 text-purple-400" /> My Collection
                    </Link>
                    <div className="h-px bg-gray-800/60 my-1 mx-2"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/login" 
              className="w-10 h-10 rounded-full bg-gray-900/60 hover:bg-accent/20 border border-gray-800 hover:border-accent flex items-center justify-center transition-all group shadow-lg"
              title="Login"
            >
              <UserIcon className="w-5 h-5 text-gray-400 group-hover:text-accent" />
            </Link>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-3 md:hidden">
          {user ? (
            <Link 
              href="/profile" 
              className="w-9 h-9 rounded-full bg-gray-800 border-[1.5px] border-accent overflow-hidden shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center transition-transform active:scale-95"
            >
              {displayPhoto ? (
                <div className="relative w-full h-full">
                  <Image 
                    src={displayPhoto} 
                    alt="Profile" 
                    fill 
                    className="object-cover" 
                    unoptimized={displayPhoto.startsWith('data:')}
                  />
                </div>
              ) : (
                <span className="text-sm font-bold text-accent">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="w-9 h-9 rounded-full bg-gray-900/60 border border-gray-800 flex items-center justify-center text-gray-400 active:scale-95 transition-transform"
            >
              <UserIcon className="w-4 h-4" />
            </Link>
          )}

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-gray-900/60 border border-gray-800 text-gray-400 hover:bg-gray-800 transition-colors"
          >
             {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-gray-950/95 border-b border-gray-800/50 backdrop-blur-xl animate-in slide-in-from-top-4 fade-in duration-200 shadow-xl z-50">
          <nav className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => {
              const isActive = router.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    px-4 py-3 rounded-xl font-bold flex items-center gap-3
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
            
            {/* Logged in extra links for mobile */}
            {user && (
              <>
                <div className="h-px w-full bg-gray-800/50 my-2"></div>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl font-bold flex items-center gap-3 text-pink-400 hover:bg-gray-900 border border-transparent"
                >
                  <UserIcon className="w-4 h-4" /> Edit Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 rounded-xl font-bold flex items-center gap-3 text-red-500 hover:bg-red-500/10 border border-transparent text-left"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

