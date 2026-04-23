import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, Cat, Heart, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { getAuthErrorMessage } from '../lib/authErrors';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  // Handle Google Redirect Result
  useEffect(() => {
    if (!auth || !db || !router.isReady) return;
    
    const checkRedirect = async () => {
      // Re-verify for TypeScript narrowing
      if (!auth || !db) return;

      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setLoading(true);
          const userRef = doc(db, 'users', result.user.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              email: result.user.email,
              name: result.user.displayName,
              favorites: [],
              watchlist: []
            });
          }
          router.push('/favorites');
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          const errorCode = (err as { code?: string }).code || '';
          setError(getAuthErrorMessage(errorCode));
        }
      } finally {
        setLoading(false);
      }
    };

    checkRedirect();
  }, [router.isReady, router]);

  // If already logged in, redirect
  if (user) {
    router.push('/');
    return null;
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!email.trim()) errors.email = 'Please enter your email';
    if (!password) errors.password = 'Please enter your password';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push('/favorites');
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorCode = (err as { code?: string }).code || '';
        setError(getAuthErrorMessage(errorCode));
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !resetEmail.trim()) {
      setFormErrors({ email: 'Please enter your email address' });
      return;
    }

    setResetLoading(true);
    setError('');
    setResetSuccess('');

    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetSuccess('Password reset link sent! Please check your inbox.');
      setResetEmail('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorCode = (err as { code?: string }).code || '';
        setError(getAuthErrorMessage(errorCode));
      } else {
        setError('Failed to send reset email.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth || !db) return;
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      
      // Detect mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Redirect is better for mobile UX
        await signInWithRedirect(auth, provider);
      } else {
        // Popup is fine for desktop
        const result = await signInWithPopup(auth, provider);
        const userRef = doc(db, 'users', result.user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
           await setDoc(userRef, {
             email: result.user.email,
             name: result.user.displayName,
             favorites: [],
             watchlist: []
           });
        }
        router.push('/favorites');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorCode = (err as { code?: string }).code || '';
        setError(getAuthErrorMessage(errorCode));
      } else {
        setError('An unexpected error occurred during Google sign-in.');
      }
    } finally {
      if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 transition-transform duration-500 hover:scale-[1.01]">
        
        {/* Custom CSS Anime Sticker */}
        <div className="absolute -top-16 -right-5 w-28 h-28 md:w-32 md:h-32 animate-bounce flex items-center justify-center z-20 hover:scale-110 transition-transform" style={{ animationDuration: '3s' }}>
           <div className="w-full h-full bg-gradient-to-tr from-pink-500 to-purple-500 rounded-full flex flex-col items-center justify-center border-[3px] border-white shadow-[0_0_25px_rgba(236,72,153,0.6)] relative overflow-hidden transform rotate-12">
             <Cat className="w-12 h-12 text-white mb-1" />
             <span className="text-[10px] font-black tracking-widest text-white">KAWAII</span>
             <Sparkles className="w-5 h-5 text-yellow-300 absolute top-3 right-3 animate-pulse" />
             <Heart className="w-4 h-4 text-white absolute bottom-3 left-4 animate-pulse fill-white" />
           </div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(168,85,247,0.15)] animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 flex items-center justify-center gap-2">
              {isResetMode ? 'RESET' : 'WELCOME'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{isResetMode ? 'PASSWORD' : 'BACK'}</span> <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              {isResetMode 
                ? 'We will send you a reset link if the account exists.' 
                : 'Access your synced AnimeVerse collection.'}
            </p>
          </div>

          {error && (
            <div key={error} className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-500 animate-in fade-in slide-in-from-top-2 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {resetSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl flex items-center gap-3 text-green-500 animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{resetSuccess}</p>
            </div>
          )}

          {isResetMode ? (
            <form onSubmit={handleResetPassword} noValidate className="space-y-6">
              <div className="space-y-2">
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors`}>
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <input 
                    type="email" 
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                    }}
                    className={`w-full bg-gray-950/50 border ${formErrors.email ? 'border-red-500/50' : 'border-gray-800'} focus:border-purple-500 focus:ring-purple-500 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 transition-all outline-none`}
                    placeholder="Enter your email address"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-[10px] sm:text-xs font-bold text-red-500 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <button 
                  type="submit" 
                  disabled={resetLoading}
                  className="w-full relative group overflow-hidden rounded-xl p-[1px] transform transition-all active:scale-95"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-70 group-hover:opacity-100 transition-opacity blur-sm"></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-100"></span>
                  <div className="relative bg-black/50 backdrop-blur-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all group-hover:bg-transparent">
                    {resetLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <span className="font-bold tracking-wide">Send Reset Link</span>
                    )}
                  </div>
                </button>

                <button 
                  type="button" 
                  onClick={() => setIsResetMode(false)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} noValidate className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${formErrors.email ? 'text-red-500' : 'group-focus-within:text-purple-500'} transition-colors`}>
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                    }}
                    className={`w-full bg-gray-950/50 border ${formErrors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-gray-800 focus:border-purple-500 focus:ring-purple-500'} rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 transition-all outline-none`}
                    placeholder="otaku@animeverse.com"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-[10px] sm:text-xs font-bold text-red-500 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsResetMode(true);
                      setError('');
                    }}
                    className="text-[10px] sm:text-xs font-medium text-purple-400 hover:text-pink-400 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${formErrors.password ? 'text-red-500' : 'group-focus-within:text-pink-500'} transition-colors`}>
                    <Lock className="w-5 h-5 text-gray-500" />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                    }}
                    className={`w-full bg-gray-950/50 border ${formErrors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-gray-800 focus:border-pink-500 focus:ring-pink-500'} rounded-xl py-3 pl-11 pr-12 text-white placeholder-gray-600 transition-all outline-none`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-pink-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-[10px] sm:text-xs font-bold text-red-500 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.password}
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl p-[1px] mt-6 transform transition-all active:scale-95"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-70 group-hover:opacity-100 transition-opacity blur-sm"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-100"></span>
                <div className="relative bg-black/50 backdrop-blur-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all group-hover:bg-transparent">
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="font-bold tracking-wide">Login</span>
                      <LogIn className="w-5 h-5" />
                    </>
                  )}
                </div>
              </button>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900/80 text-gray-400">Or continue with</span>
              </div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full mt-6 bg-white/5 hover:bg-white/10 border border-white/10 transition-all rounded-xl py-3 px-4 flex flex-row items-center justify-center gap-3 active:scale-95 text-sm font-bold text-gray-200 hover:text-white group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Login with Google
            </button>
          </div>

          <div className="mt-8 text-center pt-2">
            <p className="text-gray-400 text-sm">
              New to AnimeVerse?{' '}
              <Link href="/signup" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 hover:opacity-80 transition-opacity">
                Sign Up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
