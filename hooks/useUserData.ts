import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Anime } from '../types/anime';

export function useUserData() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Anime[]>([]);
  const [watchlist, setWatchlist] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setFavorites([]);
      setWatchlist([]);
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFavorites(data.favorites || []);
        setWatchlist(data.watchlist || []);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleFavorite = async (anime: Anime) => {
    if (!user || !db) return false; // Not logged in
    const docRef = doc(db, 'users', user.uid);
    const isFav = favorites.some(a => a.mal_id === anime.mal_id);
    
    try {
      // Create document if it doesn't exist
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
         await setDoc(docRef, { favorites: [], watchlist: [] });
      }

      if (isFav) {
        // Find exact anime object to remove (firestore arrayRemove requires exact match, 
        // so it's safer to filter and set the new array, but arrayRemove might work if the object is exactly the same)
        // A safer approach:
        const newFavs = favorites.filter(a => a.mal_id !== anime.mal_id);
        await updateDoc(docRef, { favorites: newFavs });
      } else {
        await updateDoc(docRef, { favorites: arrayUnion(anime) });
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const toggleWatchlist = async (anime: Anime) => {
    if (!user || !db) return false; // Not logged in
    const docRef = doc(db, 'users', user.uid);
    const isListed = watchlist.some(a => a.mal_id === anime.mal_id);
    
    try {
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
         await setDoc(docRef, { favorites: [], watchlist: [] });
      }

      if (isListed) {
        const newList = watchlist.filter(a => a.mal_id !== anime.mal_id);
        await updateDoc(docRef, { watchlist: newList });
      } else {
        await updateDoc(docRef, { watchlist: arrayUnion(anime) });
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return { favorites, watchlist, loading, toggleFavorite, toggleWatchlist };
}
