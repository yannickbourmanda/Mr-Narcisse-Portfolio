import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { PLATFORM_CONFIG } from '../../config/platform';
import { doc, onSnapshot, collection, query } from 'firebase/firestore';
import { db } from '../../config/firebase';

const XIcon = ({ size = 14, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();
  const [settings, setSettings] = useState<any>({});
  const [contactData, setContactData] = useState<any>({});
  const [aboutData, setAboutData] = useState<any>({});
  const [socialLinks, setSocialLinks] = useState<any[]>([]);

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', PLATFORM_CONFIG.id), (docSnap) => {
      if (docSnap.exists()) setSettings(docSnap.data());
    });
    const unsubContact = onSnapshot(doc(db, 'contact_page', PLATFORM_CONFIG.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data) setContactData(prev => ({...prev, ...data}));
      }
    });
    const unsubAbout = onSnapshot(doc(db, 'about', PLATFORM_CONFIG.id), (docSnap) => {
      if (docSnap.exists()) setAboutData(docSnap.data());
    });
    const unsubSocial = onSnapshot(query(collection(db, 'social_links')), (snapshot) => {
      const sData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => a.order - b.order)
        .filter((s: any) => s.location === 'footer' || s.location === 'both');
      setSocialLinks(sData);
    });

    return () => {
      unsubSettings();
      unsubContact();
      unsubAbout();
      unsubSocial();
    };
  }, []);

  const getSocialIcon = (platform: string, size = 14) => {
    switch(platform) {
      case 'LinkedIn': return <Linkedin size={size} />;
      case 'Facebook': return <Facebook size={size} />;
      case 'X/Twitter': return <XIcon size={size} />;
      case 'WhatsApp': return <MessageCircle size={size} />;
      case 'Instagram': return <Instagram size={size} />;
      default: return <ArrowUpRight size={size} />;
    }
  };

  return (
    <footer className="bg-navy-dark border-t border-white/5 py-16 px-6 lg:px-12 shrink-0">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6 lg:col-span-1">
            <Link to="/" className="inline-block group border-b border-transparent">
               {settings.logo ? (
                  <img src={settings.logo} alt="Logo" className="h-8 md:h-10 object-contain" />
               ) : (
                  <span className="font-serif text-3xl font-bold tracking-widest text-gold group-hover:text-white transition-colors">
                    BN2 SMART
                  </span>
               )}
            </Link>
            <p className="text-white/40 text-xs leading-relaxed max-w-sm tracking-wide line-clamp-3">
              {contactData.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/70 mb-8 border-b border-white/10 pb-4 inline-block">Navigation</h4>
            <ul className="space-y-4 text-xs font-medium text-white/50">
              <li><Link to="/a-propos" className="hover:text-gold transition-colors flex items-center group">À Propos <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" /></Link></li>
              <li><Link to="/portfolio" className="hover:text-gold transition-colors flex items-center group">Portfolio <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" /></Link></li>
              <li><Link to="/services" className="hover:text-gold transition-colors flex items-center group">Services <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" /></Link></li>
              <li><Link to="/blog" className="hover:text-gold transition-colors flex items-center group">Blog <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" /></Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors flex items-center group">Contact <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" /></Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/70 mb-8 border-b border-white/10 pb-4 inline-block">Contact</h4>
            <ul className="space-y-4 text-xs font-medium text-white/50">
              <li className="flex items-start">
                <span className="whitespace-pre-wrap">{contactData.address}</span>
              </li>
              <li className="flex items-center pt-2">
                <a href={contactData.phone ? `tel:${contactData.phone.replace(/[^0-9+]/g, '')}` : '#'} className="hover:text-gold transition-colors">{contactData.phone}</a>
              </li>
              <li className="flex items-center">
                <a href={`mailto:${contactData.email}`} className="hover:text-gold transition-colors text-gold break-all">{contactData.email}</a>
              </li>
            </ul>
          </div>

          {/* Social & Signature */}
          <div className="flex flex-col justify-between h-full space-y-6 lg:space-y-0 lg:col-span-1">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/70 mb-8 border-b border-white/10 pb-4 inline-block">Suivez-moi</h4>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a key={social.id} href={social.url} target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-white/50 hover:bg-white hover:text-navy-dark transition-colors">
                    {getSocialIcon(social.platform, 14)}
                  </a>
                ))}
              </div>
            </div>

            {PLATFORM_CONFIG.type === 'portfolio' && (
              <div className="flex flex-col items-start justify-start lg:justify-start mt-auto pt-8">
                <div className="text-left">
                  <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] mb-4">Signature</div>
                  {aboutData.signatureImage && (
                    <img src={aboutData.signatureImage} alt="Signature" className="h-10 object-contain opacity-70" />
                  )}
                </div>
                <div className="text-sm text-white/40 italic font-serif mt-4">
                  {settings.siteTitle || 'B. Narbe Narcisse'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-white/30 space-y-4 md:space-y-0">
          <p>© {year} {settings.siteTitle || 'Bandjim Narbe Narcisse Nasser'}.</p>
          <div className="flex space-x-8">
            <Link to="#" className="hover:text-gold transition-colors">Mentions Légales</Link>
            <Link to="#" className="hover:text-gold transition-colors">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
