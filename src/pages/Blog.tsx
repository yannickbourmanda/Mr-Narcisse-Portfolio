import React, { useEffect, useState } from 'react';
import Section, { SectionHeader } from '../components/ui/Section';
import { ArrowRight, Search, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PLATFORM_CONFIG } from '../config/platform';
import { SEO } from '../components/SEO';
import { defaultArticles } from '../config/defaultArticles';

export default function Blog() {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');

  useEffect(() => {
    const q = query(collection(db, 'articles'), where('platformId', '==', PLATFORM_CONFIG.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const articlesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setArticles(articlesData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const normalizeText = (text: string) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const displayArticles = articles.length > 0 ? articles : defaultArticles;
  const publishedArticles = displayArticles.filter(article => article.status === 'Publié' || !article.status);
  
  const categories = ['Tous', ...Array.from(new Set(publishedArticles.map((p: any) => p.categoryId).filter(Boolean)))];

  const searchedArticles = publishedArticles.filter(article => {
    if (!searchQuery) return true;
    const query = normalizeText(searchQuery);
    return (
      (article.title && normalizeText(article.title).includes(query)) ||
      (article.categoryId && normalizeText(article.categoryId).includes(query)) ||
      (article.author && normalizeText(article.author).includes(query)) ||
      (article.content && normalizeText(article.content).includes(query))
    );
  });

  const filteredArticles = activeCategory === 'Tous' 
    ? searchedArticles 
    : searchedArticles.filter((a: any) => a.categoryId === activeCategory);

  return (
    <div className="pt-24 lg:pt-32">
      <SEO 
        title="Blog & Actualités" 
        description="Découvrez les dernières actualités, analyses et réflexions de Bandjim Narbe Narcisse Nasser sur le développement, l'innovation, et la stratégie." 
      />
      <Section bg="navy">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8 relative z-20">
          <SectionHeader title="Actualités & Publications" subtitle="Blog" />
          
          <div className="w-full lg:w-96 relative">
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy-dark/50 border border-white/10 text-white px-4 py-3 pl-12 focus:outline-none focus:border-gold transition-colors font-light"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          </div>
        </div>

        {/* Categories / Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 px-4 relative z-20">
          {categories.map((cat, i) => (
            <button 
              key={i} 
              onClick={() => setActiveCategory(cat as string)}
              className={`px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors border ${activeCategory === cat ? 'bg-gold text-navy-dark border-gold' : 'bg-transparent text-white/50 hover:text-white border-white/10 hover:border-gold/50'}`}>
              {cat}
            </button>
          ))}
        </div>

        {filteredArticles.length === 0 && !isLoading && (
          <div className="text-center py-20 text-white/50 w-full relative z-20">Aucun article trouvé.</div>
        )}

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-16 relative z-20">
          {filteredArticles.map((article) => (
            <Link to={`/blog/${article.id}`} key={article.id} className="group cursor-pointer block">
              <div className="aspect-[16/9] overflow-hidden mb-8 relative border border-white/5 bg-navy-light">
                <div className="absolute inset-0 bg-navy-dark animate-pulse" /> {/* Placeholder */}
                <div className="absolute inset-0 bg-navy/50 mix-blend-multiply group-hover:bg-transparent z-20 transition-colors duration-700"></div>
                <img 
                  src={article.coverImage || "https://images.unsplash.com/photo-1507038732509-8b1a9623223a?auto=format&fit=crop&q=80&w=800"} 
                  alt={article.title} 
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 relative z-10"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">
                  <span className="text-gold">{article.categoryId || 'Général'}</span>
                  <span className="mx-3 opacity-50">/</span>
                  <span>{article.createdAt?.toDate().toLocaleDateString('fr-FR') || 'Récent'}</span>
                </div>
              </div>
              <h3 className="text-2xl font-serif text-white mb-4 group-hover:text-gold transition-colors leading-snug font-light">
                {article.title}
              </h3>
              <p className="text-white/50 mb-8 line-clamp-2 text-sm font-light leading-relaxed">
                {article.content ? article.content.replace(/<[^>]+>/g, '').substring(0, 100) + '...' : ''}
              </p>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 group-hover:text-gold flex items-center transition-colors pb-1 border-b border-transparent group-hover:border-gold inline-flex">
                Lire la suite <ArrowRight size={14} className="ml-2" />
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
