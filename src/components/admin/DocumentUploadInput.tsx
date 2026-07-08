import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploadInputProps {
  folder: string;
  value: string;
  onChange: (url: string) => void;
  fileName?: string;
  onFileNameChange?: (name: string) => void;
}

export function DocumentUploadInput({ folder, value, onChange, fileName, onFileNameChange }: DocumentUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    if (onFileNameChange) onFileNameChange('');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.zip'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      toast.error(`Format non supporté. Formats acceptés : ${validExtensions.join(', ')}`);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 20 Mo');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const { uploadToCloudinary } = await import('../../services/cloudinary');
      const result = await uploadToCloudinary(file, folder, setUploadProgress);
      
      onChange(result.secure_url);
      if (onFileNameChange) onFileNameChange(file.name);
      toast.success('Document téléversé avec succès');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Erreur lors du téléversement');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-black/20 rounded-lg border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div className="truncate">
              <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                {fileName || 'Document joint'}
              </p>
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                Voir le document
              </a>
            </div>
          </div>
          <Button type="button" size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 shrink-0" onClick={handleClear}>
            <X size={16} />
          </Button>
        </div>
      ) : (
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-slate-200 dark:border-white/10 rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5'}`}
        >
          {isUploading ? (
            <>
              <Loader2 size={24} className="text-slate-400 mb-2 animate-spin" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Téléversement... {uploadProgress}%</p>
            </>
          ) : (
            <>
              <Upload size={24} className="text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Ajouter un document</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF, DOC, PPT, XLS, ZIP (Max 20 Mo)</p>
            </>
          )}
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
      />
    </div>
  );
}
