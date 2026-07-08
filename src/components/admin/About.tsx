import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageUploadInput } from './ImageUploadInput';
import CVManager from './CVManager';
import { doc, getDoc, setDoc, collection, query, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PLATFORM_CONFIG } from '../../config/platform';
import { toast } from 'sonner';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AdminAbout() {
  const [data, setData] = useState<any>({});
  const [timeline, setTimeline] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState<any>(null);

  const [isSkillOpen, setIsSkillOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);

  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<any>(null);

  useEffect(() => {
    // Fetch About
    const fetchAboutData = async () => {
      const docRef = doc(db, 'about', PLATFORM_CONFIG.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const docData = docSnap.data();
        if (!docData.skillsIntroduction) {
          const updatedData = {
            ...docData,
            skillsIntroduction: "Fort d’une expérience internationale dans le pilotage de projets complexes, la transformation digitale et l’accompagnement des organisations, je combine expertise stratégique, management et maîtrise des environnements technologiques. Mon parcours m’a permis d’intervenir sur des programmes à forts enjeux, en coordonnant des équipes, en structurant des processus et en accompagnant les transformations opérationnelles et organisationnelles :"
          };
          await setDoc(docRef, updatedData);
          setData(updatedData);
        } else {
          setData(docData);
        }
      } else {
        const defaultAbout = {
          skillsIntroduction: "Fort d’une expérience internationale dans le pilotage de projets complexes, la transformation digitale et l’accompagnement des organisations, je combine expertise stratégique, management et maîtrise des environnements technologiques. Mon parcours m’a permis d’intervenir sur des programmes à forts enjeux, en coordonnant des équipes, en structurant des processus et en accompagnant les transformations opérationnelles et organisationnelles :"
        };
        await setDoc(docRef, defaultAbout);
        setData(defaultAbout);
      }
    };
    fetchAboutData();

    // Fetch Timeline
    const qTimeline = query(collection(db, 'timeline'));
    const unsubscribeTimeline = onSnapshot(qTimeline, async (snapshot) => {
      if (snapshot.empty) {
        const initialTimeline = [
          {
            type: 'experience',
            company: 'BN2 SMART',
            startDate: 'Janvier 2023',
            endDate: 'Présent',
            title: 'CEO – Directeur de Projet',
            status: 'CDI',
            description: 'Pilotage de la roadmap produit technologique B2B, coordination Agile et structuration des processus industriels. Mise en place de méthodes SAFe/Scrum, coordination de plusieurs pôles métiers et optimisation des cycles de déploiement.',
            result: 'Synchronisation de 5 pôles métiers et réduction de 25% des temps de déploiement.',
            order: 10
          },
          {
            type: 'experience',
            company: 'CNP Assurances',
            startDate: 'Octobre 2022',
            endDate: 'Présent',
            title: 'PMO – Scrum Master / Business Analyst',
            status: 'Freelance',
            description: 'Gestion des projets E-DECES et E-SANTE, stratégie de recette métier et coordination avec les équipes offshore.',
            result: '+20% efficacité des tests et réduction de 40% des bugs en pré-production.',
            order: 20
          },
          {
            type: 'experience',
            company: 'BNP Paribas Cardif',
            startDate: 'Juin 2021',
            endDate: 'Juillet 2022',
            title: 'PMO / Scrum Master / Chef de Projet',
            status: 'Freelance',
            description: 'Pilotage de plateformes API RESTful, gestion des backlogs, coordination des équipes métiers et application du framework SAFe.',
            result: 'Gestion d’un budget supérieur à 2M€ et amélioration du ROI de 15%.',
            order: 30
          },
          {
            type: 'experience',
            company: 'ALTICE – SFR',
            startDate: 'Décembre 2019',
            endDate: 'Août 2020',
            title: 'Consultant PMO / Chef de Projet Réglementaire',
            status: 'Temps plein',
            description: 'Pilotage de projets RGPD, animation des comités de pilotage, gestion budgétaire et coordination des ressources projets.',
            result: 'Conformité RGPD atteinte dans les délais.',
            order: 40
          },
          {
            type: 'experience',
            company: 'Peugeot',
            startDate: 'Octobre 2018',
            endDate: 'Novembre 2019',
            title: 'Coordinateur Projet / Scrum Master',
            status: 'Temps plein',
            description: 'Pilotage des tests plateforme DGC, formation utilisateurs, maintenance applicative et structuration de la gouvernance projet.',
            result: 'Gain de 2h/jour par poste client grâce à l’automatisation.',
            order: 50
          },
          {
            type: 'experience',
            company: 'SOLYSTIC SAS',
            startDate: 'Mars 2016',
            endDate: 'Décembre 2017',
            title: 'PMO',
            status: 'Temps plein',
            description: 'Pilotage de projets digitaux, rédaction des plans de tests, qualification fonctionnelle et technique, suivi KPI et gestion des incidents.',
            order: 60
          },
          {
            type: 'experience',
            company: 'Société Générale',
            startDate: 'Février 2013',
            endDate: 'Février 2015',
            title: 'Consultant Informatique',
            status: 'CDI',
            description: 'Pilotage de migrations techniques applicatives, coordination entre équipes techniques et métiers, suivi planning, reporting et gestion des anomalies.',
            order: 70
          },
          {
            type: 'education',
            company: 'Université Paris 8',
            startDate: '2013',
            endDate: 'Présent',
            title: 'Conduite de Projet Informatique',
            description: '',
            order: 80
          },
          {
            type: 'education',
            company: 'TELECOM SAINT-ETIENNE',
            startDate: '2009',
            endDate: 'Présent',
            title: 'Télécommunication et Réseaux, Sécurité Informatique',
            description: '',
            order: 90
          }
        ];
        for (const item of initialTimeline) {
          await addDoc(collection(db, 'timeline'), item);
        }
      } else {
        const tData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => a.order - b.order);
        setTimeline(tData);
      }
    });

    // Fetch Skills
    const qSkills = query(collection(db, 'skills'));
    const unsubscribeSkills = onSnapshot(qSkills, async (snapshot) => {
      if (snapshot.empty) {
        // Auto-seed if empty
        const initialSkills = [
          'Leadership stratégique',
          'Gouvernance institutionnelle',
          'Conduite du changement',
          'Diplomatie économique',
          'Gestion de programmes complexes',
          'Partenariats Public-Privé'
        ];
        for (let i = 0; i < initialSkills.length; i++) {
          await addDoc(collection(db, 'skills'), { name: initialSkills[i], order: i + 1 });
        }
      } else {
        const sData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => a.order - b.order);
        setSkills(sData);
      }
    });

    // Fetch Languages
    const qLanguages = query(collection(db, 'languages'));
    const unsubscribeLanguages = onSnapshot(qLanguages, async (snapshot) => {
      if (snapshot.empty) {
        // Auto-seed if empty
        const initialLanguages = ['Français', 'Anglais', 'Chinois'];
        for (let i = 0; i < initialLanguages.length; i++) {
          await addDoc(collection(db, 'languages'), { name: initialLanguages[i], order: i + 1 });
        }
      } else {
        const lData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => a.order - b.order);
        setLanguages(lData);
      }
    });

    return () => {
      unsubscribeTimeline();
      unsubscribeSkills();
      unsubscribeLanguages();
    };
  }, []);

  const handleChange = (field: string, value: string) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveAbout = async () => {
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'about', PLATFORM_CONFIG.id), data);
      toast.success('Section À Propos mise à jour');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimelineSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const timelineData = {
      type: formData.get('type') || 'experience',
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      title: formData.get('title'),
      company: formData.get('company'),
      status: formData.get('status'),
      description: formData.get('description'),
      result: formData.get('result'),
      order: Number(formData.get('order')) || Date.now()
    };

    try {
      if (editingTimeline) {
        await updateDoc(doc(db, 'timeline', editingTimeline.id), timelineData);
        toast.success('Élément mis à jour');
      } else {
        await addDoc(collection(db, 'timeline'), timelineData);
        toast.success('Élément ajouté');
      }
      handleCloseTimeline();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTimeline = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      await deleteDoc(doc(db, 'timeline', id));
      toast.success('Élément supprimé');
    }
  };

  const openEditTimeline = (item: any) => {
    setEditingTimeline(item);
    setIsTimelineOpen(true);
  };

  const handleCloseTimeline = () => {
    setIsTimelineOpen(false);
    setEditingTimeline(null);
  };

  const handleSkillSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const skillData = {
      name: formData.get('name'),
      order: Number(formData.get('order')) || Date.now()
    };

    try {
      if (editingSkill) {
        await updateDoc(doc(db, 'skills', editingSkill.id), skillData);
        toast.success('Compétence mise à jour');
      } else {
        await addDoc(collection(db, 'skills'), skillData);
        toast.success('Compétence ajoutée');
      }
      setIsSkillOpen(false);
      setEditingSkill(null);
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
      await deleteDoc(doc(db, 'skills', id));
      toast.success('Compétence supprimée');
    }
  };

  const handleLanguageSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const languageData = {
      name: formData.get('name'),
      order: Number(formData.get('order')) || Date.now()
    };

    try {
      if (editingLanguage) {
        await updateDoc(doc(db, 'languages', editingLanguage.id), languageData);
        toast.success('Langue mise à jour');
      } else {
        await addDoc(collection(db, 'languages'), languageData);
        toast.success('Langue ajoutée');
      }
      setIsLanguageOpen(false);
      setEditingLanguage(null);
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLanguage = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette langue ?')) {
      await deleteDoc(doc(db, 'languages', id));
      toast.success('Langue supprimée');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-navy-dark dark:text-white">À Propos</h1>
          <p className="text-slate-500 dark:text-white/60">Gérez le contenu de votre page À Propos et votre chronologie.</p>
        </div>
        <Button onClick={handleSaveAbout} disabled={isSubmitting} className="bg-gold hover:bg-gold-dark text-white">
          Enregistrer À Propos
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10">
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Image de profil / Bureau</label>
              <ImageUploadInput 
                folder="about" 
                value={data.profileImage || ''} 
                onChange={(val) => handleChange('profileImage', val)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image de la signature (Optionnel)</label>
              <ImageUploadInput 
                folder="about" 
                value={data.signatureImage || ''} 
                onChange={(val) => handleChange('signatureImage', val)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Titre (Ex: Entrepreneur - Auteur...)</label>
              <Input 
                value={data.title || ''} 
                onChange={(e) => handleChange('title', e.target.value)} 
                className="dark:bg-navy-dark dark:border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Biographie (Intro)</label>
              <Textarea 
                value={data.biography} 
                onChange={(e) => handleChange('biography', e.target.value)} 
                rows={3}
                className="dark:bg-navy-dark dark:border-white/10 resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description Professionnelle</label>
              <Textarea 
                value={data.description} 
                onChange={(e) => handleChange('description', e.target.value)} 
                rows={4}
                className="dark:bg-navy-dark dark:border-white/10 resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Vision (Optionnel)</label>
              <Input 
                value={data.vision || ''} 
                onChange={(e) => handleChange('vision', e.target.value)} 
                className="dark:bg-navy-dark dark:border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mission (Optionnel)</label>
              <Input 
                value={data.mission || ''} 
                onChange={(e) => handleChange('mission', e.target.value)} 
                className="dark:bg-navy-dark dark:border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Texte de signature (Optionnel)</label>
              <Input 
                value={data.signatureText || ''} 
                onChange={(e) => handleChange('signatureText', e.target.value)} 
                className="dark:bg-navy-dark dark:border-white/10"
                placeholder="Ex: B. Narbe Narcisse"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Introduction des compétences</label>
              <Textarea 
                value={data.skillsIntroduction || ''} 
                onChange={(e) => handleChange('skillsIntroduction', e.target.value)} 
                rows={3}
                className="dark:bg-navy-dark dark:border-white/10 resize-none"
                placeholder="Fort d'une expérience internationale..."
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <CVManager />

        <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10 h-fit">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Chronologie</CardTitle>
            <Dialog open={isTimelineOpen} onOpenChange={(open) => !open && handleCloseTimeline()}>
              <DialogTrigger>
                <Button variant="outline" size="sm" onClick={() => setIsTimelineOpen(true)}>
                  <Plus size={16} className="mr-2" /> Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto dark:bg-navy-light dark:text-white border-slate-200 dark:border-white/10">
                <DialogHeader>
                  <DialogTitle>{editingTimeline ? "Modifier l'élément" : "Ajouter un élément"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTimelineSubmit} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type</label>
                      <select name="type" defaultValue={editingTimeline?.type || 'experience'} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-navy-dark dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                        <option value="experience">Expérience Professionnelle</option>
                        <option value="education">Formation</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ordre d'affichage (Optionnel)</label>
                      <Input name="order" type="number" defaultValue={editingTimeline?.order} placeholder="Ex: 1" className="dark:bg-navy-dark dark:border-white/10" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date de début (Mois/Année)</label>
                      <Input name="startDate" defaultValue={editingTimeline?.startDate} placeholder="Ex: Jan 2020" required className="dark:bg-navy-dark dark:border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date de fin (Mois/Année)</label>
                      <Input name="endDate" defaultValue={editingTimeline?.endDate} placeholder="Ex: Présent" className="dark:bg-navy-dark dark:border-white/10" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Titre / Rôle</label>
                      <Input name="title" defaultValue={editingTimeline?.title} placeholder="Ex: CEO" required className="dark:bg-navy-dark dark:border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Entreprise / École</label>
                      <Input name="company" defaultValue={editingTimeline?.company} placeholder="Ex: BN2 SMART" className="dark:bg-navy-dark dark:border-white/10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Statut (Optionnel)</label>
                    <Input name="status" defaultValue={editingTimeline?.status} placeholder="Ex: CDI" className="dark:bg-navy-dark dark:border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea name="description" defaultValue={editingTimeline?.description} rows={4} className="dark:bg-navy-dark dark:border-white/10 resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Résultat (Optionnel)</label>
                    <Textarea name="result" defaultValue={editingTimeline?.result} rows={2} placeholder="Ex: Réduction de 25% des temps de déploiement." className="dark:bg-navy-dark dark:border-white/10 resize-none" />
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
          <CardContent className="space-y-4">
            {timeline.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-white/50 text-center py-4">Aucun élément dans la chronologie</p>
            ) : (
              <div className="space-y-3">
                {timeline.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50 dark:bg-black/20 rounded-lg border border-slate-100 dark:border-white/5 flex gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-xs text-gold font-bold tracking-wider">
                          {item.startDate} {item.endDate ? `- ${item.endDate}` : '- Présent'}
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.type === 'education' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-white/70'}`}>
                          {item.type === 'education' ? 'Formation' : 'Expérience'}
                        </span>
                      </div>
                      <h4 className="font-serif text-navy-dark dark:text-white font-medium">{item.title}</h4>
                      {(item.company || item.status) && (
                        <div className="text-sm text-slate-500 dark:text-white/60 mb-2 font-medium">
                          {item.company} {item.company && item.status && '·'} {item.status}
                        </div>
                      )}
                      <p className="text-sm text-slate-500 dark:text-white/60 mt-1 line-clamp-2">{item.description}</p>
                      {item.result && (
                        <p className="text-sm text-gold/80 mt-1 line-clamp-2 font-medium">Résultat: <span className="font-normal text-slate-500 dark:text-white/60">{item.result}</span></p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => openEditTimeline(item)} className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTimeline(item.id)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
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
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Compétences Clés</CardTitle>
            <Dialog open={isSkillOpen} onOpenChange={(open) => { setIsSkillOpen(open); if (!open) setEditingSkill(null); }}>
              <DialogTrigger render={<Button variant="outline" size="sm" className="mr-2" />}>
                <Plus size={16} className="mr-2" /> Ajouter
              </DialogTrigger>
              <DialogContent className="sm:max-w-md dark:bg-navy-light dark:text-white border-slate-200 dark:border-white/10">
                <DialogHeader>
                  <DialogTitle>{editingSkill ? "Modifier" : "Ajouter"} une compétence</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSkillSubmit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom de la compétence</label>
                    <Input name="name" defaultValue={editingSkill?.name} placeholder="Ex: Leadership stratégique" required className="dark:bg-navy-dark dark:border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ordre d'affichage (Optionnel)</label>
                    <Input name="order" type="number" defaultValue={editingSkill?.order} placeholder="Ex: 1" className="dark:bg-navy-dark dark:border-white/10" />
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
            {skills.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-white/50 text-center py-4">Aucune compétence</p>
            ) : (
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="p-3 bg-slate-50 dark:bg-black/20 rounded-lg border border-slate-100 dark:border-white/5 flex justify-between items-center">
                    <span className="font-medium text-navy-dark dark:text-white">{skill.name}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingSkill(skill); setIsSkillOpen(true); }} className="h-8 w-8 text-blue-500">
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteSkill(skill.id)} className="h-8 w-8 text-red-500">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Langues</CardTitle>
            <Dialog open={isLanguageOpen} onOpenChange={(open) => { setIsLanguageOpen(open); if (!open) setEditingLanguage(null); }}>
              <DialogTrigger render={<Button variant="outline" size="sm" className="mr-2" />}>
                <Plus size={16} className="mr-2" /> Ajouter
              </DialogTrigger>
              <DialogContent className="sm:max-w-md dark:bg-navy-light dark:text-white border-slate-200 dark:border-white/10">
                <DialogHeader>
                  <DialogTitle>{editingLanguage ? "Modifier" : "Ajouter"} une langue</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleLanguageSubmit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom de la langue</label>
                    <Input name="name" defaultValue={editingLanguage?.name} placeholder="Ex: Français" required className="dark:bg-navy-dark dark:border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ordre d'affichage (Optionnel)</label>
                    <Input name="order" type="number" defaultValue={editingLanguage?.order} placeholder="Ex: 1" className="dark:bg-navy-dark dark:border-white/10" />
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
            {languages.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-white/50 text-center py-4">Aucune langue</p>
            ) : (
              <div className="space-y-2">
                {languages.map((lang) => (
                  <div key={lang.id} className="p-3 bg-slate-50 dark:bg-black/20 rounded-lg border border-slate-100 dark:border-white/5 flex justify-between items-center">
                    <span className="font-medium text-navy-dark dark:text-white">{lang.name}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingLanguage(lang); setIsLanguageOpen(true); }} className="h-8 w-8 text-blue-500">
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteLanguage(lang.id)} className="h-8 w-8 text-red-500">
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
  );
}
