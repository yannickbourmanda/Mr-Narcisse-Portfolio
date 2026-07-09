import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PLATFORM_CONFIG } from '../config/platform';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  type?: string;
}

export function SEO({ 
  title, 
  description, 
  keywords = "Portfolio, Consulting, Projets", 
  url = "https://bnnnasser.com", 
  type = "website" 
}: SEOProps) {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', PLATFORM_CONFIG.id), (docSnap) => {
      if (docSnap.exists()) setSettings(docSnap.data());
    });
    return () => unsub();
  }, []);

  const siteTitle = settings.siteTitle || 'Bandjim Narbe Narcisse Nasser';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const fullDescription = description || settings.seoDescription || "Entrepreneur, consultant et leader stratégique engagé.";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      {settings.logo && <meta property="og:image" content={settings.logo} />}
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={fullDescription} />
      {settings.logo && <meta property="twitter:image" content={settings.logo} />}
    </Helmet>
  );
}
