import { useState } from 'react';
import Image from 'next/image';
import { Send, MessageSquare, Star, MessageCircle, AlertCircle, Sparkles, Trash2, X } from 'lucide-react';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import type { Review } from '../types/review';
import ReviewCard from './ReviewCard';

interface CommentSectionProps {
  animeId: string;
  reviews?: Review[];
  loadingReviews?: boolean;
  reviewsError?: unknown;
}

export default function CommentSection({ 
  animeId, 
  reviews = [], 
  loadingReviews = false, 
  reviewsError = null 
}: CommentSectionProps) {
  const { comments, loading: loadingComments, error: commentsError, addComment, deleteComment, averageRating } = useComments(animeId);
  const { user } = useAuth();
  const router = useRouter();
  
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || rating < 1 || !user || isSubmitting) return;

    setIsSubmitting(true);
    const success = await addComment(text, rating);
    if (success) {
      setText('');
      setRating(0);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteComment(id);
    if (success) {
      setDeletingId(null);
    }
  };

  const hasAnyContent = comments.length > 0 || reviews.length > 0;
  const showNoContentPlaceholder = !loadingComments && !loadingReviews && !hasAnyContent && !commentsError && !reviewsError;

  return (
    <div className="bg-gray-900/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden mt-10 shadow-2xl animate-fade-in mb-10">
      {/* --- SECTION HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 sm:px-8 py-8 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent border border-accent/20 shadow-inner group">
            <MessageSquare className="w-6 h-6 fill-current transition-transform group-hover:scale-110" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Community Hub</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5">Discussion</span>
              <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5">Reviews</span>
            </div>
          </div>
        </div>
        
        {/* Average Score Display */}
        {comments.length > 0 && (
          <div className="flex items-center gap-6 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-3 shadow-xl backdrop-blur-md animate-slide-up">
            <div className="text-center border-r border-white/10 pr-6">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">User Score</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-white">{averageRating.toFixed(1)}</span>
                <Star className="w-5 h-5 text-yellow-500 fill-current animate-pulse" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                <span className="w-20">Comments</span>
                <span className="text-white bg-accent/20 px-2 py-0.5 rounded-lg border border-accent/20">{comments.length}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                <span className="w-20">MAL Reviews</span>
                <span className="text-white bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">{reviews.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8 space-y-12">
        
        {/* --- USER COMMENTS SECTION --- */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} className="text-accent animate-spin-slow" />
              <h3 className="text-base font-black text-white uppercase tracking-wider">Fan Reviews & Discussion</h3>
            </div>
          </div>

          {/* Comment Input */}
          {user ? (
            <form onSubmit={handleSubmit} className="relative space-y-4 bg-white/5 border border-white/10 p-6 rounded-[32px] focus-within:border-accent/40 focus-within:bg-white/[0.07] transition-all group shadow-inner">
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-white/5 pb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-800 border border-white/10 relative shadow-xl">
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt={user.displayName || 'User'} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-gray-500 text-xl capitalize bg-gradient-to-br from-gray-800 to-gray-900">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Your Rating (Required)</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[...Array(10)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseEnter={() => setHoveredRating(i + 1)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(i + 1)}
                        className="relative group/star transition-all duration-200 active:scale-75"
                      >
                        <Star 
                          className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 ${
                            (hoveredRating || rating) >= i + 1 
                              ? 'text-yellow-500 fill-current drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] scale-110' 
                              : 'text-gray-700 hover:text-gray-500'
                          }`}
                        />
                        {rating === i + 1 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
                        )}
                      </button>
                    ))}
                    <span className={`ml-3 text-lg font-black transition-all ${rating > 0 ? 'text-white scale-110' : 'text-gray-700'}`}>
                      {rating > 0 ? `${rating}/10` : '—/10'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 w-full relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What did you think of this series? (Share your thoughts...)"
                  className="w-full bg-transparent border-none rounded-xl py-2 text-[16px] text-gray-200 placeholder-gray-600 focus:outline-none transition-all resize-none min-h-[100px]"
                  maxLength={500}
                />
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`h-1 rounded-full transition-all duration-500 ${text.length > 450 ? 'w-20 bg-red-500' : 'w-12 bg-accent/40'}`} style={{ width: `${(text.length / 500) * 100}%` }} />
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{text.length} / 500</span>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!text.trim() || rating < 1 || isSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-accent hover:bg-accent/90 disabled:bg-gray-800 disabled:text-gray-700 text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-accent/20 active:scale-95 group overflow-hidden relative"
                  >
                    <span className="relative z-10">Post Review</span>
                    <Send className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    {isSubmitting && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-[40px] p-10 text-center backdrop-blur-md shadow-2xl relative overflow-hidden group/login">
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover/login:opacity-100 transition-opacity duration-700" />
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner group-hover/login:rotate-12 transition-transform">
                <AlertCircle className="w-8 h-8 text-white/40" />
              </div>
              <h4 className="text-2xl font-black text-white mb-2 tracking-tight">Share Your Opinion</h4>
              <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto font-medium leading-relaxed font-outfit">Join thousands of fans and leave your own 10-star rating!</p>
              <button
                onClick={() => router.push('/login')}
                className="px-10 py-3.5 bg-accent hover:bg-accent/90 text-white font-black rounded-2xl transition-all shadow-2xl shadow-accent/40 text-sm active:scale-95 hover:tracking-widest"
              >
                Log In to Review
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-8">
            {commentsError ? (
               <div className="flex items-center gap-4 text-red-400 text-sm p-6 bg-red-500/10 rounded-3xl border border-red-500/20 shadow-lg">
                 <AlertCircle size={24} className="shrink-0" />
                 <p className="font-bold">Failed to load the conversation from our database. Please refresh.</p>
               </div>
            ) : loadingComments ? (
               <div className="space-y-8">
                 {[1, 2].map(i => (
                    <div key={i} className="flex gap-6 animate-pulse">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 shrink-0" />
                      <div className="flex-1 space-y-4 py-1">
                        <div className="h-5 bg-white/10 rounded-lg w-1/4" />
                        <div className="h-24 bg-white/5 rounded-[32px] w-full" />
                      </div>
                    </div>
                 ))}
               </div>
            ) : comments.length === 0 ? (
               <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01] animate-fade-in group/empty">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover/empty:scale-110 transition-transform">
                   <MessageCircle className="text-gray-700 w-8 h-8" />
                 </div>
                 <p className="text-gray-600 text-sm font-black uppercase tracking-widest">No fan reviews yet</p>
               </div>
            ) : (
               <div className="space-y-8 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
                 {comments.map((comment) => (
                   <div key={comment.id} className="flex gap-4 sm:gap-6 animate-fade-in group">
                     <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[20px] overflow-hidden shrink-0 bg-gray-800 border-2 border-white/5 relative shadow-2xl group-hover:border-accent/40 transition-all duration-500 group-hover:-translate-y-1">
                       {comment.userPhoto ? (
                         <Image src={comment.userPhoto} alt={comment.userName} fill className="object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center font-black text-gray-500 text-xl capitalize bg-gradient-to-br from-gray-800 to-gray-900 leading-none">
                            {comment.userName?.charAt(0) || '?'}
                         </div>
                       )}
                     </div>
                     <div className="flex-1 relative">
                       <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-5 sm:p-7 group-hover:bg-white/[0.06] group-hover:border-white/20 transition-all duration-500 shadow-sm relative overflow-hidden">
                         
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                           <div className="flex items-center gap-3">
                             <span className="font-black text-gray-100 text-sm sm:text-lg tracking-tight">{comment.userName}</span>
                             <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                               <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                               <span className="text-xs font-black text-yellow-500">{comment.rating}/10</span>
                             </div>
                           </div>
                           <div className="flex items-center gap-3">
                             <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5 shadow-inner">
                               {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                             </span>
                             
                             {user?.uid === comment.userId && (
                               <div className="relative">
                                 {deletingId === comment.id ? (
                                   <div className="flex items-center gap-2 animate-slide-left">
                                     <button onClick={() => handleDelete(comment.id)} className="p-1 px-3 bg-red-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-red-600 transition-colors">Confirm</button>
                                     <button onClick={() => setDeletingId(null)} className="p-1 bg-white/10 text-gray-400 rounded-lg hover:bg-white/20"><X size={14} /></button>
                                   </div>
                                 ) : (
                                   <button 
                                     onClick={() => setDeletingId(comment.id)}
                                     className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                     title="Delete Review"
                                   >
                                     <Trash2 size={16} />
                                   </button>
                                 )}
                               </div>
                             )}
                           </div>
                         </div>
                         
                         <p className="text-gray-300 text-[16px] leading-relaxed whitespace-pre-wrap font-medium">{comment.text}</p>
                       </div>
                       
                       {/* Subtle connection line for visual flow */}
                       <div className="absolute -left-6 top-14 bottom-0 w-[2px] bg-gradient-to-b from-white/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </section>

        {/* --- COMMUNITY REVIEWS SECTION --- */}
        <section className="space-y-8 pt-8 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Star size={18} className="text-yellow-500 stroke-[3px]" />
              <h3 className="text-base font-black text-white uppercase tracking-wider">MAL Community Reviews</h3>
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent ml-6" />
          </div>

          {reviewsError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-red-950/10 rounded-[40px] border border-red-500/20 group/rev-error">
              <div className="relative w-36 h-36 mb-4 transition-transform duration-500 group-hover/rev-error:scale-105">
                <Image src="/images/comment_error.png" alt="Error" fill className="object-contain opacity-70" unoptimized />
              </div>
              <p className="text-red-400 font-black text-xl mb-1 tracking-tight">Sync failed</p>
              <p className="text-red-500/60 text-xs font-bold bg-red-500/5 px-6 py-2 rounded-full border border-red-500/10 inline-block uppercase tracking-widest">
                API Error: {(reviewsError as Error).message || '404 NOT FOUND'}
              </p>
            </div>
          ) : loadingReviews ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((_, i) => (
                <div key={i} className="h-64 bg-white/5 rounded-[40px] animate-pulse border border-white/10" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
             null
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              {reviews.map((r: Review) => (
                <ReviewCard key={r.mal_id || r.date} review={r} />
              ))}
            </div>
          )}
        </section>

        {/* --- SHARED "EMPTY STATE" PLACEHOLDER --- */}
        {showNoContentPlaceholder && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/[0.02] rounded-[60px] border border-white/5 my-4 group/no-content transition-all hover:bg-white/[0.04] relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative w-72 h-72 mb-8 transition-transform duration-1000 ease-out group-hover/no-content:scale-110 pointer-events-none">
              <Image 
                src="/images/reviews_not_found.png" 
                alt="No content" 
                fill 
                className="object-contain drop-shadow-[0_30px_80px_rgba(0,0,0,0.7)]" 
                unoptimized 
              />
            </div>
            <div className="relative z-10 px-10 animate-fade-in-up">
              <h4 className="text-white font-black text-3xl mb-3 tracking-tighter">Silence in the universe</h4>
              <p className="text-gray-500 text-base font-medium max-w-sm mx-auto leading-relaxed">
                This series hasn&apos;t been reviewed yet. Be the first to break the silence and share your 10-star rating!
              </p>
            </div>
            
            {/* Added a subtle decorative element */}
            <div className="absolute bottom-10 right-10 opacity-20 transition-transform group-hover/no-content:rotate-45 duration-1000">
              <Sparkles size={40} className="text-accent" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
