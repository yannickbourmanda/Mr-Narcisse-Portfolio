import React, { useEffect, useState } from 'react';
import { subscribeToActivities, Activity } from '../../services/activityService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity as ActivityIcon, Edit, Plus, Trash2, Database, MessageSquare } from 'lucide-react';

export default function ActivitiesTracker() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToActivities((data) => {
      setActivities(data);
    }, 100);

    return () => unsubscribe();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <Plus size={16} className="text-green-500" />;
      case 'UPDATE': return <Edit size={16} className="text-blue-500" />;
      case 'DELETE': return <Trash2 size={16} className="text-red-500" />;
      default: return <ActivityIcon size={16} className="text-slate-500" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'CREATE': return 'ajouté';
      case 'UPDATE': return 'modifié';
      case 'DELETE': return 'supprimé';
      default: return 'modifié';
    }
  };

  const getResourceText = (resource: string) => {
    switch (resource) {
      case 'PROJECT': return 'Le projet';
      case 'ARTICLE': return "L'article";
      case 'MESSAGE': return 'Le message';
      default: return 'La ressource';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-navy-dark dark:text-white">Historique d'Activité</h1>
          <p className="text-slate-500 dark:text-white/60">Suivez toutes les actions récentes effectuées sur la plateforme.</p>
        </div>
      </div>

      <Card className="bg-white dark:bg-navy-light border-slate-200 dark:border-white/10">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-white/50">
                <Database className="mx-auto mb-3 opacity-20 h-8 w-8" />
                <p>Aucune activité récente.</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <div className="bg-slate-100 dark:bg-black/20 p-2 rounded-full">
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-navy-dark dark:text-white">
                      <strong>{getResourceText(activity.resourceType)}</strong> "{activity.resourceName}" a été <span className="font-medium">{getActionText(activity.action)}</span>.
                    </p>
                    <p className="text-xs text-slate-500 dark:text-white/40 mt-1">
                      {activity.timestamp ? format(activity.timestamp.toDate(), 'd MMMM yyyy à HH:mm', { locale: fr }) : "A l'instant"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
