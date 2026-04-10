export type NewsArticle = {
  id: string; // Unique slug for internal routing
  url: string;
  title: string;
  date: string;
  author_username: string;
  author_url?: string;
  forum_url?: string;
  images?: {
    jpg?: { image_url: string };
  };
  image?: string; // Unified image field for RSS
  comments?: number;
  excerpt: string;
  content?: string; // Full HTML content from RSS
  anime_id?: number; 
  anime_title?: string;
  categories?: string[];
};

export type PromoItem = {
  entry: {
    mal_id: number;
    url: string;
    images: {
      webp: { image_url: string; large_image_url: string };
      jpg: { image_url: string; large_image_url: string };
    };
    title: string;
  };
  trailer: {
    youtube_id: string;
    url: string;
    embed_url: string;
    images: {
      image_url: string;
      small_image_url: string;
      medium_image_url: string;
      large_image_url: string;
      maximum_image_url: string;
    };
  };
};

export type JikanNewsResponse = {
  data: NewsArticle[];
};

export type JikanPromoResponse = {
  data: PromoItem[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
  };
};
