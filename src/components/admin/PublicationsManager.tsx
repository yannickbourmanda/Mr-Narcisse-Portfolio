import { deleteCloudinaryMediaByUrl } from '../../services/cloudinary';
import { getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc, addDoc, updateDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PLATFORM_CONFIG } from '../../config/platform';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Plus, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploadInput } from './ImageUploadInput';
import { DocumentUploadInput } from './DocumentUploadInput';
import { Switch } from '@/components/ui/switch';

export default function AdminPublicationsManager() {
  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPublication, setEditingPublication] = useState<any>(null);
  const [coverImage, setCoverImage] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'publications'), where('platformId', '==', PLATFORM_CONFIG.id));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      
      setPublications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const deletePublication = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette publication ?')) return;
    try {
            const pubDoc = await getDoc(doc(db, 'publications', id));
      const pData = pubDoc.data();
      if (pData?.image) {
        await deleteCloudinaryMediaByUrl(pData.image);
      }
      if (pData?.attachmentUrl) {
        await deleteCloudinaryMediaByUrl(pData.attachmentUrl);
      }
      await deleteDoc(doc(db, 'publications', id));
      toast.success('Publication supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleStatus = async (pub: any) => {
    await updateDoc(doc(db, 'publications', pub.id), {
      status: pub.status === 'published' ? 'draft' : 'published'
    });
  };

  const handleSavePublication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const pubData = {
        title: formData.get('title'),
        author: formData.get('author'),
        date: formData.get('date'),
        category: formData.get('category'),
        shortDescription: formData.get('shortDescription'),
        content: formData.get('content'),
        image: coverImage,
        attachmentUrl,
        attachmentName,
        externalDocumentUrl: formData.get('externalDocumentUrl') || '',
        status: formData.get('status') === 'on' ? 'published' : 'draft',
        order: Number(formData.get('order')) || 0,
        platformId: PLATFORM_CONFIG.id,
      };

      if (editingPublication) {
        await updateDoc(doc(db, 'publications', editingPublication.id), pubData);
        toast.success('Publication modifiée avec succès');
      } else {
        await addDoc(collection(db, 'publications'), {
          ...pubData,
          createdAt: Date.now()
        });
        toast.success('Publication ajoutée avec succès');
      }

      setIsAddOpen(false);
      setEditingPublication(null);
      setCoverImage('');
      setAttachmentUrl('');
      setAttachmentName('');
    } catch (error) {
      console.error(error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (pub: any) => {
    setEditingPublication(pub);
    setCoverImage(pub.image || '');
    setAttachmentUrl(pub.attachmentUrl || '');
    setAttachmentName(pub.attachmentName || '');
    setIsAddOpen(true);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-navy-dark dark:text-white">Gestion des Publications</h1>
          <p className="text-slate-500 dark:text-white/60">Gérez les publications affichées sur la page Services.</p>
        </div>
        
        <div className="flex gap-4">
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            setEditingPublication(null);
            setCoverImage('');
          }
        }}>
          <DialogTrigger>
            <Button className="bg-gold hover:bg-gold-dark text-white gap-2">
              <div className="flex items-center gap-2">
                <Plus size={18} /> Nouvelle Publication
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto dark:bg-navy-light dark:text-white border-slate-200 dark:border-white/10">
            <DialogHeader>
              <DialogTitle>{editingPublication ? 'Modifier la publication' : 'Créer une publication'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSavePublication} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Image de couverture</label>
                <ImageUploadInput 
                  folder="publications"
                  value={coverImage}
                  onChange={setCoverImage}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Titre</label>
                <Input name="title" defaultValue={editingPublication?.title} required className="dark:bg-navy-dark dark:border-white/10" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Auteur</label>
                  <Input name="author" defaultValue={editingPublication?.author} required className="dark:bg-navy-dark dark:border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de publication</label>
                  <Input name="date" defaultValue={editingPublication?.date} required className="dark:bg-navy-dark dark:border-white/10" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie</label>
                  <Input name="category" defaultValue={editingPublication?.category} required className="dark:bg-navy-dark dark:border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ordre</label>
                  <Input name="order" type="number" defaultValue={editingPublication?.order || 0} className="dark:bg-navy-dark dark:border-white/10" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description courte</label>
                <Textarea name="shortDescription" defaultValue={editingPublication?.shortDescription} required rows={3} className="dark:bg-navy-dark dark:border-white/10" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contenu complet</label>
                <Textarea name="content" defaultValue={editingPublication?.content} required rows={6} className="dark:bg-navy-dark dark:border-white/10" />
              </div>

              <div className="flex items-center space-x-2 pt-2 pb-4 border-b border-slate-100 dark:border-white/10">
                <Switch name="status" id="pub-status" defaultChecked={!editingPublication || editingPublication.status === 'published'} />
                <label htmlFor="pub-status" className="text-sm font-medium cursor-pointer">
                  Publier immédiatement
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-gold hover:bg-gold-dark text-white">
                  {isSubmitting ? 'Enregistrement...' : (editingPublication ? 'Mettre à jour' : 'Créer')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-light rounded-xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-200 dark:border-white/10">
              <TableHead className="w-16">Ordre</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Auteur & Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Aucune publication trouvée.
                </TableCell>
              </TableRow>
            ) : (
              publications.map((pub) => (
                <TableRow key={pub.id} className="border-slate-100 dark:border-white/5">
                  <TableCell className="font-mono text-sm">{pub.order}</TableCell>
                  <TableCell>
                    {pub.image ? (
                      <img src={pub.image} alt={pub.title} className="w-16 h-12 object-cover rounded-md" />
                    ) : (
                      <div className="w-16 h-12 bg-slate-100 dark:bg-black/20 rounded-md flex items-center justify-center text-xs text-slate-400">
                        No img
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-navy-dark dark:text-white line-clamp-1">{pub.title}</div>
                    <div className="text-xs text-slate-500">{pub.category}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{pub.author}</div>
                    <div className="text-xs text-slate-500">{pub.date}</div>
                  </TableCell>
                  <TableCell>
                    <span 
                      onClick={() => toggleStatus(pub)}
                      className={`cursor-pointer inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                        pub.status === 'published' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-white/60'
                      }`}
                    >
                      {pub.status === 'published' ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                      {pub.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(pub)} className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deletePublication(pub.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
