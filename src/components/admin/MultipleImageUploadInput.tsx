import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { MediaLibraryDialog } from './MediaLibraryDialog';

interface MultipleImageUploadInputProps {
  folder: string;
  urls: string[];
  onChange: (urls: string[]) => void;
}

export function MultipleImageUploadInput({ folder, urls, onChange }: MultipleImageUploadInputProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const removeImage = (indexToRemove: number) => {
    onChange(urls.filter((_, index) => index !== indexToRemove));
  };

  const toggleImage = (urlToToggle: string) => {
    if (urls.includes(urlToToggle)) {
      onChange(urls.filter(url => url !== urlToToggle));
    } else {
      onChange([...urls, urlToToggle]);
    }
  };

  const handleSelectMultiple = (newUrls: string[]) => {
    onChange([...urls, ...newUrls]);
  };

  return (
    <div className="space-y-4">
      {urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {urls.map((url, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 aspect-square bg-slate-50 dark:bg-black/20">
              <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button type="button" size="sm" variant="destructive" onClick={() => removeImage(index)} className="h-8 w-8 p-0 rounded-full">
                  <X size={14} />
                </Button>
              </div>
            </div>
          ))}
          
          <div 
            onClick={() => setIsLibraryOpen(true)}
            className={`border-2 border-dashed border-slate-200 dark:border-white/10 rounded-lg aspect-square flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors`}
          >
            <Upload className="h-6 w-6 text-slate-400 mb-2" />
            <span className="text-xs font-medium text-slate-500">Ajouter</span>
          </div>
        </div>
      )}

      {urls.length === 0 && (
        <div 
          onClick={() => setIsLibraryOpen(true)}
          className={`border-2 border-dashed border-slate-200 dark:border-white/10 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors`}
        >
          <div className="bg-slate-100 dark:bg-white/10 p-3 rounded-full mb-3">
            <Upload className="h-6 w-6 text-slate-500 dark:text-white/50" />
          </div>
          <p className="text-sm font-medium text-navy-dark dark:text-white">Ajouter des images à la galerie</p>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">Ouvrir la médiathèque pour sélectionner plusieurs images</p>
        </div>
      )}

      <MediaLibraryDialog 
        open={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        onSelect={toggleImage}
        multiple={true}
        onSelectMultiple={handleSelectMultiple}
        selectedUrls={urls}
        folder={folder}
      />
    </div>
  );
}
