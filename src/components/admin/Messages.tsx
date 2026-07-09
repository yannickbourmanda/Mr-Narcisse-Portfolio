import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PLATFORM_CONFIG } from '../../config/platform';
import { Trash2, CheckCircle, Circle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'contact_messages'), where('platformId', '==', PLATFORM_CONFIG.id));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setMessages(messagesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'contact_messages', id), {
        isRead: !currentStatus
      });
      toast.success(currentStatus ? 'Marqué comme non lu' : 'Marqué comme lu');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce message ?')) return;
    try {
      await deleteDoc(doc(db, 'contact_messages', id));
      toast.success('Message supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return <div>Chargement des messages...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-navy-dark dark:text-white">Messages de Contact</h1>
        <p className="text-slate-500 dark:text-white/60">Gérez les demandes reçues depuis le formulaire du site.</p>
      </div>

      <div className="bg-white dark:bg-navy-light border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 dark:border-white/10 hover:bg-transparent">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Expéditeur</TableHead>
              <TableHead>Sujet</TableHead>
              <TableHead className="max-w-[300px]">Message</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">Aucun message</TableCell>
              </TableRow>
            ) : (
              messages.map((message) => (
                <TableRow key={message.id} className={`border-b border-slate-200 dark:border-white/10 !bg-transparent ${!message.isRead ? 'font-bold' : 'text-slate-500 dark:text-white/60'}`}>
                  <TableCell>
                    <button onClick={() => toggleReadStatus(message.id, message.isRead)} className="text-gold hover:text-gold-dark transition-colors">
                      {message.isRead ? <CheckCircle size={18} /> : <Circle size={18} fill="currentColor" />}
                    </button>
                  </TableCell>
                  <TableCell>
                    {message.createdAt?.toDate().toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{message.name}</div>
                      <a href={`mailto:${message.email}`} className="text-xs text-blue-500 hover:underline font-normal">{message.email}</a>
                    </div>
                  </TableCell>
                  <TableCell>{message.subject}</TableCell>
                  <TableCell className="max-w-[300px] truncate" title={message.message}>
                    {message.message}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => deleteMessage(message.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
