export type Anime = {
  mal_id: number;
  url?: string;
  images?: Record<string, { image_url: string }>;
  title: string;
  synopsis?: string;
  score?: number | null;
  episodes?: number | null;
  status?: string;
  genres?: { mal_id: number; name: string }[];
  year?: number | null;
};
