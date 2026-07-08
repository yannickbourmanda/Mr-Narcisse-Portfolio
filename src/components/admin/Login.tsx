import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/src/hooks/useAuth';
import { auth } from '@/src/config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const { user, userData, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success('Connexion réussie');
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('Identifiants incorrects');
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('Erreur réseau. Désactivez vos bloqueurs de publicité (Adblock) ou ouvrez l\'application dans un nouvel onglet pour des raisons de sécurité HTTPS.');
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('Authentification par email non activée dans Firebase.');
      } else {
        toast.error(`Erreur: ${error.message || 'Problème de connexion'}`);
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;
  if (user && userData) return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy p-4">
      <Card className="w-full max-w-md bg-white dark:bg-navy-light text-navy-dark dark:text-white border-slate-200 dark:border-white/10">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-serif">Administration</CardTitle>
          <CardDescription className="dark:text-white/70 text-slate-500">
            Connectez-vous pour gérer votre site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Email</label>
              <Input type="email" placeholder="admin@bnnnasser.com" {...register('email')} className="dark:border-white/10 dark:bg-navy-dark" autoComplete="email" />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Mot de passe</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password')} className="dark:border-white/10 dark:bg-navy-dark pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            
            <Button type="submit" className="w-full bg-gold hover:bg-gold-dark text-white" disabled={isSubmitting}>
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </Button>
            
            <div className="text-center mt-4 text-sm text-slate-500 dark:text-white/60">
              Pas encore de compte ?{' '}
              <Link to="/admin/setup" className="text-gold hover:underline">
                S'inscrire
              </Link>
            </div>
            
            {user && !userData && !loading && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg text-center">
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                  Votre compte n'a pas les permissions requises ou est en attente d'approbation.
                </p>
                <Button variant="outline" size="sm" onClick={() => auth.signOut()} className="w-full">
                  Se déconnecter
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
