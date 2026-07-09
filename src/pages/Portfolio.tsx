import React, { useEffect, useState } from 'react';
import Section, { SectionHeader } from '../components/ui/Section';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PLATFORM_CONFIG } from '../config/platform';
import { SEO } from '../components/SEO';

export default function Portfolio() {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'projects'), where('platformId', '==', PLATFORM_CONFIG.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((p: any) => p.status !== 'draft')
      .sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setProjects(projectsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const defaultTemplates = [
    {
      id: 'template-1',
      title: "Développement Urbain Durable",
      categoryId: "Infrastructures",
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
      description: "Projet d'infrastructure urbaine pour soutenir la croissance durable."
    },
    {
      id: 'template-2',
      title: "Modernisation des Services Publics",
      categoryId: "Transformation Digitale",
      coverImage: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800",
      description: "Digitalisation complète et accompagnement au changement."
    },
    {
      id: 'template-3',
      title: "Partenariats Public-Privé",
      categoryId: "Stratégie",
      coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800",
      description: "Montage financier et développement de relations institutionnelles."
    }
  ];

  const normalizeText = (text: string) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const displayProjects = projects.length > 0 ? projects : defaultTemplates;
  const categories = ['Tous', ...Array.from(new Set(displayProjects.map((p: any) => p.categoryId).filter(Boolean)))];
  
  const searchedProjects = displayProjects.filter(project => {
    if (!searchQuery) return true;
    const query = normalizeText(searchQuery);
    return (
      (project.title && normalizeText(project.title).includes(query)) ||
      (project.categoryId && normalizeText(project.categoryId).includes(query)) ||
      (project.description && normalizeText(project.description).includes(query)) ||
      (project.objectives && normalizeText(project.objectives).includes(query))
    );
  });

  const filteredProjects = activeCategory === 'Tous' ? searchedProjects : searchedProjects.filter((p: any) => p.categoryId === activeCategory);

  return (
    <div className="pt-24 lg:pt-32">
      <SEO 
        title="Portfolio & Projets" 
        description="Découvrez les projets récents et les réalisations de Bandjim Narbe Narcisse Nasser." 
      />
      <Section bg="gray">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8 relative z-20 px-4">
          <SectionHeader title="Mes Projets" subtitle="Portfolio" centered={false} />
          
          <div className="w-full lg:w-96 relative">
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy border border-white/10 text-white px-4 py-3 pl-12 focus:outline-none focus:border-gold transition-colors font-light"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>
        
        {/* Categories / Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 px-4">
          {categories.map((cat, i) => (
            <button 
              key={i} 
              onClick={() => setActiveCategory(cat as string)}
              className={`px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors border ${activeCategory === cat ? 'bg-gold text-navy-dark border-gold' : 'bg-transparent text-white/50 hover:text-white border-white/10 hover:border-gold/50'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Link to={`/portfolio/${project.id}`} key={project.id} className="group bg-navy-dark border border-white/5 block overflow-hidden hover:border-gold/30 transition-all duration-300 relative">
              <div className="aspect-[4/3] overflow-hidden relative bg-navy-light">
                <div className="absolute inset-0 bg-navy-dark animate-pulse" /> {/* Placeholder */}
                <div className="absolute inset-0 bg-navy/60 group-hover:bg-transparent mix-blend-color z-20 transition-colors duration-700" />
                <img src={project.coverImage || 'https://images.unsplash.com/photo-1531545514251-b159e3874ceb?auto=format&fit=crop&q=80&w=800'} alt={project.title} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 relative z-10" loading="lazy" />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-gold text-[9px] font-bold tracking-[0.3em] uppercase block">{project.categoryId || 'Général'}</span>
                </div>
                <h3 className="text-2xl font-serif text-white mb-6 leading-tight font-light">{project.title}</h3>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 group-hover:text-gold flex items-center transition-colors pb-1 border-b border-transparent group-hover:border-gold inline-flex">
                  Voir le détail <ArrowRight size={14} className="ml-2" />
                </span>
              </div>
            </Link>
          ))}
        </div>
        
        {filteredProjects.length === 0 && !isLoading && (
          <div className="text-center py-20 text-white/50 w-full">Aucun projet trouvé.</div>
        )}
      </Section>
    </div>
  );
}
