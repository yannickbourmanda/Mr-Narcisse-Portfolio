import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PLATFORM_CONFIG } from '../../config/platform';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function CategoriesManager({ type }: { type: 'blog' | 'portfolio' }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'categories'),
      where('platformId', '==', PLATFORM_CONFIG.id),
      where('type', '==', type)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const catsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(catsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [type]);

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;

    try {
      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), { name });
        toast.success('Catégorie modifiée avec succès');
      } else {
        await addDoc(collection(db, 'categories'), {
          platformId: PLATFORM_CONFIG.id,
          type,
          name,
          createdAt: serverTimestamp(),
        });
        toast.success('Catégorie ajoutée avec succès');
      }
      setIsAddOpen(false);
      setEditingCategory(null);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette catégorie ?')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        toast.success('Catégorie supprimée');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const openEditDialog = (category: any) => {
    setEditingCategory(category);
    setIsAddOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsAddOpen(open);
    if (!open) {
      setEditingCategory(null);
    }
  };

  if (loading) return <div>Chargement des catégories...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium dark:text-white">Gestion des Catégories</h2>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger>
            <Button className="bg-gold hover:bg-gold-dark text-white gap-2">
              <Plus size={18} /> Nouvelle Catégorie
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md dark:bg-navy-light dark:text-white border-0">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Modifier la catégorie" : "Ajouter une catégorie"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom de la catégorie</label>
                <Input
                  name="name"
                  required
                  defaultValue={editingCategory?.name}
                  className="dark:bg-navy-dark dark:border-white/10"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gold hover:bg-gold-dark text-white"
                >
                  {isSubmitting
                    ? "Sauvegarde..."
                    : editingCategory
                      ? "Modifier"
                      : "Créer"}
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
              <TableHead>Nom</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center py-8 text-slate-500"
                >
                  Aucune catégorie
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow
                  key={category.id}
                  className="border-b border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(category)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCategory(category.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </Button>
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
