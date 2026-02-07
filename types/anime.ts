export type Anime = {
  mal_id: number;
  url?: string;
  images?: {
    jpg?: { image_url?: string; large_image_url?: string };
    webp?: { image_url?: string; large_image_url?: string };
  } & Record<string, { image_url?: string }>;
  title: string;
  synopsis?: string;
  score?: number | null;
  episodes?: number | null;
  status?: string;
  genres?: { mal_id: number; name: string }[];
  year?: number | null;
  trailer?: { url?: string; embed_url?: string };
};
