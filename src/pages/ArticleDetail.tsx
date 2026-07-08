import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Section from '../components/ui/Section';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Search, Calendar, User, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openImageIndex, setOpenImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      // Check if it's a template first
      if (id.startsWith('template-art-')) {
        const defaultArticles = [
          {
            id: 'template-art-1',
            title: "L'Avenir de la Transformation Digitale en Afrique",
            status: "Publié",
            categoryId: "Innovation",
            coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
            content: "La transformation digitale est un levier majeur pour le développement économique de l'Afrique. Ce processus inclut de nombreux aspects : les paiements mobiles, l'e-gouvernement et l'éducation technologique. L'adoption rapide des smartphones offre un terreau fertile pour des initiatives numériques ambitieuses et adaptées aux réalités du continent.\n\nEn réunissant le secteur privé et les acteurs publics, l'innovation s'accélère...",
            galleryImages: []
          },
          {
            id: 'template-art-2',
            title: "L'importance des Infrastructures Durables",
            status: "Publié",
            categoryId: "Infrastructures",
            coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800",
            content: "Pour bâtir l'avenir, les infrastructures doivent répondre aux défis climatiques actuels. Cela implique une phase de conception et de développement très détaillée afin de s'assurer du faible impact environnemental des réalisations. Nous explorerons comment intégrer ces notions dès le montage financier.",
            galleryImages: []
          }
        ];
        const art = defaultArticles.find(a => a.id === id);
        if (art) setArticle(art);
        setIsLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (isLoading) {
    return (
      <div className="pt-24 lg:pt-32 min-h-screen bg-navy text-white flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="pt-24 lg:pt-32 min-h-screen bg-navy text-white flex items-center justify-center flex-col">
        <h2 className="text-2xl mb-4">Article introuvable</h2>
        <Link to="/blog" className="text-gold flex items-center hover:text-white transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Retour au blog
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 lg:pt-32 pb-20 bg-navy min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full">
        <Link to="/blog" className="inline-flex items-center text-sm text-gold hover:text-white transition-colors mb-12">
          <ArrowLeft size={16} className="mr-2" /> Retour au blog
        </Link>
        
        <div className="mb-12">
          {article.categoryId && (
            <span className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase block mb-4">
              {article.categoryId}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight font-light mb-6">
            {article.title}
          </h1>

          <div className="flex items-center gap-6 text-xs text-white/50 uppercase tracking-widest font-bold border-t border-white/10 pt-6">
            {article.createdAt && (
              <span className="flex items-center">
                <Calendar size={12} className="mr-2 text-gold" />
                {article.createdAt?.toDate ? article.createdAt.toDate().toLocaleDateString('fr-FR') : 'Récemment'}
              </span>
            )}
            {article.author && (
              <span className="flex items-center">
                <User size={12} className="mr-2 text-gold" />
                {article.author}
              </span>
            )}
            {article.readingTime && (
              <span className="flex items-center">
                {article.readingTime} de lecture
              </span>
            )}
          </div>
        </div>

        {article.coverImage && (
          <div className="w-full aspect-video md:aspect-[21/9] overflow-hidden mb-16 border border-white/10 relative bg-navy-light">
            <div className="absolute inset-0 bg-navy-dark animate-pulse" /> {/* Placeholder */}
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover relative z-10" loading="eager" />
          </div>
        )}

        <div className="max-w-3xl mx-auto text-white/70 prose prose-invert prose-lg prose-gold">
          <div 
            className="markdown-body text-white/80 font-light leading-relaxed text-lg"
            dangerouslySetInnerHTML={{ __html: article.content || '' }}
          />
        </div>

        {article.galleryImages && article.galleryImages.length > 0 && (
          <div className="max-w-7xl mx-auto mt-24 border-t border-white/10 pt-16">
            <h3 className="text-2xl font-serif text-white mb-8 border-l-2 border-gold pl-4">Galerie</h3>
            
            <div className="flex gap-4 overflow-x-auto pb-8 custom-scrollbar snap-x">
              {article.galleryImages.map((img: string, idx: number) => (
                <div key={idx} className="shrink-0 w-[200px] sm:w-[280px] aspect-square border border-white/10 bg-navy-light overflow-hidden group relative snap-center rounded">
                  <div className="absolute inset-0 bg-navy-dark animate-pulse" /> {/* Placeholder while loading */}
                  <img src={img} alt={`Galerie ${idx + 1}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-transform duration-700 group-hover:scale-105 relative z-10" loading="lazy" />
                  
                  <div className="absolute inset-0 bg-navy-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center">
                    <button onClick={() => setOpenImageIndex(idx)} className="bg-navy-dark/80 text-white px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/20 hover:border-gold hover:text-gold transition-all backdrop-blur-sm">
                      Voir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Overlay for Images */}
        {openImageIndex !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/95 backdrop-blur-md">
            <button 
              onClick={() => setOpenImageIndex(null)}
              className="absolute top-6 right-6 lg:top-10 lg:right-10 text-white/50 hover:text-white transition-colors z-[110]"
            >
              <X size={32} />
            </button>
            
            {article.galleryImages.length > 1 && (
              <button 
                onClick={() => setOpenImageIndex((prev) => (prev! - 1 + article.galleryImages.length) % article.galleryImages.length)}
                className="absolute left-4 lg:left-10 text-white/50 hover:text-white transition-colors z-[110]"
              >
                <ChevronLeft size={48} />
              </button>
            )}

            <div className="max-w-[90vw] max-h-[85vh] z-[105]">
              <img 
                src={article.galleryImages[openImageIndex]} 
                alt={`Viewer ${openImageIndex + 1}`} 
                className="max-w-full max-h-[85vh] object-contain shadow-2xl"
              />
            </div>

            {article.galleryImages.length > 1 && (
              <button 
                onClick={() => setOpenImageIndex((prev) => (prev! + 1) % article.galleryImages.length)}
                className="absolute right-4 lg:right-10 text-white/50 hover:text-white transition-colors z-[110]"
              >
                <ChevronRight size={48} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
