import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, onSnapshot, getDocs, collection, setDoc } from 'firebase/firestore';

export interface UserData {
  uid: string;
  email: string;
  role: 'admin' | 'pending_admin' | 'user';
  firstName?: string;
  lastName?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserDoc: () => void;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        unsubscribeUserDoc = onSnapshot(doc(db, 'users', currentUser.uid), async (docSnap) => {
          if (docSnap.exists()) {
            setUserData({ uid: currentUser.uid, ...docSnap.data() } as UserData);
          } else {
            // Si le document n'existe pas, on tente de le recréer
            // On vérifie s'il est le premier utilisateur, ou si c'est l'email principal
            try {
              
              const usersSnapshot = await getDocs(collection(db, 'users'));
              const isFirst = usersSnapshot.empty;
              
              if (isFirst || currentUser.email === 'yannick.detougou@aun.edu.ng') {
                const newUserData = {
                  email: currentUser.email,
                  role: 'admin',
                  firstName: currentUser.displayName?.split(' ')[0] || 'Admin',
                  lastName: currentUser.displayName?.split(' ')[1] || '',
                  createdAt: new Date().toISOString()
                };
                setUserData({ uid: currentUser.uid, ...newUserData } as UserData);
                await setDoc(doc(db, 'users', currentUser.uid), newUserData, { merge: true });
              } else {
                // Créer comme pending
                const newUserData = {
                  email: currentUser.email,
                  role: 'pending_admin',
                  createdAt: new Date().toISOString()
                };
                setUserData({ uid: currentUser.uid, ...newUserData } as UserData);
                await setDoc(doc(db, 'users', currentUser.uid), newUserData, { merge: true });
              }
            } catch(e) {
              console.error("Failed to auto-create user document", e);
              setUserData(null);
            }
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user data:", error);
          setUserData(null);
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  return { user, userData, loading, logout };
}

