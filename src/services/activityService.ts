import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PLATFORM_CONFIG } from '../config/platform';

export type ActivityAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type ActivityResourceType = 'PROJECT' | 'ARTICLE' | 'MESSAGE' | 'SETTINGS';

export interface Activity {
  id?: string;
  action: ActivityAction;
  resourceType: ActivityResourceType;
  resourceName: string;
  timestamp: any;
  platformId: string;
}

export const logActivity = async (action: ActivityAction, resourceType: ActivityResourceType, resourceName: string) => {
  try {
    await addDoc(collection(db, 'activities'), {
      action,
      resourceType,
      resourceName,
      timestamp: serverTimestamp(),
      platformId: PLATFORM_CONFIG.id
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

export const subscribeToActivities = (
  callback: (activities: Activity[]) => void,
  maxResults: number = 50
) => {
  const q = query(
    collection(db, 'activities'),
    where('platformId', '==', PLATFORM_CONFIG.id)
  );

  return onSnapshot(q, (snapshot) => {
    let activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Activity[];
    
    // Sort on client side to avoid requiring composite indexes
    activities.sort((a, b) => {
      const timeA = a.timestamp?.toMillis() || 0;
      const timeB = b.timestamp?.toMillis() || 0;
      return timeB - timeA;
    });

    if (maxResults) {
      activities = activities.slice(0, maxResults);
    }

    callback(activities);
  });
};
