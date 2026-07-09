import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Section from '../components/ui/Section';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openImageIndex, setOpenImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      // Check if it's a template first
      if (id.startsWith('template-')) {
        const templates = [
          {
            id: 'template-1',
            title: "Développement Urbain Durable",
            categoryId: "Infrastructures",
            coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
            description: "Projet d'infrastructure urbaine pour soutenir la croissance durable.",
            content: "Le projet de développement urbain durable a pour objectif de repenser l\'infrastructure de nos villes pour réduire l\'empreinte carbone tout en favorisant le dynamisme économique. En partenariat avec les autorités locales, nous avons déployé des systèmes de gestion intelligente de l\'énergie et des transports.",
            galleryImages: [
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
              "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
              "https://images.unsplash.com/photo-1473161924013-eb0972d4ca22?auto=format&fit=crop&q=80&w=1200"
            ]
          },
          {
            id: 'template-2',
            title: "Modernisation des Services Publics",
            categoryId: "Transformation Digitale",
            coverImage: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800",
            description: "Digitalisation complète et accompagnement au changement.",
            content: "Ce projet couvre la digitalisation des services publics à l'échelle nationale. Il inclut le développement d\'une plateforme unifiée permettant aux citoyens d\'accéder à leurs démarches en ligne. L'accompagnement au changement a permis de former plus de 500 agents publics aux nouveaux outils."
          },
          {
            id: 'template-3',
            title: "Partenariats Public-Privé",
            categoryId: "Stratégie",
            coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800",
            description: "Montage financier et développement de relations institutionnelles.",
            content: "Développement et montage juridique et financier pour un grand projet d'infrastructure. Nous avons réussi à réunir plusieurs investisseurs privés autour des priorités de l'État dans ce domaine stratégique, assurant ainsi la pérennité du financement de l'infrastructure."
          }
        ];
        const t = templates.find(t => t.id === id);
        if (t) setProject(t);
        setIsLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'projects', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (isLoading) {
    return (
      <div className="pt-24 lg:pt-32 min-h-screen bg-navy text-white flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pt-24 lg:pt-32 min-h-screen bg-navy text-white flex items-center justify-center flex-col">
        <h2 className="text-2xl mb-4">Projet introuvable</h2>
        <Link to="/portfolio" className="text-gold flex items-center hover:text-white transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Retour au portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 lg:pt-32 pb-20 bg-navy min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full">
        <Link to="/portfolio" className="inline-flex items-center text-sm text-gold hover:text-white transition-colors mb-12">
          <ArrowLeft size={16} className="mr-2" /> Retour au portfolio
        </Link>
        
        <div className="mb-12">
          {project.categoryId && (
            <span className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase block mb-4">
              {project.categoryId}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-serif text-white leading-tight font-light mb-6">
            {project.title}
          </h1>
        </div>

        {project.coverImage && (
          <div className="w-full aspect-video md:aspect-[21/9] overflow-hidden mb-16 border border-white/10 relative bg-navy-light">
            <div className="absolute inset-0 bg-navy-dark animate-pulse" /> {/* Placeholder */}
            <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover relative z-10" loading="eager" />
          </div>
        )}

        <div className="max-w-3xl mx-auto text-white/70 prose prose-invert prose-lg prose-gold">
          {project.description && (
            <p className="text-xl md:text-2xl font-serif text-white/90 leading-relaxed mb-12 italic border-l-2 border-gold pl-6">
              {project.description}
            </p>
          )}

          {project.objectives && (
            <div className="mb-12">
              <h3 className="text-2xl font-serif text-white mb-4">Objectifs</h3>
              <p className="text-white/80 font-light leading-relaxed whitespace-pre-wrap">{project.objectives}</p>
            </div>
          )}

          {project.methodology && (
            <div className="mb-12">
              <h3 className="text-2xl font-serif text-white mb-4">Méthodologie</h3>
              <p className="text-white/80 font-light leading-relaxed whitespace-pre-wrap">{project.methodology}</p>
            </div>
          )}

          {project.results && (
            <div className="mb-12">
              <h3 className="text-2xl font-serif text-white mb-4">Résultats</h3>
              <p className="text-white/80 font-light leading-relaxed whitespace-pre-wrap">{project.results}</p>
            </div>
          )}
          
          {project.content && (
            <div 
              className="markdown-body text-white/80 font-light leading-relaxed text-lg"
              dangerouslySetInnerHTML={{ __html: project.content || '' }}
            />
          )}
        </div>

        {project.galleryImages && project.galleryImages.length > 0 && (
          <div className="max-w-7xl mx-auto mt-24 border-t border-white/10 pt-16">
            <h3 className="text-2xl font-serif text-white mb-8 border-l-2 border-gold pl-4">Galerie</h3>
            
            <div className="flex gap-4 overflow-x-auto pb-8 custom-scrollbar snap-x">
              {project.galleryImages.map((img: string, idx: number) => (
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
            
            {project.galleryImages.length > 1 && (
              <button 
                onClick={() => setOpenImageIndex((prev) => (prev! - 1 + project.galleryImages.length) % project.galleryImages.length)}
                className="absolute left-4 lg:left-10 text-white/50 hover:text-white transition-colors z-[110]"
              >
                <ChevronLeft size={48} />
              </button>
            )}

            <div className="max-w-[90vw] max-h-[85vh] z-[105]">
              <img 
                src={project.galleryImages[openImageIndex]} 
                alt={`Viewer ${openImageIndex + 1}`} 
                className="max-w-full max-h-[85vh] object-contain shadow-2xl"
              />
            </div>

            {project.galleryImages.length > 1 && (
              <button 
                onClick={() => setOpenImageIndex((prev) => (prev! + 1) % project.galleryImages.length)}
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
