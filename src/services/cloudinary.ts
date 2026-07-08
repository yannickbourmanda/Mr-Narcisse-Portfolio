import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, doc, deleteDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';

export interface CloudinaryMedia {
  id?: string;
  secure_url: string;
  public_id: string;
  asset_id: string;
  resource_type: string;
  width: number;
  height: number;
  duration?: number;
  format: string;
  bytes: number;
  createdAt: any;
  folder: string;
  name: string; // to keep original name
  // Legacy fields so the UI doesn't crash if it expects them
  url?: string;
  type?: string;
  size?: number;
}

export const uploadToCloudinary = async (
  file: File,
  folder: string = 'Media',
  onProgress?: (progress: number) => void
): Promise<CloudinaryMedia> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'portfolio_upload';
  
  if (!cloudName) {
    throw new Error("Cloudinary configuration is missing. Set VITE_CLOUDINARY_CLOUD_NAME in .env");
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  let cleanFolder = folder.replace(/^\/|\/$/g, '').trim() || 'Media';
  // Cloudinary doesn't like certain characters in folder names
  cleanFolder = cleanFolder.replace(/[?&#%<>\\ \:]/g, '_');
  formData.append('folder', cleanFolder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    
    xhr.onload = async () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          
          const mediaDoc: CloudinaryMedia = {
            secure_url: response.secure_url,
            public_id: response.public_id,
            asset_id: response.asset_id,
            resource_type: response.resource_type,
            width: response.width || 0,
            height: response.height || 0,
            duration: response.duration || 0,
            format: response.format || file.name.split('.').pop() || '',
            bytes: response.bytes || file.size,
            createdAt: serverTimestamp(),
            folder: cleanFolder,
            name: file.name,
            
            // Legacy fallbacks
            url: response.secure_url,
            type: response.resource_type === 'image' ? `image/${response.format}` : response.resource_type === 'video' ? `video/${response.format}` : `application/${response.format}`,
            size: response.bytes || file.size
          };
          
          const docRef = await addDoc(collection(db, 'media'), mediaDoc);
          resolve({ id: docRef.id, ...mediaDoc, createdAt: new Date() });
        } catch (err) {
          reject(err);
        }
      } else {
        try {
          const errResponse = JSON.parse(xhr.responseText);
          reject(new Error(`Cloudinary upload failed: ${errResponse.error?.message || xhr.statusText}`));
        } catch {
          reject(new Error(`Cloudinary upload failed: ${xhr.statusText}`));
        }
      }
    };
    
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
};

export const deleteCloudinaryMedia = async (id: string, publicId?: string) => {
  try {
    if (publicId) {
      try {
        await fetch('/api/cloudinary/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId })
        });
      } catch (e) {
        console.warn("Could not delete from Cloudinary server-side:", e);
      }
    }
    await deleteDoc(doc(db, 'media', id));
  } catch (error) {
    console.error('Error deleting media by id:', error);
  }
};

export const renameCloudinaryFolder = async (oldFolder: string, newFolder: string) => {
    // 1. Update all media documents in Firestore that have this folder
    const q = query(collection(db, 'media'), where('folder', '>=', oldFolder), where('folder', '<', oldFolder + '\uf8ff'));
    const snapshot = await getDocs(q);
    
    const updates = snapshot.docs.map(async (document) => {
        const data = document.data();
        if (data.folder === oldFolder || data.folder.startsWith(oldFolder + '/')) {
            const updatedFolder = data.folder.replace(oldFolder, newFolder);
            await updateDoc(doc(db, 'media', document.id), { folder: updatedFolder });
        }
    });
    
    await Promise.all(updates);
    
    // Note: Actually moving assets in Cloudinary requires Admin API which we do via our custom backend route if configured.
    try {
      await fetch('/api/cloudinary/rename-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldFolder, newFolder })
      });
    } catch(e) {
      console.warn("Could not rename folder on Cloudinary server-side:", e);
    }
};

export const deleteCloudinaryMediaByUrl = async (url: string) => {
  try {
    const q = query(collection(db, 'media'), where('secure_url', '==', url));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      for (const docSnapshot of snapshot.docs) {
        await deleteCloudinaryMedia(docSnapshot.id, docSnapshot.data().public_id);
      }
    } else {
      // Check legacy url
      const q2 = query(collection(db, 'media'), where('url', '==', url));
      const snap2 = await getDocs(q2);
      for (const d of snap2.docs) {
        await deleteCloudinaryMedia(d.id, d.data().public_id);
      }
    }
  } catch (error) {
    console.error('Error deleting image by url:', error);
  }
};
