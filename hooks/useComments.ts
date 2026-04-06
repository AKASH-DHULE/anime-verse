import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
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

    // using only 'where' to avoid Firestore requiring a composite index for 'where' + 'orderBy'
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

  const addComment = async (text: string) => {
    if (!user || !db || !text.trim()) return false;
    
    try {
      await addDoc(collection(db, 'comments'), {
        animeId,
        userId: user.uid,
        userName: userProfile?.name || user.displayName || 'Anonymous',
        userPhoto: userProfile?.photoURL || user.photoURL || '',
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      console.error('Error adding comment:', err);
      return false;
    }
  };

  return { comments, loading, error, addComment };
}
