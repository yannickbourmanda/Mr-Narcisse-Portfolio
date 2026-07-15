import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Linkedin, Facebook, MessageCircle, Instagram, ArrowUpRight } from 'lucide-react';
import Section, { SectionHeader } from '../components/ui/Section';
import Button from '../components/ui/Button';
import { addDoc, collection, serverTimestamp, doc, onSnapshot, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PLATFORM_CONFIG } from '../config/platform';
import { toast } from 'sonner';
import { SEO } from '../components/SEO';

const XIcon = ({ size = 18, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const getSocialIcon = (platform: string, size = 18) => {
  switch(platform) {
    case 'LinkedIn': return <Linkedin size={size} />;
    case 'Facebook': return <Facebook size={size} />;
    case 'X/Twitter': return <XIcon size={size} />;
    case 'WhatsApp': return <MessageCircle size={size} />;
    case 'Instagram': return <Instagram size={size} />;
    default: return <ArrowUpRight size={size} />;
  }
};

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formLoadTime, setFormLoadTime] = useState<number>(0);
  const [settings, setSettings] = useState<any>({});
  const [contactData, setContactData] = useState<any>({});
  const [socialLinks, setSocialLinks] = useState<any[]>([]);

  useEffect(() => {
    setFormLoadTime(Date.now());
    
    const unsubContact = onSnapshot(doc(db, 'contact_page', PLATFORM_CONFIG.id), (docSnap) => {
      if (docSnap.exists()) {
        setContactData(docSnap.data());
      }
    });
    const unsubSettings = onSnapshot(doc(db, 'settings', PLATFORM_CONFIG.id), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    });
    const unsubSocial = onSnapshot(query(collection(db, 'social_links')), (snapshot) => {
      const sData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => a.order - b.order)
        .filter((s: any) => s.location === 'contact' || s.location === 'both');
      setSocialLinks(sData);
    });
    return () => {
      unsubContact();
      unsubSettings();
      unsubSocial();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    // 1. Honeypot anti-spam check (visually hidden field)
    if (formData.get('phone_optional')) {
      console.warn("Bot detected via honeypot");
      toast.success('Votre message a été transmis avec succès.'); // Fake success for bots
      setIsSubmitting(false);
      return;
    }

    // 2. Time-based spam check (forms submitted in < 3 seconds are usually bots)
    if (Date.now() - formLoadTime < 3000) {
      console.warn("Bot detected via time check");
      toast.success('Votre message a été transmis avec succès.'); // Fake success
      setIsSubmitting(false);
      return;
    }

    // 3. Simple Rate Limiting via localStorage
    const lastSubmit = localStorage.getItem('lastContactSubmit');
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < 60000) {
      toast.error('Veuillez patienter une minute avant d\'envoyer un autre message.');
      setIsSubmitting(false);
      return;
    }

    const data = {
      platformId: PLATFORM_CONFIG.id || "unknown",
      firstName: formData.get('firstName') as string || "",
      lastName: formData.get('lastName') as string || "",
      email: formData.get('email') as string || "",
      subject: formData.get('subject') as string || "",
      message: formData.get('message') as string || "",
      name: `${formData.get('firstName') || ""} ${formData.get('lastName') || ""}`,
      isRead: false,
      createdAt: serverTimestamp()
    };

    try {
      console.log("Submitting form data:", data);
      // 1. Sauvegarde dans la base de données (CMS)
      const docRef = await addDoc(collection(db, 'contact_messages'), data);
      console.log("Document successfully written with ID:", docRef.id);

      // 2. Envoi de l'email automatique via l'API Node.js
      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      } catch (emailError) {
        // Nous n'empêchons pas le succès formel si seul l'email échoue (souvent dû à l'absence de clé API en dev)
        console.warn("L'email n'a pas pu être envoyé, mais le message est sauvegardé dans le CMS :", emailError);
      }

      // Enregistrer le timestamp pour le rate limiting
      localStorage.setItem('lastContactSubmit', Date.now().toString());

      toast.success('Votre message a été transmis avec succès.');
      e.currentTarget.reset();
    } catch (error) {
      console.error(error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 lg:pt-32">
      <SEO 
        title="Contact" 
        description="Contactez Bandjim Narbe Narcisse Nasser pour discuter de conseil stratégique, de partenariats ou de nouvelles opportunités de développement." 
      />
      <Section bg="navy">
        <SectionHeader title="Travaillons Ensemble" subtitle="Contact" />
        
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Form */}
          <div className="bg-navy-light p-8 lg:p-12 border border-white/5 relative">
            <div className="absolute top-0 right-0 w-16 h-[1px] bg-gold"></div>
            <div className="absolute top-0 right-0 h-16 w-[1px] bg-gold"></div>
            
            <h3 className="text-2xl font-serif text-white mb-8 font-light">Envoyer un message</h3>
            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Honeypot field - visually hidden, not display:none to fool bots better */}
              <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
                <input type="text" name="phone_optional" tabIndex={-1} autoComplete="off" defaultValue="" />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 pb-2">
                <div>
                  <label htmlFor="firstName" className="block text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-3">Prénom</label>
                  <input type="text" id="firstName" name="firstName" maxLength={50} className="w-full bg-navy border-b border-white/20 px-0 py-3 text-white focus:outline-none focus:border-gold transition-all" required />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-3">Nom</label>
                  <input type="text" id="lastName" name="lastName" maxLength={50} className="w-full bg-navy border-b border-white/20 px-0 py-3 text-white focus:outline-none focus:border-gold transition-all" required />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-3">Email Professionnel</label>
                <input type="email" id="email" name="email" maxLength={100} className="w-full bg-navy border-b border-white/20 px-0 py-3 text-white focus:outline-none focus:border-gold transition-all" required />
              </div>

              <div>
                <label htmlFor="subject" className="block text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-3">Objet</label>
                <select id="subject" name="subject" className="w-full bg-navy border-b border-white/20 px-0 py-3 text-white/70 focus:outline-none focus:border-gold transition-all appearance-none rounded-none" required>
                  <option value="">Sélectionnez un sujet</option>
                  <option value="consulting">Demande de Consulting</option>
                  <option value="partenariat">Proposition de Partenariat</option>
                  <option value="intervention">Intervention / Conférence</option>
                  <option value="autre">Autre demande</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-3">Message</label>
                <textarea id="message" name="message" rows={4} maxLength={2000} className="w-full bg-navy border-b border-white/20 px-0 py-3 text-white focus:outline-none focus:border-gold transition-all resize-none" required></textarea>
              </div>

              <div className="pt-4">
                <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Envoi...' : 'Envoyer'}
                </Button>
              </div>
            </form>
          </div>

          {/* Contact Details */}
          <div className="space-y-16">
            <div>
              <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/50 mb-8 border-b border-white/10 pb-4 inline-block">{contactData.title}</h3>
              <p className="text-white/60 mb-10 leading-relaxed font-light text-sm whitespace-pre-wrap">
                {contactData.description}
              </p>
              
              <ul className="space-y-8">
                {contactData.address && (
                  <li className="flex items-start group">
                    <div className="w-10 h-10 border border-white/10 flex items-center justify-center shrink-0 text-gold group-hover:border-gold transition-colors">
                      <MapPin size={16} strokeWidth={1.5} />
                    </div>
                    <div className="ml-6">
                      <span className="block text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase mb-2">Bureau Principal</span>
                      <span className="text-white font-light whitespace-pre-wrap">{contactData.address}</span>
                    </div>
                  </li>
                )}
                
                {contactData.phone && (
                  <li className="flex items-start group">
                    <div className="w-10 h-10 border border-white/10 flex items-center justify-center shrink-0 text-gold group-hover:border-gold transition-colors">
                      <Phone size={16} strokeWidth={1.5} />
                    </div>
                    <div className="ml-6">
                      <span className="block text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase mb-2">Téléphone</span>
                      <a href={`tel:${contactData.phone.replace(/[^0-9+]/g, '')}`} className="text-white font-light hover:text-gold transition-colors">{contactData.phone}</a>
                    </div>
                  </li>
                )}

                {contactData.email && (
                  <li className="flex items-start group">
                    <div className="w-10 h-10 border border-white/10 flex items-center justify-center shrink-0 text-gold group-hover:border-gold transition-colors">
                      <Mail size={16} strokeWidth={1.5} />
                    </div>
                    <div className="ml-6">
                      <span className="block text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase mb-2">Email</span>
                      <a href={`mailto:${contactData.email}`} className="text-white font-light hover:text-gold transition-colors">{contactData.email}</a>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a key={social.id} href={social.url} target="_blank" rel="noreferrer" className="flex items-center justify-center w-12 h-12 border border-white/10 text-white/50 hover:bg-white hover:text-navy-dark transition-colors">
                  {getSocialIcon(social.platform, 18)}
                </a>
              ))}
            </div>
            
          </div>
        </div>
      </Section>
    </div>
  );
}
