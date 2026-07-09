import { deleteCloudinaryMediaByUrl } from '../../services/cloudinary';
import { getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { db } from '../../config/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, where } from 'firebase/firestore';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { PLATFORM_CONFIG } from '../../config/platform';

export default function AdminServicesManager() {
  const [services, setServices] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'services'), where('platformId', '==', PLATFORM_CONFIG.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      iconName: formData.get('iconName') || 'Target',
      status: formData.get('status') === 'on' ? 'active' : 'inactive',
      order: Number(formData.get('order')) || 0,
      platformId: PLATFORM_CONFIG.id,
      createdAt: editingService ? editingService.createdAt : Date.now()
    };

    try {
      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), data);
        toast.success('Service mis à jour');
      } else {
        await addDoc(collection(db, 'services'), data);
        toast.success('Service ajouté');
      }
      handleClose();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      
      const serviceDoc = await getDoc(doc(db, 'services', id));
      const pData = serviceDoc.data();
      if (pData?.iconImage) {
        await deleteCloudinaryMediaByUrl(pData.iconImage);
      }
      await deleteDoc(doc(db, 'services', id));
      toast.success('Service supprimé');
    }
  };

  const toggleStatus = async (service: any) => {
    await updateDoc(doc(db, 'services', service.id), {
      status: service.status === 'active' ? 'inactive' : 'active'
    });
  };

  const openEdit = (item: any) => {
    setEditingService(item);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingService(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-navy-dark dark:text-white">Gestion des Services</h1>
          <p className="text-slate-500 dark:text-white/60">Ajoutez, modifiez ou supprimez les services proposés.</p>
        </div>
        <div className="flex gap-4">
          <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogTrigger>
              <Button className="bg-gold hover:bg-gold-dark text-white" onClick={() => setIsOpen(true)}>
                <Plus size={16} className="mr-2" /> Nouveau Service
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto dark:bg-navy-light dark:text-white border-slate-200 dark:border-white/10">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Modifier le service' : 'Ajouter un service'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre du service</label>
                <Input name="title" defaultValue={editingService?.title} required className="dark:bg-navy-dark dark:border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea name="description" defaultValue={editingService?.description} rows={4} required className="dark:bg-navy-dark dark:border-white/10 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom de l'icône (Lucide React)</label>
                  <Input name="iconName" defaultValue={editingService?.iconName || 'Target'} placeholder="Ex: Target, Globe2, Users" className="dark:bg-navy-dark dark:border-white/10" />
                  <p className="text-xs text-slate-400">Référence: lucide.dev</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ordre d'affichage</label>
                  <Input name="order" type="number" defaultValue={editingService?.order || 0} placeholder="Ex: 1" className="dark:bg-navy-dark dark:border-white/10" />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch name="status" id="status" defaultChecked={!editingService || editingService.status === 'active'} />
                <label htmlFor="status" className="text-sm font-medium">Activer le service</label>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting} className="bg-gold hover:bg-gold-dark text-white">
                  Enregistrer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className={`bg-white dark:bg-navy-light border-slate-200 dark:border-white/10 transition-opacity ${service.status === 'inactive' ? 'opacity-60' : ''}`}>
            <CardContent className="p-6 relative">
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(service)} className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                  <Edit size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
                  <Trash2 size={16} />
                </Button>
              </div>
              <div className="mb-4 pt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${service.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {service.status === 'active' ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                  {service.status === 'active' ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="text-gold mb-4 text-sm font-mono bg-slate-50 dark:bg-black/20 w-fit px-2 py-1 rounded">Icon: {service.iconName} | Ordre: {service.order || 0}</div>
              <h3 className="text-xl font-serif text-navy-dark dark:text-white mb-2">{service.title}</h3>
              <p className="text-slate-500 dark:text-white/60 text-sm line-clamp-3">{service.description}</p>
              
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                <span className="text-xs text-slate-400">Modifier l'état</span>
                <Switch checked={service.status === 'active'} onCheckedChange={() => toggleStatus(service)} />
              </div>
            </CardContent>
          </Card>
        ))}
        {services.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
            <p className="text-slate-500 dark:text-white/50">Aucun service n'a été créé.</p>
          </div>
        )}
      </div>
    </div>
  );
}
