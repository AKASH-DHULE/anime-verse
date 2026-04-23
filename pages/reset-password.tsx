import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Lock, AlertCircle, Sparkles, Cat, Heart, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getAuthErrorMessage } from '../lib/authErrors';

export default function ResetPassword() {
  const router = useRouter();
  const { oobCode } = router.query;

  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    
    if (!oobCode || typeof oobCode !== 'string') {
      setError('Invalid or missing password reset link. Please request a new one.');
      setIsVerifying(false);
      return;
    }

    const verifyCode = async () => {
      try {
        if (!auth) return;
        const emailAddress = await verifyPasswordResetCode(auth, oobCode);
        setEmail(emailAddress);
      } catch (err: unknown) {
        setError('This password reset link is invalid or has expired.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyCode();
  }, [router.isReady, oobCode]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode || typeof oobCode !== 'string' || !auth) return;
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorCode = (err as { code?: string }).code || '';
        setError(getAuthErrorMessage(errorCode) || 'Failed to reset password.');
      } else {
        setError('Failed to reset password.');
      }
    } finally {
      setLoading(false);
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">RESET PASSWORD</span> <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              {email ? `Resetting password for ${email}` : 'Create a new password for your account.'}
            </p>
          </div>

          {error && (
            <div key={error} className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-500 animate-in fade-in slide-in-from-top-2 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {success ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex flex-col items-center justify-center p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
                <h3 className="text-xl font-bold text-white mb-2">Password Updated!</h3>
                <p className="text-gray-400 text-sm">Your password has been successfully reset. You can now login with your new password.</p>
              </div>
              <Link href="/login" className="w-full relative group overflow-hidden rounded-xl p-[1px] transform transition-all active:scale-95 block">
                <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-70 group-hover:opacity-100 transition-opacity blur-sm"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-100"></span>
                <div className="relative bg-black/50 backdrop-blur-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all group-hover:bg-transparent">
                  <span className="font-bold tracking-wide text-white">Go to Login</span>
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </Link>
            </div>
          ) : isVerifying ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <p className="text-gray-400 font-medium animate-pulse">Verifying link...</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4 sm:space-y-5">
              {!error || email ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-pink-500 transition-colors">
                        <Lock className="w-5 h-5 text-gray-500" />
                      </div>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-gray-950/50 border border-gray-800 focus:border-pink-500 focus:ring-pink-500 rounded-xl py-3 pl-11 pr-12 text-white placeholder-gray-600 transition-all outline-none"
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
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Confirm Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-purple-500 transition-colors">
                        <Lock className="w-5 h-5 text-gray-500" />
                      </div>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-gray-950/50 border border-gray-800 focus:border-purple-500 focus:ring-purple-500 rounded-xl py-3 pl-11 pr-12 text-white placeholder-gray-600 transition-all outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || !newPassword || !confirmPassword}
                    className="w-full relative group overflow-hidden rounded-xl p-[1px] mt-6 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-70 group-hover:opacity-100 transition-opacity blur-sm"></span>
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-100"></span>
                    <div className="relative bg-black/50 backdrop-blur-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all group-hover:bg-transparent">
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <span className="font-bold tracking-wide text-white">Save New Password</span>
                      )}
                    </div>
                  </button>
                </>
              ) : null}

              {error && !email && (
                <div className="text-center pt-4">
                  <Link href="/login" className="text-purple-400 hover:text-pink-400 font-medium flex items-center justify-center gap-2 transition-colors">
                    Back to Login Page <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
