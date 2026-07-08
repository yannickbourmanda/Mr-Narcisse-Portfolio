import React, { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Link } from 'react-router-dom';
import Section, { SectionHeader } from '../components/ui/Section';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PLATFORM_CONFIG } from '../config/platform';

const IconRenderer = ({ name, size = 48, className = "", strokeWidth = 1 }: { name: string, size?: number, className?: string, strokeWidth?: number }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Target;
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
};

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);

  useEffect(() => {
    const qServices = query(collection(db, 'services'), where('platformId', '==', PLATFORM_CONFIG.id));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(data.filter((s: any) => s.status !== 'inactive').sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
    });

    const qPubs = query(collection(db, 'publications'), where('platformId', '==', PLATFORM_CONFIG.id));
    const unsubPubs = onSnapshot(qPubs, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPublications(data.filter((p: any) => p.status === 'published').sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
    });

    return () => {
      unsubServices();
      unsubPubs();
    };
  }, []);

  return (
    <div className="pt-24 lg:pt-32">
      <Section bg="navy">
        <SectionHeader title="Mon Expertise" subtitle="Domaines d'expertise" centered />
        <div className="max-w-4xl mx-auto space-y-8">
          {services.map((service, i) => (
            <div key={i} className="group flex flex-col md:flex-row gap-8 lg:gap-12 items-start p-8 md:p-12 bg-navy-light border border-white/5 hover:border-gold/30 transition-all duration-500 relative overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-[1px] bg-gold scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"></div>
              <div className="shrink-0 text-gold/40 group-hover:text-gold transition-colors duration-500">
                <IconRenderer name={service.iconName || 'Target'} size={48} strokeWidth={1} />
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-serif text-white mb-4 font-light">{service.title}</h3>
                <p className="text-white/60 leading-relaxed text-sm md:text-base font-light whitespace-pre-wrap">{service.desc || service.description}</p>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="text-center text-white/50 py-12">Aucun service à afficher pour le moment.</div>
          )}
        </div>
      </Section>

      {/* Publications Section */}
      <Section bg="navy">
        <SectionHeader title="Publications" subtitle="Dernières parutions" centered />
        <div className="max-w-6xl mx-auto">
          {publications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publications.map((pub) => (
                <div key={pub.id} className="group bg-navy border border-white/5 overflow-hidden hover:border-gold/30 transition-all duration-500 flex flex-col">
                  {pub.image && (
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={pub.image} 
                        alt={pub.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-gold font-bold mb-4">
                      <span>{pub.date}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20"></span>
                      <span className="text-white/60">{pub.category}</span>
                    </div>
                    <h3 className="text-xl font-serif text-white mb-3 line-clamp-2 leading-snug">{pub.title}</h3>
                    <p className="text-sm text-white/60 mb-6 line-clamp-3 leading-relaxed flex-1">{pub.shortDescription}</p>
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
                      <span className="text-xs text-white/40">Par {pub.author}</span>
                      <Link 
                        to={`/publications/${pub.id}`} 
                        className="text-xs uppercase tracking-wider text-gold font-medium hover:text-white transition-colors"
                      >
                        Afficher la publication
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/50 py-12">Aucune publication à afficher pour le moment.</div>
          )}
        </div>
      </Section>
    </div>
  );
}
