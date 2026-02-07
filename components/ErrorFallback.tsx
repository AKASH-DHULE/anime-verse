import React from 'react';
import Link from 'next/link';

interface ErrorFallbackProps {
  error: Error | string;
  resetError?: () => void;
  title?: string;
}

/**
 * Fallback UI for when anime data cannot be loaded
 * Shows helpful message and navigation options
 */
export default function ErrorFallback({ error, resetError, title = 'Anime Not Found' }: ErrorFallbackProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className="max-w-6xl mx-auto mt-12 px-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 md:p-12 text-center">
        {/* Error Icon */}
        <div className="mb-6 text-6xl">❌</div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h1>

        {/* Error Message */}
        <p className="text-gray-400 mb-2 max-w-md mx-auto">{errorMessage}</p>

        {/* Additional Context */}
        <p className="text-gray-500 text-sm mb-8">
          This anime may not exist in our database or there was an issue loading it.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {resetError && (
            <button
              onClick={resetError}
              className="px-6 py-3 bg-accent text-white font-bold rounded-lg hover:bg-accent/90 transition-colors">
              Try Again
            </button>
          )}

          <Link
            href="/"
            className="px-6 py-3 border-2 border-gray-700 text-gray-200 font-bold rounded-lg hover:border-gray-600 hover:bg-gray-800 transition-colors">
            Back to Home
          </Link>

          <Link
            href="/search"
            className="px-6 py-3 border-2 border-accent text-accent font-bold rounded-lg hover:bg-accent/10 transition-colors">
            Search Anime
          </Link>
        </div>
      </div>
    </div>
  );
}
