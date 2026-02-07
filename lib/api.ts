import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.jikan.moe/v4',
  timeout: 10000
});

/**
 * Parses API errors and returns user-friendly messages
 * Handles 404s gracefully for missing anime data
 */
export function parseApiError(err: unknown): { message: string; code?: number; isNotFound?: boolean } {
  // Network errors
  if (!axios.isAxiosError(err)) {
    return { message: 'Network issue. Please check your internet connection and try again.' };
  }

  if (!err.response) {
    return { message: 'Network issue. Please check your internet connection and try again.' };
  }

  // Handle 404 - anime not found in Jikan API
  if (err.response.status === 404) {
    return { 
      message: 'Anime not found. This anime may not exist in our database.', 
      code: 404,
      isNotFound: true 
    };
  }

  if (err.response.status === 429) {
    return { message: 'Too many requests. Please try again later.', code: 429 };
  }

  return { message: err.response.data?.message || 'An error occurred. Please try again.' };
}

export default api;
