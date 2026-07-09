import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/src/config/firebase';
import { doc, setDoc, serverTimestamp, getDocs, collection } from 'firebase/firestore';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const setupSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  phone: z.string().min(8, 'Le numéro est requis'),
  birthDate: z.string().min(1, 'La date de naissance est requise'),
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});

type SetupForm = z.infer<typeof setupSchema>;

export default function AdminSetup() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
    defaultValues: { firstName: '', lastName: '', phone: '', birthDate: '', email: '', password: '' },
  });

  const onSubmit = async (data: SetupForm) => {
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Determine role based on existing users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const isFirstUser = usersSnapshot.empty;
      const assignedRole = isFirstUser ? 'admin' : 'pending_admin';

      // Assigner le rôle admin et enregistrer les infos
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        birthDate: data.birthDate,
        email: data.email,
        role: assignedRole,
        createdAt: serverTimestamp()
      });

      if (isFirstUser) {
        toast.success('Compte administrateur créé avec succès');
        navigate('/admin');
      } else {
        toast.success('Compte créé avec succès. En attente d\'approbation.');
        navigate('/admin/login');
      }
    } catch (error: any) {
      console.error('Setup error:', error);
      
      let errorMessage = 'Erreur lors de la création du compte';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cet email est déjà utilisé. Essayez de vous connecter.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'L\'authentification par email n\'est pas activée. Veuillez l\'activer dans votre console Firebase (Authentication > Sign-in methods).';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Connexion bloquée (HTTPS / IFrame). Veuillez cliquer sur l\'icône "Ouvrir dans un nouvel onglet" en haut à droite, ou désactiver votre Adblock.';
      } else {
        errorMessage = error.message || errorMessage;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy p-4 py-12">
      <Card className="w-full max-w-md bg-white dark:bg-navy-light text-navy-dark dark:text-white border-slate-200 dark:border-white/10">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-serif text-red-500">Création de Compte</CardTitle>
          <CardDescription className="dark:text-white/70 text-slate-500">
            Créez votre compte administrateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Prénom</label>
                <Input placeholder="John" {...register('firstName')} className="dark:border-white/10 dark:bg-navy-dark" autoComplete="given-name" />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Nom</label>
                <Input placeholder="Doe" {...register('lastName')} className="dark:border-white/10 dark:bg-navy-dark" autoComplete="family-name" />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Date de naissance</label>
                <Input type="date" {...register('birthDate')} className="dark:border-white/10 dark:bg-navy-dark" autoComplete="bday" />
                {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Numéro</label>
                <Input placeholder="+33 6..." {...register('phone')} className="dark:border-white/10 dark:bg-navy-dark" autoComplete="tel" />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Email</label>
              <Input type="email" placeholder="admin@bnnnasser.com" {...register('email')} className="dark:border-white/10 dark:bg-navy-dark" autoComplete="email" />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Mot de passe</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...register('password')} className="dark:border-white/10 dark:bg-navy-dark pr-10" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            
            <Button type="submit" className="w-full bg-gold hover:bg-gold-dark text-white" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer le compte'}
            </Button>
            
            <div className="text-center mt-4 text-sm text-slate-500 dark:text-white/60">
              Déjà un compte ?{' '}
              <Link to="/admin/login" className="text-gold hover:underline">
                Se connecter
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
