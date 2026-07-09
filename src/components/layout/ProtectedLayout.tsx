import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/hooks/useAuth';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, FileText, Image, UserCircle, MessageSquare, LogOut, Moon, Sun, Activity, Home, Briefcase, Phone, Folder, Settings, Image as ImageIcon, UserCheck, PanelBottom } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProtectedLayout() {
  const { user, userData, loading, logout } = useAuth();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-navy-dark text-navy-dark dark:text-white font-serif text-2xl">Chargement...</div>;
  }

  if (!user || !userData || userData.role !== 'admin') {
    // Redirect non-admins or pending_admins
    if (user && userData && userData.role === 'pending_admin') {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center text-navy-dark dark:text-white bg-slate-50 dark:bg-navy p-4">
          <div className="max-w-md text-center space-y-4">
            <h2 className="text-2xl font-serif text-gold">En attente d'approbation</h2>
            <p className="text-slate-500 dark:text-white/70">
              Votre compte a été créé avec succès, mais il doit être approuvé par un administrateur principal avant de pouvoir accéder au tableau de bord.
            </p>
            <button onClick={logout} className="mt-4 px-6 py-2 bg-navy-dark dark:bg-white text-white dark:text-navy-dark rounded-md font-medium text-sm hover:opacity-90 transition-opacity">
              Se déconnecter
            </button>
          </div>
        </div>
      );
    }
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-navy-dark text-navy-dark dark:text-white">
        <Sidebar className="border-r border-slate-200 dark:border-white/10 dark:bg-navy-light text-navy-dark dark:text-white">
          <SidebarHeader className="p-4 border-b border-slate-200 dark:border-white/10">
            <h2 className="text-xl font-bold font-serif">Admin Panel</h2>
          </SidebarHeader>
          <SidebarContent className="p-2 space-y-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/admin')} className={`hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${isActive('/admin') ? 'bg-slate-100 dark:bg-white/10 font-semibold text-gold' : ''}`}>
                  <Link to="/admin" className="flex items-center gap-3">
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <div className="px-3 pt-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Website Content
              </div>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/admin/home')} className={`hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${isActive('/admin/home') ? 'bg-slate-100 dark:bg-white/10 font-semibold text-gold' : ''}`}>
                  <Link to="/admin/home" className="flex items-center gap-3">
                    <Home size={18} /> Accueil
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/admin/about')} className={`hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${isActive('/admin/about') ? 'bg-slate-100 dark:bg-white/10 font-semibold text-gold' : ''}`}>
                  <Link to="/admin/about" className="flex items-center gap-3">
                    <UserCircle size={18} /> À propos
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              

              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/admin/services')} className={`hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${isActive('/admin/services') ? 'bg-slate-100 dark:bg-white/10 font-semibold text-gold' : ''}`}>
                  <Link to="/admin/services" className="flex items-center gap-3">
                    <Briefcase size={18} /> Services
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/admin/publications')} className={`hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${isActive('/admin/publications') ? 'bg-slate-100 dark:bg-white/10 font-semibold text-gold' : ''}`}>
                  <Link to="/admin/publications" className="flex items-center gap-3">
                    <FileText size={18} /> Publications
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/admin/portfolio')} className={`hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${isActive('/admin/portfolio') ? 'bg-slate-100 dark:bg-white/10 font-semibold text-gold' : ''}`}>
                  <Link to="/admin/portfolio" className="flex items-center gap-3">
                    <Folder size={18} /> Portfolio
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/admin/blog')} className={`hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${isActive('/admin/blog') ? 'bg-slate-100 dark:bg-white/10 font-semibold text-gold' : ''}`}>
                  <Link to="/admin/blog" className="flex items-center gap-3">
                    <FileText size={18} /> Blog
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/admin/contact-page')} className={`hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${isActive('/admin/contact-page') ? 'bg-slate-100 dark:bg-white/10 font-semibold text-gold' : ''}`}>
                  <Link to="/admin/contact-page" className="flex items-center gap-3">
                    <Phone size={18} /> Page Contact
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/admin/footer')} className={`hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${isActive('/admin/footer') ? 'bg-slate-100 dark:bg-white/10 font-semibold text-gold' : ''}`}>
                  <Link to="/admin/footer" className="flex items-center gap-3">
                    <PanelBottom size={18} /> Pied de page
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <div className="px-3 pt-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-t border-slate-200 dark:border-white/10 mt-2">
                Gestion Globale
              </div>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/admin/users')} className={`hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${isActive('/admin/users') ? 'bg-slate-100 dark:bg-white/10 font-semibold text-gold' : ''}`}>
                  <Link to="/admin/users" className="flex items-center gap-3">
                    <UserCheck size={18} /> Administrateurs
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/admin/media')} className={`hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${isActive('/admin/media') ? 'bg-slate-100 dark:bg-white/10 font-semibold text-gold' : ''}`}>
                  <Link to="/admin/media" className="flex items-center gap-3">
                    <ImageIcon size={18} /> Médiathèque
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/admin/messages')} className={`hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${isActive('/admin/messages') ? 'bg-slate-100 dark:bg-white/10 font-semibold text-gold' : ''}`}>
                  <Link to="/admin/messages" className="flex items-center gap-3">
                    <MessageSquare size={18} /> Messages
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/admin/activities')} className={`hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${isActive('/admin/activities') ? 'bg-slate-100 dark:bg-white/10 font-semibold text-gold' : ''}`}>
                  <Link to="/admin/activities" className="flex items-center gap-3">
                    <Activity size={18} /> Activités
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/admin/settings')} className={`hover:bg-slate-100 dark:hover:bg-white/10 transition-colors ${isActive('/admin/settings') ? 'bg-slate-100 dark:bg-white/10 font-semibold text-gold' : ''}`}>
                  <Link to="/admin/settings" className="flex items-center gap-3">
                    <Settings size={18} /> Paramètres
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem className="mt-4 border-t border-slate-200 dark:border-white/10 pt-4">
                <SidebarMenuButton onClick={toggleTheme} className="flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                  <span>{isDarkMode ? "Mode Jour" : "Mode Nuit"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem className="mt-2">
                <SidebarMenuButton onClick={logout} className="flex items-center gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                  <LogOut size={18} /> Déconnexion
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        
        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
