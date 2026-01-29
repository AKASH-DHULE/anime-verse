export type Review = {
  mal_id?: number;
  url?: string;
  type?: string;
  votes?: number;
  date?: string;
  review?: string;
  content?: string;
  user?: { username?: string };
  score?: number;
};
