import { useState } from 'react';
import type { Review } from '../types/review';

export default function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const text: string = (review?.content as string) || (review?.review as string) || '';

  const formattedDate = (() => {
    if (!review.date) return '';
    try {
      return new Date(review.date).toLocaleDateString();
    } catch {
      return review.date || '';
    }
  })();

  return (
    <div className="bg-gray-900 p-4 rounded">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{review.user?.username || 'Anonymous'}</div>
          <div className="text-sm text-gray-400">{formattedDate}</div>
        </div>
        <div className="text-sm">{review.score ? `⭐ ${review.score}` : 'N/A'}</div>
      </div>

      <div className="mt-3 text-gray-300">
        {expanded ? text : text.length > 400 ? text.slice(0, 400) + '...' : text}
      </div>

      {text.length > 400 && (
        <div className="mt-2">
          <button className="text-sm text-accent" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Show less' : 'Read more'}
          </button>
        </div>
      )}
    </div>
  );
}
