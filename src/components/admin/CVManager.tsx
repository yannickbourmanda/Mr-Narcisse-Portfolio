import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Trash2, Download, Loader2, Eye } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'sonner';
import { CVModal } from '../CVModal';

export default function CVManager() {
  const [cv, setCv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCV();
  }, []);

  const fetchCV = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'cv'));
      if (docSnap.exists()) {
        setCv(docSnap.data());
      } else {
        setCv(null);
      }
    } catch (error) {
      console.error("Error fetching CV:", error);
      toast.error('Erreur lors du chargement du CV');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Seul le format PDF est autorisé');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 10 Mo');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Dynamic import
      const { uploadToCloudinary, deleteCloudinaryMediaByUrl } = await import('../../services/cloudinary');
      
      // If we have an existing CV, delete it from Cloudinary
      if (cv?.url) {
        await deleteCloudinaryMediaByUrl(cv.url).catch(err => console.warn("Failed to delete old CV", err));
      }

      // Upload to Cloudinary
      const result = await uploadToCloudinary(file, 'Documents/CV', setUploadProgress);
      
      const newCvData = {
        url: result.secure_url,
        publicId: result.public_id,
        filename: file.name,
        size: file.size,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'settings', 'cv'), newCvData);
      setCv(newCvData);
      toast.success('CV mis à jour avec succès');

    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || 'Erreur lors du téléchargement');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer le CV ?')) return;

    try {
      if (cv?.url) {
        const { deleteCloudinaryMediaByUrl } = await import('../../services/cloudinary');
        await deleteCloudinaryMediaByUrl(cv.url);
      }
      
      await setDoc(doc(db, 'settings', 'cv'), { deletedAt: new Date().toISOString() }, { merge: false });
      setCv(null);
      toast.success('CV supprimé avec succès');
    } catch (error) {
      console.error("Delete error:", error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('fr-FR');
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="w-full">
      

      <Card className="dark:bg-navy-dark dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-lg">Gestion du CV (PDF)</CardTitle>
        </CardHeader>
        <CardContent>
          {cv?.url ? (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/20 rounded-lg border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white line-clamp-1">{cv.filename || 'CV.pdf'}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {formatSize(cv.size)} • Ajouté le {formatDate(cv.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                  <Eye size={16} className="mr-2" /> Aperçu
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={cv.url} target="_blank" rel="noopener noreferrer" download="CV.pdf">
                    <Download size={16} className="mr-2" /> Télécharger
                  </a>
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={handleDelete}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-4 border-2 border-dashed rounded-lg border-slate-200 dark:border-white/10">
              <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Aucun CV n'est actuellement en ligne</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                Téléversez votre CV au format PDF pour qu'il soit disponible sur la page À propos.
              </p>
            </div>
          )}

          <div className="mt-6 border-t border-slate-200 dark:border-white/10 pt-6">
            <h4 className="font-medium text-slate-900 dark:text-white mb-4">
              {cv?.url ? 'Remplacer le CV' : 'Ajouter un CV'}
            </h4>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Téléversement... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    {cv?.url ? 'Remplacer le fichier PDF' : 'Sélectionner un fichier PDF'}
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Format: PDF uniquement. Taille max: 10 Mo.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {cv?.url && (
        <CVModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          cvUrl={cv.url} 
        />
      )}
    </div>
  );
}
