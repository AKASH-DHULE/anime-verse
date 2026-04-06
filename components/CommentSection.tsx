import { useState } from 'react';
import Image from 'next/image';
import { Send, MessageSquare } from 'lucide-react';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function CommentSection({ animeId }: { animeId: string }) {
  const { comments, loading, error, addComment } = useComments(animeId);
  const { user } = useAuth();
  const router = useRouter();
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    const success = await addComment(text);
    if (success) {
      setText('');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden mt-8">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/5">
        <MessageSquare className="w-5 h-5 text-accent" />
        <h2 className="text-base font-bold text-gray-100">User Comments</h2>
      </div>

      <div className="p-6">
        {/* Comment Input */}
        {user ? (
          <form onSubmit={handleSubmit} className="mb-8 relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-800 border border-white/10 relative">
              {user.photoURL ? (
                <Image src={user.photoURL} alt={user.displayName || 'User'} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 capitalize">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                </div>
              )}
            </div>
            
            <div className="flex-1 relative group">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment... (Be nice!)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all resize-none min-h-[80px]"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!text.trim() || isSubmitting}
                className="absolute bottom-3 right-3 p-2 bg-accent hover:bg-accent/80 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-accent/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-8 bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <h3 className="text-gray-300 font-semibold mb-2">Join the Conversation</h3>
            <p className="text-gray-500 text-sm mb-4">You need to be logged in to leave a comment.</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-accent hover:bg-accent/90 text-white font-bold rounded-lg transition-colors shadow-lg shadow-accent/20 text-sm inline-flex items-center justify-center"
            >
              Log In to Comment
            </button>
          </div>
        )}

        {/* Comments List */}
        {error ? (
           <div className="text-red-400 text-sm p-4 bg-red-500/10 rounded-xl border border-red-500/20">
             Failed to load comments.
           </div>
        ) : loading ? (
           <div className="space-y-4">
             {[1, 2].map(i => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-white/10 rounded w-1/4" />
                    <div className="h-3 bg-white/10 rounded w-3/4" />
                  </div>
                </div>
             ))}
           </div>
        ) : comments.length === 0 ? (
           <div className="text-center py-8 text-gray-500 text-sm">
             No comments yet. Be the first to start the discussion!
           </div>
        ) : (
           <div className="space-y-6">
             {comments.map((comment) => (
               <div key={comment.id} className="flex gap-4 animate-fade-in group">
                 <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-800 border border-white/10 relative">
                   {comment.userPhoto ? (
                     <Image src={comment.userPhoto} alt={comment.userName} fill className="object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 capitalize">
                                               {comment.userName?.charAt(0) || '?'}
                     </div>
                   )}
                 </div>
                 <div className="flex-1">
                   <div className="flex items-baseline gap-2 mb-1">
                     <span className="font-semibold text-gray-200 text-sm">{comment.userName}</span>
                     <span className="text-xs text-gray-500 flex items-center before:content-['•'] before:mx-1.5 before:text-gray-600">
                       {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                     </span>
                   </div>
                   <p className="text-gray-300 text-[15px] leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                 </div>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}
