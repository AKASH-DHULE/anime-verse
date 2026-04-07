import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Comment } from '../types/comment';

export function useComments(animeId: string) {
  const { user, userProfile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || !animeId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'comments'),
      where('animeId', '==', animeId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          animeId: data.animeId,
          userId: data.userId,
          userName: data.userName,
          userPhoto: data.userPhoto,
          text: data.text,
          rating: data.rating || 0,
          createdAt: data.createdAt ? (data.createdAt as Timestamp).toMillis() : Date.now(),
        } as Comment;
      });
      
      // Sort in descending order (newest first)
      fetchedComments.sort((a, b) => b.createdAt - a.createdAt);
      
      setComments(fetchedComments);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching comments:', err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [animeId]);

  const addComment = async (text: string, rating: number) => {
    if (!user || !db || !text.trim() || rating < 1) return false;
    
    try {
      await addDoc(collection(db, 'comments'), {
        animeId,
        userId: user.uid,
        userName: userProfile?.name || user.displayName || 'Anonymous',
        userPhoto: userProfile?.photoURL || user.photoURL || '',
        text: text.trim(),
        rating,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      console.error('Error adding comment:', err);
      return false;
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user || !db) return false;
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      return true;
    } catch (err) {
      console.error('Error deleting comment:', err);
      return false;
    }
  };

  const averageRating = comments.length > 0
    ? comments.reduce((acc, curr) => acc + (curr.rating || 0), 0) / comments.length
    : 0;

  return { comments, loading, error, addComment, deleteComment, averageRating };
}
