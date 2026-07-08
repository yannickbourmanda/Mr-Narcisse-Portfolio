import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { MediaLibraryDialog } from './MediaLibraryDialog';

interface ImageUploadInputProps {
  folder: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function ImageUploadInput({ folder, value, onChange, placeholder = "URL de l'image...", required = false }: ImageUploadInputProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 group bg-slate-50 dark:bg-black/20 aspect-video flex items-center justify-center">
          <img src={value} alt="Preview" className="max-w-full max-h-full object-contain" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => setIsLibraryOpen(true)}>
              Changer
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={handleClear}>
              <X size={16} />
            </Button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => setIsLibraryOpen(true)}
          className={`border-2 border-dashed border-slate-200 dark:border-white/10 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors`}
        >
          <div className="bg-slate-100 dark:bg-white/10 p-3 rounded-full mb-3">
            <Upload className="h-6 w-6 text-slate-500 dark:text-white/50" />
          </div>
          <p className="text-sm font-medium text-navy-dark dark:text-white">Sélectionner une image</p>
          <p className="text-xs text-slate-500 dark:text-white/50 mt-1">Cliquez pour ouvrir la médiathèque</p>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        <span className="text-xs text-slate-400 uppercase">Ou</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            placeholder={placeholder} 
            className="pl-9 dark:bg-navy-dark dark:border-white/10"
            required={required && !value}
          />
        </div>
      </div>

      <MediaLibraryDialog 
        open={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        onSelect={onChange}
        folder={folder}
      />
    </div>
  );
}
