import { deleteCloudinaryMediaByUrl } from '../../services/cloudinary';
import React, { useEffect, useState } from 'react';
import { logActivity } from '../../services/activityService';
import { collection, query, onSnapshot, doc, deleteDoc, addDoc, updateDoc, serverTimestamp, where, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PLATFORM_CONFIG } from '../../config/platform';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploadInput } from './ImageUploadInput';
import { MultipleImageUploadInput } from './MultipleImageUploadInput';
import CategoriesManager from './CategoriesManager';

export default function AdminPortfolio() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'categories'>('projects');
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'projects'), where('platformId', '==', PLATFORM_CONFIG.id));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setProjects(projectsData);
      setLoading(false);
    });

    const qCats = query(
      collection(db, 'categories'),
      where('platformId', '==', PLATFORM_CONFIG.id),
      where('type', '==', 'portfolio')
    );
    const unsubCats = onSnapshot(qCats, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubscribe(); unsubCats(); };
  }, []);

  const deleteProject = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce projet ?')) return;
    try {
      const projectDoc = await getDoc(doc(db, 'projects', id));
      const projectName = projectDoc.exists() ? projectDoc.data()?.title || id : id;
      
            const pData = projectDoc.data();
      if (pData?.coverImage) {
        await deleteCloudinaryMediaByUrl(pData.coverImage);
      }
      if (pData?.galleryImages && Array.isArray(pData.galleryImages)) {
        for (const url of pData.galleryImages) {
          await deleteCloudinaryMediaByUrl(url);
        }
      }
      await deleteDoc(doc(db, 'projects', id));
      await logActivity('DELETE', 'PROJECT', projectName);
      toast.success('Projet supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSaveProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const dateStr = formData.get("createdAtStr") as string;
    let createdAtValue = editingProject ? editingProject.createdAt : serverTimestamp();
    
    if (dateStr) {
      const dateObj = new Date(dateStr);
      if (!isNaN(dateObj.getTime())) {
        createdAtValue = Timestamp.fromDate(dateObj);
      }
    }
    
    try {
      const projectData: any = {
        platformId: PLATFORM_CONFIG.id,
        title: formData.get('title') || "",
        description: formData.get('description') || "",
        objectives: formData.get('objectives') || '',
        methodology: formData.get('methodology') || '',
        results: formData.get('results') || '',
        categoryId: formData.get('categoryId') || "",
        status: formData.get('status') || 'published',
        coverImage: coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
        galleryImages: galleryImages || [],
        // TODO: related projects selection
      };

      if (dateStr) {
         projectData.createdAt = createdAtValue;
      }

      if (editingProject) {
        if (editingProject.title && editingProject.title !== projectData.title) {
          const { renameCloudinaryFolder } = await import('../../services/cloudinary');
          await renameCloudinaryFolder(`projects/${editingProject.title}`, `projects/${projectData.title}`);
        }
        await updateDoc(doc(db, 'projects', editingProject.id), projectData);
        await logActivity('UPDATE', 'PROJECT', projectData.title as string || 'Projet inconnu');
        toast.success('Projet modifié avec succès');
      } else {
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          createdAt: createdAtValue,
        });
        await logActivity('CREATE', 'PROJECT', projectData.title as string || 'Nouveau projet');
        toast.success('Projet ajouté avec succès');
      }
      setIsAddOpen(false);
      setEditingProject(null);
      setCoverImage('');
      setGalleryImages([]);
    } catch (error: any) {
      toast.error('Erreur: ' + (error?.message || "Erreur inconnue"));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (project: any) => {
    setEditingProject(project);
    setTitle(project.title || '');
    setCoverImage(project.coverImage || '');
    setGalleryImages(project.galleryImages || []);
    setIsAddOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsAddOpen(open);
    if (!open) {
      setEditingProject(null);
      setTitle('');
      setCoverImage('');
      setGalleryImages([]);
    }
  };

  if (loading) return <div>Chargement...</div>;

  const filteredProjects = projects.filter(p => !searchTerm || 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.categoryId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.methodology?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-navy-dark dark:text-white">Portfolio</h1>
          <p className="text-slate-500 dark:text-white/60">Gérez vos projets et catégories.</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'projects' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('projects')}
            className={activeTab === 'projects' ? 'bg-gold hover:bg-gold-dark text-white' : ''}
          >
            Projets
          </Button>
          <Button 
            variant={activeTab === 'categories' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('categories')}
            className={activeTab === 'categories' ? 'bg-gold hover:bg-gold-dark text-white' : ''}
          >
            Catégories
          </Button>
        </div>
      </div>

      {activeTab === 'categories' ? (
        <CategoriesManager type="portfolio" />
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Rechercher (Titre, Catégorie, Client, Description)..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="pl-10 dark:bg-navy-dark dark:border-white/10"
              />
            </div>
            <Dialog open={isAddOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger>
            <Button className="bg-gold hover:bg-gold-dark text-white gap-2">
              <Plus size={18} /> Nouveau Projet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-navy-light dark:text-white border-0">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Modifier le projet' : 'Ajouter un projet'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Titre</label>
                  <Input name="title" required value={title} onChange={(e) => setTitle(e.target.value)} className="dark:bg-navy-dark dark:border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de création</label>
                  <Input name="createdAtStr" type="date" defaultValue={editingProject?.createdAt?.toDate ? editingProject.createdAt.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="dark:bg-navy-dark dark:border-white/10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie</label>
                  <select name="categoryId" defaultValue={editingProject?.categoryId || ""} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-navy-dark focus-visible:outline-none">
                    <option value="">Sélectionner une catégorie...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <select name="status" defaultValue={editingProject?.status || 'published'} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-navy-dark focus-visible:outline-none">
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Image de couverture</label>
                <ImageUploadInput folder={`projects/${title || 'nouveau'}`} value={coverImage} onChange={setCoverImage} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description Courte</label>
                <Textarea name="description" rows={3} defaultValue={editingProject?.description} className="dark:bg-navy-dark dark:border-white/10 resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Objectifs</label>
                <Textarea name="objectives" rows={3} defaultValue={editingProject?.objectives} className="dark:bg-navy-dark dark:border-white/10 resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Méthodologie</label>
                <Textarea name="methodology" rows={3} defaultValue={editingProject?.methodology} className="dark:bg-navy-dark dark:border-white/10 resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Résultats</label>
                <Textarea name="results" rows={3} defaultValue={editingProject?.results} className="dark:bg-navy-dark dark:border-white/10 resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Galerie d'images complémentaires</label>
                <MultipleImageUploadInput folder={`projects/${title || 'nouveau'}/gallery`} urls={galleryImages} onChange={setGalleryImages} />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting} className="bg-gold hover:bg-gold-dark text-white">
                  {isSubmitting ? 'Sauvegarde...' : (editingProject ? 'Modifier' : 'Créer')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
          </div>

      <div className="bg-white dark:bg-navy-light border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 dark:border-white/10">
              <TableHead>Image</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">Aucun projet</TableCell>
              </TableRow>
            ) : (
               filteredProjects.map((project) => (
                <TableRow key={project.id} className="border-b border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">
                  <TableCell>
                     <img src={project.coverImage || 'https://via.placeholder.com/50'} alt={project.title} className="w-12 h-12 object-cover rounded" />
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate" title={project.title}>{project.title}</TableCell>
                  <TableCell className="max-w-[150px] truncate" title={project.categoryId || ""}>{project.categoryId || '-'}</TableCell>
                  <TableCell>{project.createdAt?.toDate().toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(project)} className="text-blue-500 hover:text-blue-600">
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteProject(project.id)} className="text-red-500 hover:text-red-600">
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      </>
      )}
    </div>
  );
}
