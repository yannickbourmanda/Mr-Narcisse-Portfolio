import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Section from '../components/ui/Section';
import { ArrowLeft, Calendar, User, Tag, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicationDetail() {
  const { id } = useParams();
  const [publication, setPublication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublication = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'publications', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPublication({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching publication:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPublication();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-[60vh] flex items-center justify-center bg-navy">
        <div className="text-white/50 text-xl font-serif">Chargement...</div>
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="pt-32 pb-24 min-h-[60vh] flex flex-col items-center justify-center bg-navy text-center px-4">
        <h1 className="text-3xl font-serif text-white mb-4">Publication introuvable</h1>
        <p className="text-white/60 mb-8">La publication que vous recherchez n'existe pas ou a été supprimée.</p>
        <Link to="/services" className="px-6 py-3 border border-gold text-gold hover:bg-gold hover:text-white transition-colors duration-300">
          Retour aux services
        </Link>
      </div>
    );
  }

  return (
    <article className="pt-24 lg:pt-32 bg-navy min-h-screen">
      {publication.image && (
        <div className="w-full h-[40vh] md:h-[50vh] relative">
          <div className="absolute inset-0 bg-navy/40 z-10"></div>
          <img 
            src={publication.image} 
            alt={publication.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <Section bg="navy">
        <div className="max-w-3xl mx-auto -mt-32 relative z-20">
          <div className="bg-navy-light border border-white/5 p-8 md:p-12 shadow-2xl">
            <Link to="/services" className="inline-flex items-center text-xs uppercase tracking-wider text-gold font-bold mb-8 hover:text-white transition-colors">
              <ArrowLeft size={14} className="mr-2" /> Retour aux services
            </Link>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-white/50 mb-6 uppercase tracking-wider">
              {publication.category && (
                <span className="flex items-center text-gold">
                  <Tag size={12} className="mr-1" /> {publication.category}
                </span>
              )}
              {publication.date && (
                <span className="flex items-center">
                  <Calendar size={12} className="mr-1" /> {publication.date}
                </span>
              )}
              {publication.author && (
                <span className="flex items-center">
                  <User size={12} className="mr-1" /> {publication.author}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white mb-8 font-light leading-tight">
              {publication.title}
            </h1>

            <div className="text-xl text-white/80 font-light leading-relaxed mb-12 italic border-l-2 border-gold pl-6">
              {publication.shortDescription}
            </div>

            <div className="prose prose-invert prose-lg max-w-none prose-headings:font-serif prose-headings:font-light prose-a:text-gold hover:prose-a:text-gold-light">
              {publication.content.split('\n').map((paragraph: string, index: number) => (
                <p key={index} className="text-white/70 font-light leading-relaxed mb-6">
                  {paragraph}
                </p>
              ))}
            </div>

            {(publication.attachmentUrl || publication.externalDocumentUrl) && (
              <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4">
                {publication.attachmentUrl && (
                  <Button asChild variant="outline" className="text-gold border-gold/50 hover:bg-gold/10 hover:text-gold">
                    <a href={publication.attachmentUrl} target="_blank" rel="noopener noreferrer" download>
                      <span className="mr-2">📄</span> Télécharger le document
                    </a>
                  </Button>
                )}
                {publication.externalDocumentUrl && (
                  <Button asChild variant="outline" className="text-white border-white/20 hover:bg-white/5">
                    <a href={publication.externalDocumentUrl} target="_blank" rel="noopener noreferrer">
                      <span className="mr-2">🌐</span> Consulter le document
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Section>
    </article>
  );
}
