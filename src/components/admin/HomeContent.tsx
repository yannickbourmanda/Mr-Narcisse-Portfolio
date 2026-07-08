import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageUploadInput } from './ImageUploadInput';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PLATFORM_CONFIG } from '../../config/platform';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export default function AdminHomeContent() {
  const [data, setData] = useState<any>({
    hero: {
      overtitle: 'LEADERSHIP • INNOVATION • IMPACT',
      title: 'Bandjim Narbe',
      subtitle: 'Narcisse Nasser',
      description: "Entrepreneur, consultant et leader stratégique engagé pour le développement durable, l'innovation et le renforcement des partenariats institutionnels à l'échelle internationale.",
      primaryButtonText: 'Découvrir mon parcours',
      primaryButtonLink: '/a-propos',
      secondaryButtonText: 'Voir mes projets',
      secondaryButtonLink: '/portfolio',
      image: '',
      expertiseText: 'Stratégie de Développement &\nInnovation Institutionnelle'
    },
    aboutPreview: {
      overtitle: 'Introduction',
      titlePart1: 'Une vision portée par ',
      titleHighlight: "l'action et l'engagement",
      quote: "\"L'innovation n'a de sens que si elle crée de la valeur durable pour les communautés et les organisations.\"",
      text: "En tant que consultant et leader de projets, j'accompagne les institutions dans leur transformation numérique, leur développement stratégique et la mise en œuvre de solutions innovantes. Mon approche se fonde sur une analyse rigoureuse des besoins et une vision orientée vers des résultats concrets.",
      image: '',
      buttonText: 'Lire mon parcours',
      buttonLink: '/a-propos'
    },
    servicesPreview: {
      overtitle: 'Services',
      title: "Domaines d'Expertise",
      buttonText: 'Voir toutes mes expertises',
      buttonLink: '/services'
    },
    portfolioPreview: {
      overtitle: 'Portfolio',
      title: 'Mes Projets Principaux',
      buttonText: 'Voir Tous Les Projets',
      buttonLink: '/portfolio'
    },
    statistics: [
      { num: '15+', label: "Années d'expérience" },
      { num: '50+', label: 'Projets réalisés' },
      { num: '30+', label: 'Partenaires mondiaux' },
      { num: '10+', label: "Pays d'intervention" }
    ]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      const docRef = doc(db, 'homepage', PLATFORM_CONFIG.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const docData = docSnap.data();
        setData((prev: any) => ({
          hero: { ...prev.hero, ...docData.hero },
          aboutPreview: { ...prev.aboutPreview, ...docData.aboutPreview },
          servicesPreview: { ...prev.servicesPreview, ...docData.servicesPreview },
          portfolioPreview: { ...prev.portfolioPreview, ...docData.portfolioPreview },
          statistics: docData.statistics || prev.statistics
        }));
      }
    };
    fetchHomeData();
  }, []);

  const handleHeroChange = (field: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }));
  };

  const handleAboutPreviewChange = (field: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      aboutPreview: { ...prev.aboutPreview, [field]: value }
    }));
  };

  const handleServicesPreviewChange = (field: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      servicesPreview: { ...prev.servicesPreview, [field]: value }
    }));
  };

  const handlePortfolioPreviewChange = (field: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      portfolioPreview: { ...prev.portfolioPreview, [field]: value }
    }));
  };

  const addStatistic = () => {
    setData((prev: any) => ({
      ...prev,
      statistics: [...prev.statistics, { num: '', label: '' }]
    }));
  };

  const updateStatistic = (index: number, field: string, value: string) => {
    const newStats = [...data.statistics];
    newStats[index][field] = value;
    setData((prev: any) => ({ ...prev, statistics: newStats }));
  };

  const removeStatistic = (index: number) => {
    setData((prev: any) => ({
      ...prev,
      statistics: prev.statistics.filter((_: any, i: number) => i !== index)
    }));
  };

  const moveStatistic = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === data.statistics.length - 1)
    ) return;
    
    const newStats = [...data.statistics];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newStats[index], newStats[targetIndex]] = [newStats[targetIndex], newStats[index]];
    setData((prev: any) => ({ ...prev, statistics: newStats }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'homepage', PLATFORM_CONFIG.id), data);
      toast.success("Page d'accueil mise à jour");
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-navy-dark dark:text-white">Gestion de l'Accueil</h1>
          <p className="text-slate-500 dark:text-white/60">Gérez la section Hero et les statistiques de la page d'accueil.</p>
        </div>
        <Button onClick={handleSave} disabled={isSubmitting} className="bg-gold hover:bg-gold-dark text-white">
          Enregistrer les modifications
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10">
          <CardHeader>
            <CardTitle>Section Hero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Surtitre (Overtitle)</label>
              <Input 
                value={data.hero.overtitle} 
                onChange={(e) => handleHeroChange('overtitle', e.target.value)} 
                className="dark:bg-navy-dark dark:border-white/10"
                placeholder="Ex: LEADERSHIP • INNOVATION"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Titre principal</label>
              <Input 
                value={data.hero.title} 
                onChange={(e) => handleHeroChange('title', e.target.value)} 
                className="dark:bg-navy-dark dark:border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sous-titre (mot surligné)</label>
              <Input 
                value={data.hero.subtitle} 
                onChange={(e) => handleHeroChange('subtitle', e.target.value)} 
                className="dark:bg-navy-dark dark:border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={data.hero.description} 
                onChange={(e) => handleHeroChange('description', e.target.value)} 
                rows={4}
                className="dark:bg-navy-dark dark:border-white/10 resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Texte de l'encart flottant (Expertise)</label>
              <Textarea 
                value={data.hero.expertiseText} 
                onChange={(e) => handleHeroChange('expertiseText', e.target.value)} 
                rows={2}
                placeholder="Stratégie de Développement &&#10;Innovation Institutionnelle"
                className="dark:bg-navy-dark dark:border-white/10 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Texte Bouton Primaire</label>
                <Input 
                  value={data.hero.primaryButtonText} 
                  onChange={(e) => handleHeroChange('primaryButtonText', e.target.value)} 
                  className="dark:bg-navy-dark dark:border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Lien Bouton Primaire</label>
                <Input 
                  value={data.hero.primaryButtonLink} 
                  onChange={(e) => handleHeroChange('primaryButtonLink', e.target.value)} 
                  className="dark:bg-navy-dark dark:border-white/10"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Texte Bouton Secondaire</label>
                <Input 
                  value={data.hero.secondaryButtonText} 
                  onChange={(e) => handleHeroChange('secondaryButtonText', e.target.value)} 
                  className="dark:bg-navy-dark dark:border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Lien Bouton Secondaire</label>
                <Input 
                  value={data.hero.secondaryButtonLink} 
                  onChange={(e) => handleHeroChange('secondaryButtonLink', e.target.value)} 
                  className="dark:bg-navy-dark dark:border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium">Image de profil (Hero)</label>
              <ImageUploadInput 
                folder="homepage" 
                value={data.hero.image} 
                onChange={(val) => handleHeroChange('image', val)} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10 h-fit">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Statistiques</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addStatistic}>
              <Plus size={16} className="mr-2" /> Ajouter
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.statistics.map((stat: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-black/20 rounded-lg border border-slate-100 dark:border-white/5">
                <div className="flex flex-col gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-slate-400" onClick={() => moveStatistic(idx, 'up')} disabled={idx === 0}>
                    <ArrowUp size={14} />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-slate-400" onClick={() => moveStatistic(idx, 'down')} disabled={idx === data.statistics.length - 1}>
                    <ArrowDown size={14} />
                  </Button>
                </div>
                
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <Input 
                      placeholder="Ex: 15+" 
                      value={stat.num}
                      onChange={(e) => updateStatistic(idx, 'num', e.target.value)}
                      className="text-center font-bold text-lg dark:bg-navy-dark dark:border-white/10 h-10"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      placeholder="Label (ex: Projets réalisés)" 
                      value={stat.label}
                      onChange={(e) => updateStatistic(idx, 'label', e.target.value)}
                      className="dark:bg-navy-dark dark:border-white/10 h-10"
                    />
                  </div>
                </div>

                <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => removeStatistic(idx)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            {data.statistics.length === 0 && (
              <p className="text-center text-sm text-slate-500 dark:text-white/40 py-4">Aucune statistique configurée.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10 h-fit lg:col-span-2">
          <CardHeader>
            <CardTitle>Section "À propos" (Aperçu)</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Surtitre</label>
                <Input 
                  value={data.aboutPreview?.overtitle || ''} 
                  onChange={(e) => handleAboutPreviewChange('overtitle', e.target.value)} 
                  className="dark:bg-navy-dark dark:border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre (Partie normale)</label>
                <Input 
                  value={data.aboutPreview?.titlePart1 || ''} 
                  onChange={(e) => handleAboutPreviewChange('titlePart1', e.target.value)} 
                  className="dark:bg-navy-dark dark:border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre (Partie en or / surlignée)</label>
                <Input 
                  value={data.aboutPreview?.titleHighlight || ''} 
                  onChange={(e) => handleAboutPreviewChange('titleHighlight', e.target.value)} 
                  className="dark:bg-navy-dark dark:border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Citation</label>
                <Textarea 
                  value={data.aboutPreview?.quote || ''} 
                  onChange={(e) => handleAboutPreviewChange('quote', e.target.value)} 
                  className="dark:bg-navy-dark dark:border-white/10 resize-none"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Texte descriptif</label>
                <Textarea 
                  value={data.aboutPreview?.text || ''} 
                  onChange={(e) => handleAboutPreviewChange('text', e.target.value)} 
                  className="dark:bg-navy-dark dark:border-white/10 resize-none"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Texte du Bouton</label>
                  <Input 
                    value={data.aboutPreview?.buttonText || ''} 
                    onChange={(e) => handleAboutPreviewChange('buttonText', e.target.value)} 
                    className="dark:bg-navy-dark dark:border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lien du Bouton</label>
                  <Input 
                    value={data.aboutPreview?.buttonLink || ''} 
                    onChange={(e) => handleAboutPreviewChange('buttonLink', e.target.value)} 
                    className="dark:bg-navy-dark dark:border-white/10"
                  />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium">Image de section</label>
                <ImageUploadInput 
                  folder="homepage" 
                  value={data.aboutPreview?.image || ''} 
                  onChange={(val) => handleAboutPreviewChange('image', val)} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10 h-fit lg:col-span-2">
          <CardHeader>
            <CardTitle>Section "Services" (Aperçu)</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Surtitre</label>
                <Input 
                  value={data.servicesPreview?.overtitle || ''} 
                  onChange={(e) => handleServicesPreviewChange('overtitle', e.target.value)} 
                  className="dark:bg-navy-dark dark:border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre Principal</label>
                <Input 
                  value={data.servicesPreview?.title || ''} 
                  onChange={(e) => handleServicesPreviewChange('title', e.target.value)} 
                  className="dark:bg-navy-dark dark:border-white/10"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Texte du Bouton</label>
                <Input 
                  value={data.servicesPreview?.buttonText || ''} 
                  onChange={(e) => handleServicesPreviewChange('buttonText', e.target.value)} 
                  className="dark:bg-navy-dark dark:border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Lien du Bouton</label>
                <Input 
                  value={data.servicesPreview?.buttonLink || ''} 
                  onChange={(e) => handleServicesPreviewChange('buttonLink', e.target.value)} 
                  className="dark:bg-navy-dark dark:border-white/10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10 h-fit lg:col-span-2">
          <CardHeader>
            <CardTitle>Section "Portfolio" (Aperçu)</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Surtitre</label>
                <Input 
                  value={data.portfolioPreview?.overtitle || ''} 
                  onChange={(e) => handlePortfolioPreviewChange('overtitle', e.target.value)} 
                  className="dark:bg-navy-dark dark:border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre Principal</label>
                <Input 
                  value={data.portfolioPreview?.title || ''} 
                  onChange={(e) => handlePortfolioPreviewChange('title', e.target.value)} 
                  className="dark:bg-navy-dark dark:border-white/10"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Texte du Bouton</label>
                <Input 
                  value={data.portfolioPreview?.buttonText || ''} 
                  onChange={(e) => handlePortfolioPreviewChange('buttonText', e.target.value)} 
                  className="dark:bg-navy-dark dark:border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Lien du Bouton</label>
                <Input 
                  value={data.portfolioPreview?.buttonLink || ''} 
                  onChange={(e) => handlePortfolioPreviewChange('buttonLink', e.target.value)} 
                  className="dark:bg-navy-dark dark:border-white/10"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

