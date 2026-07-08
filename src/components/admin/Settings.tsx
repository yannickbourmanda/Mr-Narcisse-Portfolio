import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PLATFORM_CONFIG } from '../../config/platform';
import { toast } from 'sonner';
import { ImageUploadInput } from './ImageUploadInput';
import { getAuth, updateEmail, updateProfile } from 'firebase/auth';

export default function AdminSettings() {
  const [data, setData] = useState({
    siteTitle: 'Bandjim Narbe Narcisse Nasser',
    seoDescription: 'Entrepreneur, consultant et leader stratégique engagé...',
    logo: '',
    facebook: '',
    linkedin: '',
    twitter: '',
    whatsapp: '',
    googleAnalyticsId: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const auth = getAuth();
  const [adminEmail, setAdminEmail] = useState(auth.currentUser?.email || '');

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, 'settings', PLATFORM_CONFIG.id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setData(prev => ({ ...prev, ...snap.data() }));
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await setDoc(doc(db, 'settings', PLATFORM_CONFIG.id), {
        siteTitle: formData.get('siteTitle'),
        seoDescription: formData.get('seoDescription'),
        logo: data.logo,
        facebook: formData.get('facebook'),
        linkedin: formData.get('linkedin'),
        twitter: formData.get('twitter'),
        whatsapp: formData.get('whatsapp'),
        googleAnalyticsId: formData.get('googleAnalyticsId'),
      }, { merge: true });

      if (adminEmail !== auth.currentUser?.email && auth.currentUser) {
         try {
           await updateEmail(auth.currentUser, adminEmail);
         } catch(e) {
           toast.error("Erreur lors de la mise à jour de l'email. Vous devez vous reconnecter.");
         }
      }

      toast.success('Paramètres sauvegardés');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-serif text-navy-dark dark:text-white">Paramètres</h1>
        <p className="text-slate-500 dark:text-white/60">Configurez le site, le SEO, les réseaux sociaux et votre compte admin.</p>
      </div>

      <form onSubmit={handleSave}>
        <div className="space-y-6">
          <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10">
            <CardHeader>
              <CardTitle>Identité du Site</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre du Site (Titre global)</label>
                <Input name="siteTitle" defaultValue={data.siteTitle} className="dark:bg-navy-dark dark:border-white/10" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description SEO (Méta description globale)</label>
                <Textarea name="seoDescription" defaultValue={data.seoDescription} rows={3} className="dark:bg-navy-dark dark:border-white/10" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ID Google Analytics (Optionnel)</label>
                <Input name="googleAnalyticsId" defaultValue={data.googleAnalyticsId} placeholder="Ex: G-XXXXXXXXXX" className="dark:bg-navy-dark dark:border-white/10" />
                <p className="text-xs text-slate-500">Laissez vide si vous n'utilisez pas Google Analytics.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Logo principal</label>
                <ImageUploadInput folder="settings" value={data.logo} onChange={val => setData(p => ({...p, logo: val}))} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10">
            <CardHeader>
              <CardTitle>Réseaux Sociaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL Facebook</label>
                  <Input name="facebook" defaultValue={data.facebook} className="dark:bg-navy-dark dark:border-white/10" placeholder="https://facebook.com/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL LinkedIn</label>
                  <Input name="linkedin" defaultValue={data.linkedin} className="dark:bg-navy-dark dark:border-white/10" placeholder="https://linkedin.com/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL Twitter / X</label>
                  <Input name="twitter" defaultValue={data.twitter} className="dark:bg-navy-dark dark:border-white/10" placeholder="https://twitter.com/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lien WhatsApp</label>
                  <Input name="whatsapp" defaultValue={data.whatsapp} className="dark:bg-navy-dark dark:border-white/10" placeholder="https://wa.me/33612345678" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10">
            <CardHeader>
              <CardTitle>Compte Admin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Adresse Email (Login)</label>
                <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} type="email" className="dark:bg-navy-dark dark:border-white/10" required />
                <p className="text-xs text-slate-400">Modifier cette adresse modifiera vos identifiants de connexion.</p>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-black/20 mt-4 px-6 py-4 flex justify-end">
               <Button type="submit" disabled={isSaving} className="bg-gold hover:bg-gold-dark text-white">
                  {isSaving ? 'Enregistrement...' : 'Enregistrer tout'}
               </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
