export type Anime = {
  mal_id: number;
  url?: string;
  images?: {
    jpg?: { image_url?: string; large_image_url?: string };
    webp?: { image_url?: string; large_image_url?: string };
  } & Record<string, { image_url?: string }>;
  title: string;
  title_english?: string;
  synopsis?: string;
  score?: number | null;
  scored_by?: number | null;
  rank?: number | null;
  popularity?: number | null;
  episodes?: number | null;
  duration?: string;
  status?: string;
  type?: string;
  source?: string;
  rating?: string;
  season?: string;
  year?: number | null;
  genres?: { mal_id: number; name: string }[];
  studios?: { mal_id: number; type: string; name: string; url: string }[];
  trailer?: { url?: string; embed_url?: string; youtube_id?: string };
};
