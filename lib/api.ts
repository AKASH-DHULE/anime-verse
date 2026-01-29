import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.jikan.moe/v4',
  timeout: 10000
});

export function parseApiError(err: unknown): { message: string; code?: number } {
  // Unified error messages for UI
  // Network errors
  if (!axios.isAxiosError(err)) {
    return { message: 'Network issue. Please check your internet connection and try again.' };
  }

  if (!err.response) {
    return { message: 'Network issue. Please check your internet connection and try again.' };
  }

  if (err.response.status === 429) {
    return { message: 'Too many requests. Please try again later.', code: 429 };
  }

  return { message: err.response.data?.message || 'An error occurred. Please try again.' };
}

export default api;
