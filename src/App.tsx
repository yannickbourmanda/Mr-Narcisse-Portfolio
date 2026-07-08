import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import ReactGA from 'react-ga4';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './config/firebase';
import { PLATFORM_CONFIG } from './config/platform';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import ProjectDetail from './pages/ProjectDetail';
import Blog from './pages/Blog';
import ArticleDetail from './pages/ArticleDetail';
import Services from './pages/Services';
import PublicationDetail from './pages/PublicationDetail';
import Contact from './pages/Contact';

// Admin components
import AdminLogin from './components/admin/Login';
import ProtectedLayout from './components/layout/ProtectedLayout';
import AdminDashboard from './components/admin/Dashboard';
import AdminSetup from './components/admin/Setup';
import AdminMessages from './components/admin/Messages';
import AdminBlog from './components/admin/Blog';
import AdminPortfolio from './components/admin/Portfolio';
import AdminAbout from './components/admin/About';
import AdminHomeContent from './components/admin/HomeContent';
import AdminServices from './components/admin/ServicesManager';
import AdminPublications from './components/admin/PublicationsManager';
import AdminContactPage from './components/admin/ContactManager';
import AdminFooter from './components/admin/FooterManager';
import AdminMediaLibrary from './components/admin/MediaLibrary';
import AdminSettings from './components/admin/Settings';
import ActivitiesTracker from './components/admin/ActivitiesTracker';
import AdminUsers from './components/admin/UsersManager';


import { Toaster } from '@/components/ui/sonner';

function PageTracker({ trackingId }: { trackingId: string | null }) {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Track page view
    if (trackingId) {
      ReactGA.send({ hitType: "pageview", page: pathname });
    }
  }, [pathname, trackingId]);

  return null;
}

export default function App() {
  const [settings, setSettings] = useState<any>({
    siteTitle: 'Bandjim Narbe Narcisse Nasser',
    seoDescription: '',
    googleAnalyticsId: '',
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', PLATFORM_CONFIG.id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSettings(prev => ({...prev, ...data}));
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (settings.googleAnalyticsId) {
      ReactGA.initialize(settings.googleAnalyticsId);
    }
  }, [settings.googleAnalyticsId]);

  return (
    <HelmetProvider>
      <Helmet>
        <title>{settings.siteTitle}</title>
        <meta name="description" content={settings.seoDescription} />
      </Helmet>
      <BrowserRouter>
        <PageTracker trackingId={settings.googleAnalyticsId} />
        <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="a-propos" element={<About />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="portfolio/:id" element={<ProjectDetail />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:id" element={<ArticleDetail />} />
          <Route path="services" element={<Services />} />
          <Route path="publications/:id" element={<PublicationDetail />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        <Route path="/admin/setup" element={<AdminSetup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="home" element={<AdminHomeContent />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="publications" element={<AdminPublications />} />
          <Route path="portfolio" element={<AdminPortfolio />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="contact-page" element={<AdminContactPage />} />
          <Route path="footer" element={<AdminFooter />} />
          <Route path="media" element={<AdminMediaLibrary />} />
          <Route path="messages" element={<AdminMessages />} />
          
          <Route path="settings" element={<AdminSettings />} />
          <Route path="activities" element={<ActivitiesTracker />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
      <Toaster />
      </BrowserRouter>
    </HelmetProvider>
  );
}
