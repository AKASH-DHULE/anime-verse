export type Comment = {
  id: string; // Document ID
  animeId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  rating: number; // 1-10
  createdAt: number; // millisecond timestamp
};
