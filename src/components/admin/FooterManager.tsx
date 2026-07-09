import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, query, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PLATFORM_CONFIG } from '../../config/platform';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploadInput } from './ImageUploadInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminFooter() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    logo: '',
    siteTitle: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    signatureImage: ''
  });

  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', PLATFORM_CONFIG.id));
        const contactDoc = await getDoc(doc(db, 'contact_page', PLATFORM_CONFIG.id));
        const aboutDoc = await getDoc(doc(db, 'about', PLATFORM_CONFIG.id));

        const settings = settingsDoc.data() || {};
        const contact = contactDoc.data() || {};
        const about = aboutDoc.data() || {};

        setFormData({
          logo: settings.logo || '',
          siteTitle: settings.siteTitle || '',
          description: contact.description || '',
          address: contact.address || '',
          phone: contact.phone || '',
          email: contact.email || '',
          signatureImage: about.signatureImage || ''
        });
      } catch (error) {
        toast.error('Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    };
    fetchFooterData();

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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Mettre à jour Settings
      await setDoc(doc(db, 'settings', PLATFORM_CONFIG.id), {
        logo: formData.logo,
        siteTitle: formData.siteTitle
      }, { merge: true });

      // Mettre à jour Contact
      await setDoc(doc(db, 'contact_page', PLATFORM_CONFIG.id), {
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        description: formData.description
      }, { merge: true });

      // Mettre à jour About (Signature)
      await setDoc(doc(db, 'about', PLATFORM_CONFIG.id), {
        signatureImage: formData.signatureImage
      }, { merge: true });

      toast.success('Pied de page mis à jour avec succès.');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleSocialSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  };

  const handleDeleteSocial = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce réseau social ?')) {
      await deleteDoc(doc(db, 'social_links', id));
      toast.success('Réseau social supprimé');
    }
  };

  if (loading) return <div className="h-full w-full flex items-center justify-center font-serif text-2xl text-navy-dark dark:text-white">Chargement...</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-serif font-bold text-navy-dark dark:text-white">Pied de page (Footer)</h1>
        <p className="text-slate-500 dark:text-white/70 mt-2">
          Gérez les éléments visuels et textuels qui composent le pied de page de votre site.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-1">
          {/* Colonne 1 : Marque et Contact */}
          <Card className="dark:bg-navy-dark dark:border-white/10">
            <CardHeader>
              <CardTitle>Marque & Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo (S'affiche à la place du texte)</Label>
                <ImageUploadInput folder="settings" value={formData.logo} onChange={(val) => handleImageChange('logo', val)} />
              </div>
              <div className="space-y-2">
                <Label>Nom de la marque / Copyright</Label>
                <Input name="siteTitle" value={formData.siteTitle} onChange={handleChange} className="dark:bg-navy dark:border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Description Courte</Label>
                <Textarea name="description" value={formData.description} onChange={handleChange} className="dark:bg-navy dark:border-white/10 h-24" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-navy-dark dark:border-white/10">
            <CardHeader>
              <CardTitle>Coordonnées de Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Adresse physique</Label>
                <Input name="address" value={formData.address} onChange={handleChange} className="dark:bg-navy dark:border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input name="phone" value={formData.phone} onChange={handleChange} className="dark:bg-navy dark:border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="text" value={formData.email} onChange={handleChange} className="dark:bg-navy dark:border-white/10" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-navy-dark dark:border-white/10">
            <CardHeader>
              <CardTitle>Signature visuelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Image de la signature</Label>
                <ImageUploadInput folder="about" value={formData.signatureImage} onChange={(val) => handleImageChange('signatureImage', val)} />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving} className="w-full bg-gold hover:bg-gold/90 text-navy-dark">
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications générales'}
          </Button>
        </form>

        {/* Colonne 2 : Réseaux */}
        <div className="space-y-6 lg:col-span-1">
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
                      <Button type="submit" disabled={isSubmitting} className="bg-gold hover:bg-gold-dark text-white">
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
