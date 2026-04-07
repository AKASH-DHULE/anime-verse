import { useState } from 'react';
import type { Review } from '../types/review';
import { Quote, Star, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';

export default function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const text: string = (review?.content as string) || (review?.review as string) || '';

  const formattedDate = (() => {
    if (!review.date) return '';
    try {
      return new Date(review.date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return review.date || '';
    }
  })();

  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 shadow-xl overflow-hidden">
      {/* Decorative background icon */}
      <div className="absolute -top-4 -right-4 text-white/5 rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-6">
        <Quote size={80} />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent border border-accent/20">
              <User size={20} />
            </div>
            <div>
              <div className="font-bold text-gray-100 tracking-tight">{review.user?.username || 'Anonymous'}</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <Calendar size={12} />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          
          {review.score && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg self-start sm:self-center">
              <Star size={14} className="text-yellow-500 fill-current" />
              <span className="text-xs font-bold text-yellow-500">{review.score} / 10</span>
            </div>
          )}
        </div>

        <div className="mt-2 text-gray-300 text-[15px] leading-relaxed relative whitespace-pre-wrap">
          {expanded ? text : text.length > 300 ? text.slice(0, 300) + '...' : text}
        </div>

        {text.length > 300 && (
          <button 
            className="mt-4 flex items-center gap-1.5 text-sm font-bold text-accent hover:text-accent/80 transition-colors group/btn" 
            onClick={() => setExpanded(!expanded)}
          >
            <span>{expanded ? 'Show less' : 'Read full review'}</span>
            {expanded ? <ChevronUp size={16} className="transition-transform group-hover/btn:-translate-y-0.5" /> : <ChevronDown size={16} className="transition-transform group-hover/btn:translate-y-0.5" />}
          </button>
        )}
      </div>
    </div>
  );
}
