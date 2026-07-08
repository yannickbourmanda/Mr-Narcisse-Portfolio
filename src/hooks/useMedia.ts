import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CloudinaryMedia } from '../services/cloudinary';

export function useMedia() {
  const [media, setMedia] = useState<CloudinaryMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const files: CloudinaryMedia[] = [];
      snapshot.forEach((doc) => {
        files.push({ id: doc.id, ...doc.data() } as CloudinaryMedia);
      });
      setMedia(files);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching media:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { media, loading };
}
