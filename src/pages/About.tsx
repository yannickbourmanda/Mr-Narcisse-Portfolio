import React, { useEffect, useState } from 'react';
import Section, { SectionHeader } from '../components/ui/Section';
import { collection, query, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PLATFORM_CONFIG } from '../config/platform';
import { Button } from '@/components/ui/button';
import { CVModal } from '../components/CVModal';
import { FileText } from 'lucide-react';

export default function About() {
  const [data, setData] = useState<any>({});
  const [timeline, setTimeline] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [cvData, setCvData] = useState<any>(null);
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);

  useEffect(() => {
    // Fetch CV
    const unsubCV = onSnapshot(doc(db, 'settings', 'cv'), (docSnap) => {
      if (docSnap.exists()) {
        setCvData(docSnap.data());
      } else {
        setCvData(null);
      }
    });

    // Fetch About
    const docRef = doc(db, 'about', PLATFORM_CONFIG.id);
    const unsubscribeAbout = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setData((prev: any) => ({ ...prev, ...docSnap.data() }));
      }
    });

    // Fetch Timeline
    const qTimeline = query(collection(db, 'timeline'));
    const unsubscribeTimeline = onSnapshot(qTimeline, (snapshot) => {
      if (!snapshot.empty) {
        const tData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => a.order - b.order);
        setTimeline(tData);
      }
    });

    // Fetch Skills
    const qSkills = query(collection(db, 'skills'));
    const unsubscribeSkills = onSnapshot(qSkills, (snapshot) => {
      const sData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => a.order - b.order);
      setSkills(sData);
    });

    // Fetch Languages
    const qLanguages = query(collection(db, 'languages'));
    const unsubscribeLanguages = onSnapshot(qLanguages, (snapshot) => {
      const lData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => a.order - b.order);
      setLanguages(lData);
    });

    return () => {
      unsubCV();
      unsubscribeAbout();
      unsubscribeTimeline();
      unsubscribeSkills();
      unsubscribeLanguages();
    };
  }, []);

  return (
    <div className="pt-24 lg:pt-32">
      <Section bg="navy">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            {data.profileImage && (
              <img 
                src={data.profileImage}
                alt="Bureau consulting" 
                className="w-full aspect-[4/5] object-cover"
              />
            )}
            <div className="absolute -inset-4 border border-gold/30 -z-10 translate-x-4 translate-y-4 hidden md:block" />
          </div>
          <div>
            <SectionHeader title="Qui suis-je ?" subtitle="À Propos" />
            {data.title && (
              <h2 className="text-xl md:text-2xl font-serif text-gold mb-6 font-medium leading-relaxed tracking-wide">
                {data.title}
              </h2>
            )}
            <p className="text-white/60 text-lg leading-relaxed mb-6 font-light whitespace-pre-wrap">
              {data.biography}
            </p>
            <p className="text-white/60 leading-relaxed mb-10 font-light whitespace-pre-wrap">
              {data.description}
            </p>
            
            {(data.vision || data.mission) && (
              <div className="flex flex-col gap-4 text-white/50 italic mb-8">
                {data.vision && <p><strong>Vision: </strong>{data.vision}</p>}
                {data.mission && <p><strong>Mission: </strong>{data.mission}</p>}
              </div>
            )}

            <div className="mt-12 pt-12 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex-1">
                {data.signatureImage && (
                  <img src={data.signatureImage} alt="Signature" className="h-16 object-contain mb-4 opacity-70" />
                )}
                <span className="font-serif text-4xl block text-white/20 italic mt-2">
                  {data.signatureText || 'B. Narbe Narcisse'}
                </span>
              </div>
              
              {cvData?.url && (
                <div className="md:-translate-y-2 shrink-0 w-full md:w-auto">
                  <Button 
                    onClick={() => setIsCVModalOpen(true)}
                    variant="outline" 
                    size="lg"
                    className="bg-navy-light text-white/70 border-white/10 hover:bg-gold/10 hover:border-gold/50 hover:text-gold text-lg px-8 h-14 w-full md:w-auto rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(212,175,55,0.2)]"
                  >
                    <FileText className="w-5 h-5 mr-3" />
                    Mon CV
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>
      <CVModal 
        isOpen={isCVModalOpen} 
        onClose={() => setIsCVModalOpen(false)} 
        cvUrl={cvData?.url} 
      />

      <Section bg="gray">
        <SectionHeader title="Mon Parcours" subtitle="Expérience" />
        <div className="max-w-4xl mx-auto space-y-16">
          
          {skills.length > 0 && (
            <div className="bg-navy border border-white/10 p-8 lg:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-[1px] bg-gold"></div>
              <div className="absolute top-0 right-0 h-16 w-[1px] bg-gold"></div>
              
              <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/50 mb-6 border-b border-white/10 pb-4 inline-block">Compétences Clés</h4>
              {data.skillsIntroduction && (
                <p className="text-white/60 text-sm leading-relaxed mb-8 font-light italic">
                  {data.skillsIntroduction}
                </p>
              )}
              <div className="flex flex-col gap-4">
                {skills.map((skill: any, i: number) => (
                  <div key={skill.id} className="flex items-center gap-4 group cursor-default">
                    <div className="w-8 h-8 rounded border border-white/10 bg-white/5 flex items-center justify-center shrink-0 group-hover:border-gold/50 group-hover:bg-gold/10 transition-all duration-300">
                      <span className="text-gold text-[10px] font-mono">{(i+1).toString().padStart(2, '0')}</span>
                    </div>
                    <span className="text-white/80 text-xs font-medium tracking-widest uppercase group-hover:text-gold transition-colors duration-300">
                      {skill.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {languages.length > 0 && (
            <div className="bg-navy border border-white/10 p-8 lg:p-10 relative overflow-hidden mt-8">
              <div className="absolute top-0 right-0 w-16 h-[1px] bg-gold"></div>
              <div className="absolute top-0 right-0 h-16 w-[1px] bg-gold"></div>
              
              <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/50 mb-8 border-b border-white/10 pb-4 inline-block">Langues</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {languages.map((lang: any, i: number) => (
                  <div key={lang.id} className="flex items-center gap-3 group cursor-default">
                    <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center shrink-0 group-hover:border-gold/50 group-hover:bg-gold/10 transition-all duration-300">
                      <span className="text-gold text-[10px] font-mono">{(i+1).toString().padStart(2, '0')}</span>
                    </div>
                    <span className="text-white/80 text-xs font-medium tracking-widest uppercase group-hover:text-gold transition-colors duration-300">
                      {lang.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-3xl lg:text-4xl font-serif text-white mb-8 font-light leading-tight">Un engagement constant vers l'excellence.</h3>
            
            {timeline.filter(item => !item.type || item.type === 'experience').length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/10">
                <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/50 mb-12">Chronologie Professionnelle</h4>
                
                <div className="space-y-12 relative before:absolute before:inset-0 before:ml-[5px] md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[1px] before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
                  {timeline.filter(item => !item.type || item.type === 'experience').map((item, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-3 h-3 rounded-full border border-gold bg-navy shrink-0 md:order-1 md:group-odd:-translate-x-[6px] md:group-even:translate-x-[6px] z-10">
                      </div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-2.5rem)] bg-navy-light p-8 border border-white/5 shadow-xl">
                        <div className="flex items-center justify-between flex-wrap mb-4">
                          <span className="text-gold font-bold text-[10px] tracking-[0.2em]">{item.startDate} {item.endDate ? `- ${item.endDate}` : '- Présent'}</span>
                        </div>
                        <h4 className="font-serif text-xl font-light text-white mb-2">{item.title}</h4>
                        {(item.company || item.status) && (
                          <div className="text-sm text-gold/80 mb-4 font-medium uppercase tracking-wider text-[10px]">
                            {item.company} {item.company && item.status && '·'} {item.status}
                          </div>
                        )}
                        <p className="text-white/50 text-sm leading-relaxed font-light whitespace-pre-wrap">{item.description}</p>
                        {item.result && (
                          <div className="mt-4 pt-4 border-t border-white/5">
                            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold mb-2 block">Résultat</span>
                            <p className="text-white/70 text-sm leading-relaxed font-light">{item.result}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {timeline.filter(item => item.type === 'education').length > 0 && (
              <div className="mt-16 pt-8 border-t border-white/10">
                <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/50 mb-12">Formation</h4>
                
                <div className="space-y-12 relative before:absolute before:inset-0 before:ml-[5px] md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[1px] before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
                  {timeline.filter(item => item.type === 'education').map((item, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-3 h-3 rounded-full border border-gold bg-navy shrink-0 md:order-1 md:group-odd:-translate-x-[6px] md:group-even:translate-x-[6px] z-10">
                      </div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-2.5rem)] bg-navy-light p-8 border border-white/5 shadow-xl">
                        <div className="flex items-center justify-between flex-wrap mb-4">
                          <span className="text-gold font-bold text-[10px] tracking-[0.2em]">{item.startDate} {item.endDate ? `- ${item.endDate}` : '- Présent'}</span>
                        </div>
                        <h4 className="font-serif text-xl font-light text-white mb-2">{item.title}</h4>
                        {(item.company || item.status) && (
                          <div className="text-sm text-gold/80 mb-4 font-medium uppercase tracking-wider text-[10px]">
                            {item.company} {item.company && item.status && '·'} {item.status}
                          </div>
                        )}
                        <p className="text-white/50 text-sm leading-relaxed font-light whitespace-pre-wrap">{item.description}</p>
                        {item.result && (
                          <div className="mt-4 pt-4 border-t border-white/5">
                            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold mb-2 block">Résultat</span>
                            <p className="text-white/70 text-sm leading-relaxed font-light">{item.result}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
