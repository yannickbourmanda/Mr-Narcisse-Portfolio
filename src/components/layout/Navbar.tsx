import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Linkedin, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PLATFORM_CONFIG } from '../../config/platform';

const XIcon = ({ size = 12, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const NAV_LINKS = [
  { text: 'ACCUEIL', href: '/' },
  { text: 'À PROPOS', href: '/a-propos' },
  { text: 'PORTFOLIO', href: '/portfolio' },
  { text: 'BLOG', href: '/blog' },
  { text: 'SERVICES', href: '/services' },
  { text: 'CONTACT', href: '/contact' }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const docRef = doc(db, 'settings', PLATFORM_CONFIG.id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b border-white/10 ${
        scrolled ? 'bg-navy/95 backdrop-blur-md h-20 shadow-2xl' : 'bg-navy h-24'
      } flex items-center w-full`}
    >
      <div className="w-full px-6 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <a href="https://bn2smart.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-start group">
          {settings.logo ? (
             <img src={settings.logo} alt="Logo" className="h-8 md:h-10 object-contain" />
          ) : (
            <span className="font-serif text-2xl font-bold tracking-widest text-gold group-hover:text-white transition-colors duration-300">
              BN2 SMART
            </span>
          )}
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.2em] font-medium text-white/70">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`transition-colors duration-300 pb-1 ${
                  isActive ? 'text-gold border-b border-gold' : 'hover:text-white border-b border-transparent'
                }`}
              >
                {link.text}
              </Link>
            );
          })}
        </nav>

        {/* Social / Contact Header */}
        <div className="hidden lg:flex items-center gap-3">
          {settings.linkedin && <a href={settings.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[10px] text-white/70 hover:border-gold hover:text-gold transition-all"><Linkedin size={12} /></a>}
          {settings.twitter && <a href={settings.twitter} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[10px] text-white/70 hover:border-gold hover:text-gold transition-all"><XIcon size={12} /></a>}
          <div className="ml-4 bg-gold h-8 w-[1px] opacity-30"></div>
          {/* Language selector removed */}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-gold hover:border-gold transition-colors"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-full left-0 w-full bg-navy border-b border-white/10"
        >
          <div className="px-6 py-8 flex flex-col gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-[11px] uppercase tracking-[0.2em] font-medium pb-2 border-b ${
                  location.pathname === link.href ? 'text-gold border-gold' : 'text-white/70 border-white/10'
                }`}
              >
                {link.text}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </header>
  );
}
