import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PLATFORM_CONFIG } from '../../config/platform';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, FileText, MessageSquare, Database, Activity, Plus, Edit, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { subscribeToActivities, Activity as ActivityType } from '../../services/activityService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const getActionIcon = (action: string) => {
  switch (action) {
    case 'CREATE': return <Plus size={14} className="text-emerald-500" />;
    case 'UPDATE': return <Edit size={14} className="text-blue-500" />;
    case 'DELETE': return <Trash2 size={14} className="text-red-500" />;
    default: return <Activity size={14} className="text-slate-500" />;
  }
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    articles: 0,
    publications: 0,
    unreadMessages: 0
  });
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    const qProjects = query(collection(db, 'projects'), where('platformId', '==', PLATFORM_CONFIG.id));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      setStats(prev => ({ ...prev, projects: snapshot.size }));
    });

    const qArticles = query(collection(db, 'articles'), where('platformId', '==', PLATFORM_CONFIG.id));
    const unsubArticles = onSnapshot(qArticles, (snapshot) => {
      setStats(prev => ({ ...prev, articles: snapshot.size }));
    });

    const qPublications = query(collection(db, 'publications'), where('platformId', '==', PLATFORM_CONFIG.id));
    const unsubPublications = onSnapshot(qPublications, (snapshot) => {
      setStats(prev => ({ ...prev, publications: snapshot.size }));
    });

    const qMessages = query(collection(db, 'contact_messages'));
    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      let unreadCount = 0;
      snapshot.forEach(doc => {
        if (doc.data().isRead === false || doc.data().read === false) {
          unreadCount++;
        }
      });
      setStats(prev => ({ ...prev, unreadMessages: unreadCount }));
    }, (error) => {
      console.error("Error fetching messages for dashboard:", error);
    });

    return () => {
      unsubProjects();
      unsubArticles();
      unsubPublications();
      unsubMessages();
    };
  }, []);

  useEffect(() => {
    const unsubActivities = subscribeToActivities((data) => {
      setActivities(data.slice(0, 5));
    }, 5);

    return () => unsubActivities();
  }, []);

  const seedDemoData = async () => {
    setIsSeeding(true);
    try {
      // Données de base
      const defaultProjects = [
        {
          title: "BN2 SMART – Innovation numérique et transformation digitale",
          categoryId: "Transformation Digitale / Innovation / Technologie",
          coverImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
          description: "BN2 SMART représente une approche entrepreneuriale axée sur l'innovation, la transformation numérique et l'utilisation de la technologie comme outil pour créer de nouvelles opportunités. L'initiative reflète une vision centrée sur l'adaptation des solutions numériques aux réalités des marchés émergents et sur l'accompagnement de l'évolution des organisations grâce à la technologie.\n\nÀ travers ce projet, l'approche combine l'entrepreneuriat, la réflexion stratégique et la sensibilisation technologique pour encourager la création de solutions ayant un impact pratique."
        },
        {
          title: "Impact For Africa – Innovation, technologie et développement humain",
          categoryId: "Développement / Innovation Sociale / Leadership",
          coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
          description: "Impact For Africa est une initiative axée sur la promotion de l'innovation, le partage des connaissances et le développement du potentiel humain. Le projet souligne l'importance d'autonomiser les individus par la technologie, l'entrepreneuriat et l'accès aux opportunités.\n\nCette initiative reflète l'engagement à soutenir des idées qui contribuent au développement économique et professionnel. Le projet démontre l'intérêt de construire des écosystèmes où les jeunes talents, les entrepreneurs et les innovateurs peuvent échanger des connaissances et créer de nouvelles opportunités."
        },
        {
          title: "Impact Divin – Leadership et accompagnement entrepreneurial",
          categoryId: "Leadership / Entrepreneuriat / Formation",
          coverImage: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=800",
          description: "Impact Divin représente une initiative centrée sur le leadership, le développement personnel et l'encouragement de l'esprit entrepreneurial. Le projet s'articule autour de l'idée que la transformation commence par la vision, la discipline et le développement des capacités individuelles.\n\nÀ travers cette initiative, des perspectives liées au leadership, à la responsabilité et à l'importance de développer de solides bases personnelles et professionnelles sont partagées."
        },
        {
          title: "Digital Finance & Emerging Financial Technologies",
          categoryId: "Finance / FinTech / Innovation",
          coverImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800",
          description: "La finance numérique représente l'un des domaines importants de transformation induits par la technologie. Ce domaine se concentre sur la compréhension de la manière dont les solutions numériques peuvent améliorer l'accès aux services financiers et créer de nouvelles opportunités économiques.\n\nÀ travers l'intérêt pour la technologie, l'entrepreneuriat et les écosystèmes d'innovation, la relation entre la finance et la transformation numérique est explorée, en particulier autour de l'avenir des services financiers."
        },
        {
          title: "Entrepreneuriat et construction d’écosystèmes d’innovation",
          categoryId: "Stratégie / Entrepreneuriat / Innovation",
          coverImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80&w=800",
          description: "Ce projet représente une vision stratégique autour de l'entrepreneuriat, de la collaboration et de la création d'écosystèmes d'innovation. L'objectif est de comprendre comment les entrepreneurs, les organisations et les communautés peuvent travailler ensemble pour créer des opportunités durables.\n\nL'approche est centrée sur la connexion d'idées, de personnes et de technologies pour encourager la création de valeur et le développement à long terme."
        }
      ];

      const defaultArticles = [
        {
          title: "La transformation digitale : une opportunité stratégique pour l’Afrique",
          category: "Innovation / Technologie",
          status: "published",
          imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
          readTime: "5 min",
          content: "<p>La transformation digitale est devenue un élément majeur dans l’évolution des organisations et des économies modernes. Les technologies numériques offrent aujourd’hui de nouvelles possibilités pour améliorer les services, créer des entreprises innovantes et accélérer le développement.</p><p>En Afrique, cette transformation représente une opportunité importante. Les entrepreneurs et les organisations peuvent utiliser les outils numériques pour répondre à des problématiques locales tout en développant des solutions adaptées aux nouveaux besoins.</p><p>Cependant, la technologie seule ne suffit pas. La réussite dépend également de la formation, de la vision stratégique et de la capacité à construire des écosystèmes favorisant l’innovation.</p>"
        },
        {
          title: "L’entrepreneuriat africain face aux nouveaux défis économiques",
          category: "Entrepreneuriat / Stratégie",
          status: "published",
          imageUrl: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800",
          readTime: "6 min",
          content: "<p>L’entrepreneuriat représente aujourd’hui un moteur important de développement économique. De plus en plus d’acteurs cherchent à créer des solutions adaptées aux besoins des populations et aux réalités des marchés.</p><p>Les entrepreneurs doivent cependant faire face à plusieurs défis : accès aux ressources, développement des compétences, financement et construction de réseaux solides.</p><p>Créer une entreprise durable nécessite une vision claire, une capacité d’adaptation et une compréhension profonde de son environnement.</p>"
        },
        {
          title: "Le leadership comme outil de transformation personnelle et collective",
          category: "Leadership / Management",
          status: "published",
          imageUrl: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&q=80&w=800",
          readTime: "4 min",
          content: "<p>Le leadership ne se limite pas à une position ou un titre. Il représente avant tout une capacité à influencer positivement, prendre des responsabilités et construire une vision.</p><p>Dans un environnement en constante évolution, les leaders doivent développer leur capacité d’adaptation, leur intelligence relationnelle et leur aptitude à collaborer.</p><p>Le développement du leadership contribue à créer des individus capables d’apporter une contribution durable à leur communauté et leur environnement professionnel.</p>"
        },
        {
          title: "La finance digitale et l’avenir des services financiers",
          category: "Finance / FinTech",
          status: "published",
          imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800",
          readTime: "7 min",
          content: "<p>Les technologies financières transforment progressivement la manière dont les individus et les entreprises accèdent aux services financiers.</p><p>Les solutions digitales facilitent les paiements, améliorent l’efficacité des services et ouvrent de nouvelles possibilités économiques.</p><p>L’avenir de la finance sera fortement influencé par la capacité des acteurs à combiner technologie, accessibilité et innovation.</p>"
        },
        {
          title: "Construire des écosystèmes d’innovation durables",
          category: "Innovation / Développement durable",
          status: "published",
          imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800",
          readTime: "6 min",
          content: "<p>L’innovation durable repose sur la collaboration entre différents acteurs : entrepreneurs, institutions, investisseurs et communautés.</p><p>Créer un environnement favorable à l’innovation demande une vision à long terme et une volonté de développer des solutions adaptées aux besoins réels.</p><p>Les écosystèmes d’innovation permettent de transformer les idées en projets capables de générer un impact économique et social.</p>"
        }
      ];

      // Ajouter les projets
      for (const p of defaultProjects) {
        await addDoc(collection(db, 'projects'), { ...p, platformId: PLATFORM_CONFIG.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }

      // Ajouter les articles
      for (const a of defaultArticles) {
        await addDoc(collection(db, 'articles'), { ...a, platformId: PLATFORM_CONFIG.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), authorId: "admin" });
      }

      toast.success("Données de démonstration importées avec succès !");
    } catch (e: any) {
      toast.error("Erreur lors de l'import : " + e.message);
    } finally {
      setIsSeeding(false);
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-navy-dark dark:text-white">Tableau de bord</h1>
          <p className="text-slate-500 dark:text-white/60">Bienvenue dans l'espace d'administration de {PLATFORM_CONFIG.name}.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Briefcase className="w-24 h-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-white/70">
              Projets publiés
            </CardTitle>
            <Briefcase className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-navy-dark dark:text-white">{stats.projects}</div>
            <p className="text-xs text-slate-500 mt-1">dans le portfolio</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <FileText className="w-24 h-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-white/70">
              Articles de blog
            </CardTitle>
            <FileText className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-navy-dark dark:text-white">{stats.articles}</div>
            <p className="text-xs text-slate-500 mt-1">en ligne</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <FileText className="w-24 h-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-white/70">
              Publications
            </CardTitle>
            <FileText className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-navy-dark dark:text-white">{stats.publications}</div>
            <p className="text-xs text-slate-500 mt-1">services</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <MessageSquare className="w-24 h-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-white/70">
              Messages non lus
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-navy-dark dark:text-white">{stats.unreadMessages}</div>
            <p className="text-xs text-slate-500 mt-1">en attente de lecture</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        {/* TEXT ACTIVITIES */}
        <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10 h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl text-navy-dark dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-gold" />
                Dernières Activités
              </CardTitle>
              <CardDescription className="mt-1">Modifications récentes sur le site</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              {activities.length === 0 ? (
                <div className="text-center text-slate-500 py-8">Aucune activité récente.</div>
              ) : (
                activities.map(activity => (
                  <div key={activity.id} className="flex items-start gap-4 text-sm pb-4 border-b border-slate-100 dark:border-white/5 last:border-0 last:pb-0">
                    <div className="bg-slate-100 dark:bg-black/20 p-2 rounded-full mt-0.5">
                      {getActionIcon(activity.action)}
                    </div>
                    <div>
                      <p className="text-navy-dark dark:text-white">
                        {activity.resourceType === 'PROJECT' ? 'Le projet' : activity.resourceType === 'ARTICLE' ? "L'article" : 'La ressource'}{' '}
                        <span className="font-semibold">"{activity.resourceName}"</span> a été{' '}
                        {activity.action === 'CREATE' ? 'ajouté' : activity.action === 'UPDATE' ? 'modifié' : 'supprimé'}.
                      </p>
                      <p className="text-xs text-slate-500 dark:text-white/40 mt-1">
                        {activity.timestamp?.toDate ? format(activity.timestamp.toDate(), "d MMM yyyy 'à' HH:mm:ss", { locale: fr }) : "A l'instant"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10">
              <Link to="/admin/activities" className="text-sm text-gold hover:text-gold-dark flex items-center gap-1 transition-colors">
                Voir tout l'historique <ArrowRight size={14} />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* GRAPH */}
        <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10 h-full">
          <CardHeader>
            <CardTitle className="text-xl text-navy-dark dark:text-white">
              Trafic & Interactions
            </CardTitle>
            <CardDescription className="mt-1">Tendances vagues des visites récentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { name: 'Lun', visites: 120, posts: 1 },
                    { name: 'Mar', visites: 156, posts: 2 },
                    { name: 'Mer', visites: 145, posts: 0 },
                    { name: 'Jeu', visites: 210, posts: 1 },
                    { name: 'Ven', visites: 258, posts: 3 },
                    { name: 'Sam', visites: 310, posts: 0 },
                    { name: 'Dim', visites: 290, posts: 1 },
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorVisites" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C6A87C" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#C6A87C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A2332', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#C6A87C' }}
                  />
                  <Area type="monotone" dataKey="visites" stroke="#C6A87C" fillOpacity={1} fill="url(#colorVisites)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
