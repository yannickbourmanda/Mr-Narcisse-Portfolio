import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import Section, { SectionHeader } from '../components/ui/Section';
import Button from '../components/ui/Button';
import { collection, query, onSnapshot, where, doc, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PLATFORM_CONFIG } from '../config/platform';
import { SEO } from '../components/SEO';

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);
  const [homeServices, setHomeServices] = useState<any[]>([]);
  const [homeData, setHomeData] = useState<any>({
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
      { num: "15+", label: "Années d'expérience" },
      { num: "50+", label: "Projets réalisés" },
      { num: "30+", label: "Partenaires mondiaux" },
      { num: "10+", label: "Pays d'intervention" }
    ]
  });

  useEffect(() => {
    // Projects
    const q = query(collection(db, 'projects'), where('platformId', '==', PLATFORM_CONFIG.id));
    const unsubscribeProjects = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((p: any) => p.status !== 'draft')
      .sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)).slice(0, 2);
      setFeaturedProjects(projectsData);
    });

    // Home data
    const docRef = doc(db, 'homepage', PLATFORM_CONFIG.id);
    const unsubscribeHome = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setHomeData((prev: any) => ({
          hero: { ...prev.hero, ...data.hero },
          statistics: data.statistics || prev.statistics
        }));
      }
    });

    // Services
    const sQuery = query(collection(db, 'services'), where('platformId', '==', PLATFORM_CONFIG.id));
    const unsubscribeServices = onSnapshot(sQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((s: any) => s.status === 'active');
        setHomeServices(data.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0,3));
    });

    return () => {
      unsubscribeProjects();
      unsubscribeHome();
      unsubscribeServices();
    };
  }, []);

  const displayProjects = featuredProjects.map(p => ({ 
    id: p.id, 
    tag: p.categoryId || 'Projet', 
    title: p.title, 
    img: p.coverImage || '' 
  }));

  return (
    <>
      <SEO 
        title="Accueil" 
        description="Bienvenue sur le portfolio de Bandjim Narbe Narcisse Nasser, expert en conseil stratégique et développement durable." 
      />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-navy overflow-hidden">
        {/* Geometric central line */}
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/5 hidden lg:block pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full py-32 lg:py-0">
          <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-7 relative z-10 order-2 lg:order-1"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-[1px] bg-gold hidden md:block"></div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">
                  {homeData.hero.overtitle}
                </span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-serif text-white font-light mb-8 leading-[0.95] tracking-tight">
                {homeData.hero.title} <br />
                <span className="text-gold italic pr-2">
                  {homeData.hero.subtitle}
                </span>
              </h1>
              
              <p className="text-lg text-white/50 font-light mb-12 max-w-xl leading-relaxed whitespace-pre-wrap">
                {homeData.hero.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <Button href={homeData.hero.primaryButtonLink} variant="primary" size="lg">
                  {homeData.hero.primaryButtonText}
                </Button>
                <Button href={homeData.hero.secondaryButtonLink} variant="ghost" className="flex items-center gap-4">
                  <span className="text-white/60 group-hover:text-gold tracking-[0.2em] uppercase text-xs font-bold">{homeData.hero.secondaryButtonText}</span>
                  <span className="text-gold">→</span>
                </Button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="lg:col-span-5 h-full flex items-center justify-end relative order-1 lg:order-2"
            >
              <div className="relative w-full max-w-[340px] h-[480px] mx-auto lg:mr-0 lg:ml-auto">
                <div className="absolute -top-6 -right-6 w-full h-full border border-gold/20 z-0"></div>
                <div className="absolute inset-0 bg-navy-light z-10 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-gold/30 via-transparent to-navy/60 z-20 mix-blend-overlay"></div>
                  <div className="text-gold/10 text-[6rem] sm:text-[8rem] font-serif select-none leading-[0.8] absolute flex flex-col items-center">
                    <span>BN2</span>
                    <span className="text-[4rem] sm:text-[5rem] tracking-widest">SMART</span>
                  </div>
                  {homeData.hero.image && (
                    <img 
                      src={homeData.hero.image}
                      alt="Portrait" 
                      className="w-full h-full object-cover relative z-10 opacity-90 hover:opacity-100 transition-all duration-700"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-navy via-navy/80 to-transparent z-20"></div>
                </div>
                
                {/* Expertise floating geometric card */}
                <div className="absolute -bottom-8 -left-8 md:-left-12 z-30 bg-navy border border-gold/30 p-6 md:p-8 shadow-2xl">
                  <p className="text-[10px] text-gold font-bold uppercase tracking-[0.3em] mb-2">Expertise</p>
                  <p className="text-xs text-white/80 leading-relaxed max-w-[200px] whitespace-pre-wrap">
                    {homeData.hero.expertiseText}
                  </p>
                </div>
                
                {/* Side geometric line */}
                <div className="absolute top-1/2 -right-12 -translate-y-1/2 flex-col gap-12 z-20 hidden lg:flex">
                  <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-gold to-transparent"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-navy border-t border-white/5 py-16 px-6 lg:px-12 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-wrap lg:flex-nowrap justify-between items-center gap-8 md:gap-16">
          {homeData.statistics.map((stat: any, i: number) => (
            <React.Fragment key={i}>
              <div className="flex flex-col flex-1 text-center lg:text-left">
                <span className="text-4xl lg:text-5xl font-light text-gold font-serif mb-2">{stat.num}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">{stat.label}</span>
              </div>
              {i < homeData.statistics.length - 1 && <div className="hidden lg:block w-[1px] h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* About Preview */}
      <section className="bg-navy-light py-24 px-6 lg:px-12 border-t border-white/5 relative z-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-[1px] bg-gold"></div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">{homeData.aboutPreview?.overtitle || "Introduction"}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-8 leading-tight">
              {homeData.aboutPreview?.titlePart1 || "Une vision portée par "} <span className="font-semibold text-gold">{homeData.aboutPreview?.titleHighlight || "l'action et l'engagement"}</span>
            </h2>
            <p className="text-white/80 leading-relaxed text-lg font-light mb-6 italic">
              {homeData.aboutPreview?.quote}
            </p>
            <p className="text-white/60 leading-relaxed mb-8 whitespace-pre-wrap">
              {homeData.aboutPreview?.text}
            </p>
            <Button href={homeData.aboutPreview?.buttonLink || "/a-propos"} variant="outline">{homeData.aboutPreview?.buttonText || "Lire mon parcours"}</Button>
          </div>
          <div className="relative">
            {homeData.aboutPreview?.image && (
              <img src={homeData.aboutPreview.image} alt="About preview" className="w-full aspect-square object-cover opacity-80" />
            )}
            <div className="absolute -inset-4 border border-gold/30 -z-10 translate-x-4 translate-y-4 hidden md:block" />
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <Section bg="gray">
        <SectionHeader title={homeData.servicesPreview?.title || "Domaines d'Expertise"} subtitle={homeData.servicesPreview?.overtitle || "Services"} centered />
        <div className="grid md:grid-cols-3 gap-8">
          {homeServices.map((service, i) => {
             const Icon = (LucideIcons as any)[service.iconName || 'Target'] || LucideIcons.Target;
             return (
             <div key={i} className="bg-navy-dark p-10 border border-white/5 hover:border-gold/50 shadow-sm transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                <Icon className="w-10 h-10 text-gold mb-8 opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth={1} />
                <h3 className="text-2xl font-serif text-white mb-4">{service.title}</h3>
                <p className="text-white/50 leading-relaxed mb-8 font-light text-sm line-clamp-3">{service.description}</p>
                <Link to="/services" className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase hover:text-gold flex items-center transition-colors pb-1 border-b border-transparent hover:border-gold w-fit inline-flex mt-auto">
                  Découvrir
                </Link>
             </div>
             );
          })}
        </div>
        <div className="text-center mt-16">
           <Button href={homeData.servicesPreview?.buttonLink || "/services"} variant="outline">{homeData.servicesPreview?.buttonText || "Voir toutes mes expertises"}</Button>
        </div>
      </Section>

      {/* Portfolio Preview */}
      <Section bg="navy">
        <SectionHeader title={homeData.portfolioPreview?.title || "Mes Projets Principaux"} subtitle={homeData.portfolioPreview?.overtitle || "Portfolio"} />
        {displayProjects.length === 0 ? (
           <p className="text-white/50 italic mb-16">Aucun projet à afficher pour le moment.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {displayProjects.map((project, i) => (
              <Link to={`/portfolio/${project.id || ''}`} key={i} className="group relative overflow-hidden block aspect-[4/3] border border-white/5">
                <div className="absolute inset-0 bg-navy/60 group-hover:bg-navy/20 mix-blend-multiply z-10 transition-colors duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/40 to-transparent z-10" />
                <img src={project.img} alt={project.title} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20">
                  <span className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block">{project.tag}</span>
                  <h3 className="text-3xl font-serif text-white leading-tight">{project.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="flex justify-start">
          <Button href={homeData.portfolioPreview?.buttonLink || "/portfolio"} variant="secondary">{homeData.portfolioPreview?.buttonText || "Voir Tous Les Projets"}</Button>
        </div>
      </Section>

    </>
  );
}
