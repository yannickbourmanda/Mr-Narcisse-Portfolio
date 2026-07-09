import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Upload, Copy, Trash2, ImageIcon, FileText, Video, RefreshCw, Folder, ChevronLeft, Loader2, Filter, ArrowUpDown } from 'lucide-react';
import { useMedia } from '../../hooks/useMedia';
import { deleteCloudinaryMedia, uploadToCloudinary } from '../../services/cloudinary';
import { toast } from 'sonner';
import { doc, getDocs, collection, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminMediaLibrary() {
  const { media, loading } = useMedia();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPath, setCurrentPath] = useState('');
  
  // Filters and sort
  const [filterType, setFilterType] = useState('all'); // all, image, video, document
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, alphabetical, largest, smallest

  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      const targetFolder = currentPath || 'Media';
      const total = files.length;

      for(let i = 0; i < files.length; i++) {
        await uploadToCloudinary(files[i], targetFolder, (prog) => {
           setUploadProgress(Math.round(((i) / total) * 100 + (prog / total)));
        });
      }
      toast.success(`${files.length} fichier(s) ajouté(s)`);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
    }
  };

  const updateUrlInCollections = async (oldUrl: string, newUrl: string) => {
    const collectionsToUpdate = [
      { name: 'projects', fields: ['coverImage'], arrayFields: ['galleryImages'] },
      { name: 'articles', fields: ['coverImage'], arrayFields: ['galleryImages'] },
      { name: 'services', fields: ['iconImage'] },
      { name: 'settings', fields: ['logo', 'heroBg', 'contactImage'] },
      { name: 'publications', fields: ['image'] },
      { name: 'about', fields: ['profileImage', 'teamImage', 'signatureImage'] },
      { name: 'team', fields: ['image'] }
    ];

    for (const { name, fields, arrayFields } of collectionsToUpdate) {
      const querySnapshot = await getDocs(collection(db, name));
      for (const document of querySnapshot.docs) {
        const data = document.data();
        const updates: any = {};
        let needsUpdate = false;

        if (fields) {
          for (const field of fields) {
            if (data[field] === oldUrl) {
              updates[field] = newUrl;
              needsUpdate = true;
            } else if (data[field]?.url === oldUrl) {
              updates[field] = { ...data[field], url: newUrl };
              needsUpdate = true;
            }
          }
        }
        if (arrayFields) {
          for (const field of arrayFields) {
            if (data[field] && Array.isArray(data[field])) {
              const newArray = data[field].map((item: any) => {
                if (typeof item === 'string' && item === oldUrl) return newUrl;
                if (typeof item === 'object' && item.url === oldUrl) return { ...item, url: newUrl };
                return item;
              });
              if (JSON.stringify(newArray) !== JSON.stringify(data[field])) {
                updates[field] = newArray;
                needsUpdate = true;
              }
            }
          }
        }

        if (needsUpdate) {
          await updateDoc(doc(db, name, document.id), updates);
        }
      }
    }
  };

  const handleDelete = async (file: any) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce média définitivement ?")) {
      try {
        await deleteCloudinaryMedia(file.id, file.public_id);
        const fileUrl = file.secure_url || file.url;
        if (fileUrl) {
          await updateUrlInCollections(fileUrl, '');
        }
        toast.success("Média supprimé");
      } catch (error: any) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiée !");
  };

  // Build folder structure and filter files
  const { folders, files } = useMemo(() => {
    let currentFolders = new Set<string>();
    let currentFiles: any[] = [];
    
    // Apply type filter
    let filteredMedia = media;
    if (filterType !== 'all') {
      filteredMedia = media.filter(m => {
        const t = m.resource_type || m.type || '';
        if (filterType === 'image') return t.includes('image');
        if (filterType === 'video') return t.includes('video');
        if (filterType === 'document') return !t.includes('image') && !t.includes('video');
        return true;
      });
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredMedia = filteredMedia.filter(m => 
        (m.name && m.name.toLowerCase().includes(term)) || 
        (m.folder && m.folder.toLowerCase().includes(term)) ||
        (m.format && m.format.toLowerCase().includes(term)) ||
        (m.resource_type && m.resource_type.toLowerCase().includes(term))
      );
      
      // When searching, we flatten folders and show all files
      currentFiles = filteredMedia;
    } else {
      // Regular folder view
      filteredMedia.forEach(file => {
        const fileFolder = file.folder || '';
        
        if (fileFolder === currentPath || fileFolder === currentPath.replace(/\/$/, '')) {
          currentFiles.push(file);
        } else if (fileFolder.startsWith(currentPath ? currentPath + '/' : '')) {
          const remainingPath = currentPath ? fileFolder.substring(currentPath.length + 1) : fileFolder;
          const nextFolder = remainingPath.split('/')[0];
          if (nextFolder) {
            currentFolders.add(nextFolder);
          }
        }
      });
    }

    // Apply sorting to files
    currentFiles.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      const aSize = a.bytes || a.size || 0;
      const bSize = b.bytes || b.size || 0;
      const aName = a.name || '';
      const bName = b.name || '';

      switch (sortBy) {
        case 'newest': return bTime - aTime;
        case 'oldest': return aTime - bTime;
        case 'alphabetical': return aName.localeCompare(bName);
        case 'largest': return bSize - aSize;
        case 'smallest': return aSize - bSize;
        default: return bTime - aTime;
      }
    });

    return { 
      folders: Array.from(currentFolders).sort(), 
      files: currentFiles
    };
  }, [media, currentPath, searchTerm, filterType, sortBy]);

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-navy-dark dark:text-white">Médiathèque</h1>
          <p className="text-slate-500 dark:text-white/60">Gérez vos fichiers médias comme sur votre ordinateur.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            ref={uploadInputRef}
            className="hidden"
            multiple
            onChange={handleUpload}
            disabled={isUploading}
          />
          {isUploading ? (
            <Button disabled className="bg-navy text-white min-w-[140px]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadProgress}%
            </Button>
          ) : (
            <Button onClick={() => uploadInputRef.current?.click()} className="bg-navy hover:bg-navy-light text-white dark:bg-white dark:text-navy dark:hover:bg-slate-200">
              <Upload className="mr-2 h-4 w-4" />
              Ajouter des fichiers
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-white dark:bg-navy-dark border-slate-200 dark:border-white/10 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-white/5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {!searchTerm ? (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {currentPath ? (
                  <Button variant="ghost" size="sm" onClick={navigateUp} className="text-slate-500 hover:text-navy dark:text-white/70 dark:hover:text-white h-8 px-2 shrink-0">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Retour
                  </Button>
                ) : (
                  <div className="text-sm font-medium text-slate-500 px-2 shrink-0">Racine</div>
                )}
                {currentPath && (
                  <div className="text-sm font-medium text-navy dark:text-white flex items-center gap-2 whitespace-nowrap">
                    <span className="text-slate-300 dark:text-white/20">|</span>
                    <Folder className="h-4 w-4 text-gold" />
                    {currentPath.replace(/\//g, ' > ')}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm font-medium text-navy dark:text-white">Résultats de recherche pour "{searchTerm}"</div>
            )}
            
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px] h-9">
                  <Filter className="w-3 h-3 mr-2" />
                  <SelectValue placeholder="Filtre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Vidéos</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] h-9">
                  <ArrowUpDown className="w-3 h-3 mr-2" />
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Plus récent</SelectItem>
                  <SelectItem value="oldest">Plus ancien</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                  <SelectItem value="largest">Plus lourd</SelectItem>
                  <SelectItem value="smallest">Plus léger</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Rechercher par nom, format, dossier..." 
              className="pl-10 h-10 bg-slate-50 dark:bg-navy-light border-slate-200 dark:border-white/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-navy dark:text-white/50" />
              Chargement de la médiathèque...
            </div>
          ) : folders.length === 0 && files.length === 0 ? (
            <div className="text-center py-20 text-slate-500 flex flex-col items-center">
              <Folder className="h-16 w-16 text-slate-200 dark:text-white/10 mb-4" />
              {searchTerm || filterType !== 'all' ? "Aucun média trouvé avec ces filtres." : "Ce dossier est vide."}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Folders */}
              {!searchTerm && folders.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider">Dossiers</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {folders.map(f => (
                      <div 
                        key={f}
                        onClick={() => navigateTo(f)}
                        className="bg-white dark:bg-navy-light border border-slate-200 dark:border-white/10 shadow-sm rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:border-gold dark:hover:border-gold hover:shadow-md transition-all group"
                      >
                        <Folder className="h-8 w-8 text-gold group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate capitalize">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {files.length > 0 && (
                <div>
                  {!searchTerm && <h3 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider mt-6">Fichiers</h3>}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {files.map((file) => {
                      const fileUrl = file.secure_url || file.url;
                      const isVideo = file.resource_type === 'video' || (file.type && file.type.includes('video'));
                      const isImage = file.resource_type === 'image' || (file.type && file.type.includes('image'));
                      
                      return (
                      <div key={file.id} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 aspect-square shadow-sm">
                        {isImage ? (
                          <>
                            <img src={fileUrl} alt={file.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextElementSibling?.classList.remove("hidden"); }} />
                            <div className="hidden w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 dark:bg-navy-dark">
                              <ImageIcon size={32} className="mb-2 text-slate-300" />
                            </div>
                          </>
                        ) : isVideo ? (
                          <div className="w-full h-full bg-slate-900 relative">
                            <video src={fileUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                <Video className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                            <FileText size={32} />
                            <span className="text-xs mt-2 truncate w-full text-center px-2">{file.name}</span>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-navy-dark/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleCopyUrl(fileUrl); }} className="w-28 h-8 text-xs bg-white text-navy hover:bg-slate-100">
                            <Copy className="mr-2 h-3 w-3" /> Copier
                          </Button>
                          {isImage && (
                            <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); window.open(fileUrl, '_blank'); }} className="w-28 h-8 text-xs bg-white text-navy hover:bg-slate-100">
                              <ImageIcon className="mr-2 h-3 w-3" /> Voir
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleDelete(file); }} className="w-28 h-8 text-xs">
                            <Trash2 className="mr-2 h-3 w-3" /> Supprimer
                          </Button>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent text-white text-[10px] pt-6 pb-2 px-3 flex justify-between items-end pointer-events-none">
                          <span className="truncate flex-1 pr-2">{file.name}</span>
                          {file.format && <span className="uppercase opacity-70 font-mono text-[9px]">{file.format}</span>}
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
