import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { doc, getDoc, setDoc, collection, query, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PLATFORM_CONFIG } from '../../config/platform';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminContactManager() {
  const [data, setData] = useState({
    title: '',
    description: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<any>(null);
  const [isSubmittingSocial, setIsSubmittingSocial] = useState(false);

  useEffect(() => {
    const fetchContactInfo = async () => {
      const docRef = doc(db, 'contact_page', PLATFORM_CONFIG.id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const docData = snap.data();
        setData({
          title: docData.title || '',
          description: docData.description || '',
          email: docData.email || '',
          phone: docData.phone || '',
          address: docData.address || ''
        });
      }
    };
    fetchContactInfo();

    // Fetch Social Links
    const qSocial = query(collection(db, 'social_links'));
    const unsubscribeSocial = onSnapshot(qSocial, (snapshot) => {
      const sData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => a.order - b.order);
      setSocialLinks(sData);
    });

    return () => {
      unsubscribeSocial();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'contact_page', PLATFORM_CONFIG.id), data, { merge: true });
      toast.success('Page contact mise à jour');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSocialSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingSocial(true);
    const form = new FormData(e.currentTarget);
    let urlStr = form.get('url') as string;
    if (urlStr && !urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
      urlStr = 'https://' + urlStr;
    }

    const socialData = {
      platform: form.get('platform'),
      url: urlStr,
      location: form.get('location'),
      order: Number(form.get('order')) || Date.now()
    };

    try {
      if (editingSocial) {
        await updateDoc(doc(db, 'social_links', editingSocial.id), socialData);
        toast.success('Réseau social mis à jour');
      } else {
        await addDoc(collection(db, 'social_links'), socialData);
        toast.success('Réseau social ajouté');
      }
      setIsSocialOpen(false);
      setEditingSocial(null);
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmittingSocial(false);
    }
  };

  const handleDeleteSocial = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce réseau social ?')) {
      await deleteDoc(doc(db, 'social_links', id));
      toast.success('Réseau social supprimé');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-serif text-navy-dark dark:text-white">Page de Contact</h1>
        <p className="text-slate-500 dark:text-white/60">Gérez le contenu de la page contact et vos réseaux sociaux.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSave} className="lg:col-span-2">
          <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10">
            <CardHeader>
              <CardTitle>Coordonnées et Texte de présentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Titre d'accroche</Label>
                <Input name="title" value={data.title} onChange={handleChange} className="dark:bg-navy-dark dark:border-white/10" required />
              </div>
              <div className="space-y-2">
                <Label>Texte descriptif</Label>
                <Textarea name="description" value={data.description} onChange={handleChange} rows={3} className="dark:bg-navy-dark dark:border-white/10" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="space-y-2">
                  <Label>Adresse Email</Label>
                  <Input name="email" type="text" value={data.email} onChange={handleChange} className="dark:bg-navy-dark dark:border-white/10" required />
                </div>
                <div className="space-y-2">
                  <Label>Numéro de Téléphone</Label>
                  <Input name="phone" value={data.phone} onChange={handleChange} className="dark:bg-navy-dark dark:border-white/10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresse Physique</Label>
                <Input name="address" value={data.address} onChange={handleChange} className="dark:bg-navy-dark dark:border-white/10" />
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-black/20 mt-4 px-6 py-4 border-t border-slate-200 dark:border-white/10 flex justify-end">
               <Button type="submit" disabled={isSaving} className="bg-gold hover:bg-gold-dark text-white">
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
               </Button>
            </CardFooter>
          </Card>
        </form>

        <div className="lg:col-span-1 space-y-6">
          <Card className="dark:bg-navy-dark dark:border-white/10">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Réseaux Sociaux</CardTitle>
              <Dialog open={isSocialOpen} onOpenChange={(open) => { setIsSocialOpen(open); if (!open) setEditingSocial(null); }}>
                <DialogTrigger render={<Button variant="outline" size="sm" className="mr-2" />}>
                  <Plus size={16} className="mr-2" /> Ajouter
                </DialogTrigger>
                <DialogContent className="sm:max-w-md dark:bg-navy-light dark:text-white border-slate-200 dark:border-white/10">
                  <DialogHeader>
                    <DialogTitle>{editingSocial ? "Modifier" : "Ajouter"} un réseau social</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSocialSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Plateforme</Label>
                      <select name="platform" defaultValue={editingSocial?.platform || 'LinkedIn'} required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-navy-dark focus-visible:outline-none">
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Facebook">Facebook</option>
                        <option value="X/Twitter">X (Twitter)</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Instagram">Instagram</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input name="url" type="text" defaultValue={editingSocial?.url} placeholder="https://..." required className="dark:bg-navy-dark dark:border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Emplacement</Label>
                      <select name="location" defaultValue={editingSocial?.location || 'both'} required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-navy-dark focus-visible:outline-none">
                        <option value="both">Partout (Footer et Contact)</option>
                        <option value="footer">Footer uniquement</option>
                        <option value="contact">Page Contact uniquement</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ordre d'affichage (Optionnel)</Label>
                      <Input name="order" type="number" defaultValue={editingSocial?.order} placeholder="Ex: 1" className="dark:bg-navy-dark dark:border-white/10" />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={isSubmittingSocial} className="bg-gold hover:bg-gold-dark text-white">
                        Enregistrer
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {socialLinks.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-white/50 text-center py-4">Aucun réseau social</p>
              ) : (
                <div className="space-y-2">
                  {socialLinks.map((social) => (
                    <div key={social.id} className="p-3 bg-slate-50 dark:bg-black/20 rounded-lg border border-slate-100 dark:border-white/5 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-navy-dark dark:text-white">{social.platform}</div>
                        <div className="text-xs text-slate-500 dark:text-white/50">{social.location === 'both' ? 'Partout' : social.location === 'footer' ? 'Footer' : 'Contact'}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingSocial(social); setIsSocialOpen(true); }} className="h-8 w-8 text-blue-500">
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteSocial(social.id)} className="h-8 w-8 text-red-500">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

