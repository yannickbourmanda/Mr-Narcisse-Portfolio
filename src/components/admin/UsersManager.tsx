import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UserCheck, UserX, Trash2 } from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';

export default function UsersManager() {
  const [users, setUsers] = useState<any[]>([]);
  const { userData } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'users', id), { role: 'admin' });
      toast.success('Utilisateur approuvé avec succès.');
    } catch (error) {
      toast.error('Erreur lors de l\'approbation.');
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await updateDoc(doc(db, 'users', id), { role: 'pending_admin' });
      toast.success('Droits révoqués avec succès.');
    } catch (error) {
      toast.error('Erreur lors de la révocation.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      toast.success('Utilisateur supprimé.');
    } catch (error) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const oldestAdmin = users.filter(u => u.role === 'admin' || u.role === 'super_admin').sort((a, b) => {
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeA - timeB;
  })[0];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-serif text-gold mb-6">Gestion des Administrateurs</h1>
      <Card className="dark:bg-navy-light dark:text-white border-0">
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 border border-white/5 bg-navy-dark rounded">
                <div>
                  <h3 className="font-medium">{u.firstName} {u.lastName}</h3>
                  <p className="text-xs text-white/50">{u.email} - <span className={u.role === 'admin' ? 'text-green-500' : 'text-yellow-500'}>{u.role}</span></p>
                </div>
                <div className="flex gap-2">
                  {u.role === 'pending_admin' && (
                    <Button size="sm" variant="outline" className="text-green-500 border-green-500 hover:bg-green-500/10" onClick={() => handleApprove(u.id)}>
                      <UserCheck size={16} /> Approuver
                    </Button>
                  )}
                  {u.role === 'admin' && u.id !== userData?.uid && (
                    <Button size="sm" variant="outline" className="text-yellow-500 border-yellow-500 hover:bg-yellow-500/10" onClick={() => handleRevoke(u.id)}>
                      <UserX size={16} /> Révoquer
                    </Button>
                  )}
                  {u.id !== userData?.uid && (
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)}>
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
