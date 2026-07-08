import React, { useState, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Upload, ImageIcon, Check, Folder, ChevronLeft, Loader2 } from 'lucide-react';
import { useMedia } from '../../hooks/useMedia';
import { uploadToCloudinary } from '../../services/cloudinary';
import { toast } from 'sonner';

interface MediaLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  multiple?: boolean;
  onSelectMultiple?: (urls: string[]) => void;
  selectedUrls?: string[];
  folder?: string;
}

export function MediaLibraryDialog({ open, onOpenChange, onSelect, multiple, onSelectMultiple, selectedUrls = [], folder }: MediaLibraryDialogProps) {
  const { media, loading } = useMedia();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPath, setCurrentPath] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      const newUrls: string[] = [];
      const total = files.length;
      
      const targetFolder = folder || currentPath || 'media';

      for(let i=0; i<files.length; i++) {
        const newMedia = await uploadToCloudinary(files[i], targetFolder);
        newUrls.push(newMedia.url);
        setUploadProgress(Math.round(((i + 1) / total) * 100));
      }
      
      toast.success(`${files.length} image(s) ajoutée(s)`);
      if (!multiple) {
        onSelect(newUrls[0]);
        onOpenChange(false);
      } else {
        if (onSelectMultiple) {
          onSelectMultiple(newUrls);
        } else {
          onSelect(newUrls[0]);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleSelect = (url: string) => {
    if (!multiple) {
      onSelect(url);
      onOpenChange(false);
    } else {
      onSelect(url);
    }
  };

  // Build folder structure
  const { folders, files } = useMemo(() => {
    const currentFolders = new Set<string>();
    const currentFiles: any[] = [];
    
    // If searching, ignore folders and just show all matching files
    if (searchTerm) {
      const filtered = media.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (m.folder && m.folder.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      return { folders: [], files: filtered };
    }

    media.forEach(file => {
      const fileFolder = file.folder || '';
      
      if (fileFolder === currentPath || fileFolder === currentPath.replace(/\/$/, '')) {
        // File is exactly in current directory
        currentFiles.push(file);
      } else if (fileFolder.startsWith(currentPath ? currentPath + '/' : '')) {
        // File is in a subdirectory
        const remainingPath = currentPath ? fileFolder.substring(currentPath.length + 1) : fileFolder;
        const nextFolder = remainingPath.split('/')[0];
        if (nextFolder) {
          currentFolders.add(nextFolder);
        }
      }
    });

    return { 
      folders: Array.from(currentFolders).sort(), 
      files: currentFiles.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)) 
    };
  }, [media, currentPath, searchTerm]);

  const navigateUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  const navigateTo = (folderName: string) => {
    setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col bg-white dark:bg-navy-dark border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between p-6 pb-2">
          <DialogTitle>Sélectionner {multiple ? 'des images' : 'une image'}</DialogTitle>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple={multiple}
              onChange={handleUpload}
              disabled={isUploading}
            />
            {isUploading ? (
              <div className="flex items-center gap-2 text-sm font-medium text-navy dark:text-white">
                <Loader2 className="h-4 w-4 animate-spin" />
                Upload en cours... {uploadProgress}%
              </div>
            ) : (
              <Button size="sm" className="bg-navy hover:bg-navy-light text-white dark:bg-white dark:text-navy" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" /> Upload
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Rechercher..." 
              className="pl-10 dark:bg-navy-light dark:border-white/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 bg-slate-50 dark:bg-black/10">
          {!searchTerm && (
            <div className="flex items-center gap-2 py-4 mb-2 sticky top-0 bg-slate-50 dark:bg-black/10 z-10">
              {currentPath ? (
                <Button variant="ghost" size="sm" onClick={navigateUp} className="text-slate-500 hover:text-navy dark:text-white/70 dark:hover:text-white">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Retour
                </Button>
              ) : (
                <div className="text-sm font-medium text-slate-500 px-2">Racine</div>
              )}
              {currentPath && (
                <div className="text-sm font-medium text-navy dark:text-white flex items-center gap-2">
                  <span className="text-slate-300 dark:text-white/20">|</span>
                  <Folder className="h-4 w-4 text-gold" />
                  {currentPath.replace(/\//g, ' > ')}
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-navy dark:text-white/50" />
              Chargement de la médiathèque...
            </div>
          ) : folders.length === 0 && files.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              {searchTerm ? "Aucun média trouvé pour cette recherche." : "Ce dossier est vide."}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Folders */}
              {folders.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {folders.map(f => (
                    <div 
                      key={f}
                      onClick={() => navigateTo(f)}
                      className="bg-white dark:bg-navy-light border border-slate-200 dark:border-white/5 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:border-gold dark:hover:border-gold transition-colors group"
                    >
                      <Folder className="h-6 w-6 text-gold group-hover:fill-gold/20" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate capitalize">{f}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Files */}
              {files.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {files.map((file) => {
                    const isSelected = selectedUrls.includes((file.secure_url || file.url));
                    return (
                      <div 
                        key={file.id} 
                        className={`relative cursor-pointer group rounded-lg overflow-hidden border-2 aspect-square bg-slate-100 dark:bg-black/20 ${isSelected ? 'border-navy dark:border-white' : 'border-transparent dark:border-transparent hover:border-slate-300 dark:hover:border-white/30'}`}
                        onClick={() => handleSelect((file.secure_url || file.url))}
                      >
                        {file.type?.startsWith('image') ? (
                          <>
                            <img src={(file.secure_url || file.url)} alt={file.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextElementSibling?.classList.remove("hidden"); }} />
                            <div className="hidden w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 dark:bg-navy-dark">
                              <ImageIcon size={24} className="mb-2" />
                              <span className="text-[10px] text-center px-2 truncate w-full">{file.name}</span>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                            <ImageIcon size={24} />
                          </div>
                        )}
                        
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 flex items-end">
                          <span className="text-xs font-medium text-white truncate w-full" title={file.name}>
                            {file.name}
                          </span>
                        </div>
                        
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-navy dark:bg-white text-white dark:text-navy rounded-full p-1 shadow-sm">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
