export type Comment = {
  id: string; // Document ID
  animeId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: number; // millisecond timestamp
};
