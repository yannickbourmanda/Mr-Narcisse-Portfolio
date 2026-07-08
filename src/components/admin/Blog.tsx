import { deleteCloudinaryMediaByUrl } from '../../services/cloudinary';
import React, { useEffect, useState } from "react";
import { logActivity } from "../../services/activityService";
import {
  collection,
  query,
  onSnapshot,
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
  serverTimestamp, Timestamp,
  where,
  getDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { PLATFORM_CONFIG } from "../../config/platform";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadInput } from "./ImageUploadInput";
import { MultipleImageUploadInput } from "./MultipleImageUploadInput";
import { defaultArticles } from "../../config/defaultArticles";
import CategoriesManager from "./CategoriesManager";

export default function AdminBlog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'articles' | 'categories'>('articles');
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);

  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "articles"),
      where("platformId", "==", PLATFORM_CONFIG.id),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const articlesData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort(
          (a: any, b: any) =>
            (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0),
        );
      setArticles(articlesData);
      setLoading(false);
    });

    const qCats = query(
      collection(db, 'categories'),
      where('platformId', '==', PLATFORM_CONFIG.id),
      where('type', '==', 'blog')
    );
    const unsubCats = onSnapshot(qCats, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubscribe(); unsubCats(); };
  }, []);

  const deleteArticle = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet article ?")) return;
    try {
      const articleDoc = await getDoc(doc(db, "articles", id));
      const articleName = articleDoc.exists()
        ? articleDoc.data()?.title || id
        : id;

      await deleteDoc(doc(db, "articles", id));
      await logActivity("DELETE", "ARTICLE", articleName);
      toast.success("Article supprimé");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleSaveArticle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const dateStr = formData.get("createdAtStr") as string;
    let createdAtValue = editingArticle ? editingArticle.createdAt : serverTimestamp();
    
    if (dateStr) {
      const dateObj = new Date(dateStr);
      if (!isNaN(dateObj.getTime())) {
        createdAtValue = Timestamp.fromDate(dateObj);
      }
    }

    try {
      const articleData: any = {
        platformId: PLATFORM_CONFIG.id,
        title: formData.get("title") || "",
        content: formData.get("content") || "",
        author: formData.get("author") || "",
        readingTime: formData.get("readingTime") || "",
        categoryId: formData.get("categoryId") || "",
        coverImage: coverImage || "",
        galleryImages: galleryImages || [],
        status: formData.get("status") || "Brouillon",
      };

      if (dateStr) {
         articleData.createdAt = createdAtValue;
      }

      if (editingArticle) {
        if (editingArticle.title && editingArticle.title !== articleData.title) {
          const { renameCloudinaryFolder } = await import('../../services/cloudinary');
          await renameCloudinaryFolder(`articles/${editingArticle.title}`, `articles/${articleData.title}`);
        }
        await updateDoc(doc(db, "articles", editingArticle.id), articleData);
        await logActivity(
          "UPDATE",
          "ARTICLE",
          (articleData.title as string) || "Article inconnu",
        );
        toast.success("Article modifié avec succès");
      } else {
        await addDoc(collection(db, "articles"), {
          ...articleData,
          createdAt: createdAtValue,
        });
        await logActivity(
          "CREATE",
          "ARTICLE",
          (articleData.title as string) || "Nouvel article",
        );
        toast.success("Article ajouté avec succès");
      }
      setIsAddOpen(false);
      setEditingArticle(null);
      setCoverImage("");
      setGalleryImages([]);
    } catch (error: any) {
      toast.error("Erreur: " + (error?.message || "Erreur inconnue"));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (article: any) => {
    setEditingArticle(article);
    setTitle(article.title || '');
    setCoverImage(article.coverImage || "");
    setGalleryImages(article.galleryImages || []);
    setIsAddOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsAddOpen(open);
    if (!open) {
      setEditingArticle(null);
      setTitle('');
      setCoverImage("");
      setGalleryImages([]);
    }
  };

  if (loading) return <div>Chargement...</div>;

  const filteredArticles = articles.filter(a => !searchTerm || 
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.categoryId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.tags?.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-navy-dark dark:text-white">
            Blog
          </h1>
          <p className="text-slate-500 dark:text-white/60">
            Gérez vos articles de blog et catégories.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={activeTab === 'articles' ? 'default' : 'outline'}
            onClick={() => setActiveTab('articles')}
            className={activeTab === 'articles' ? 'bg-gold hover:bg-gold-dark text-white' : ''}
          >
            Articles
          </Button>
          <Button
            variant={activeTab === 'categories' ? 'default' : 'outline'}
            onClick={() => setActiveTab('categories')}
            className={activeTab === 'categories' ? 'bg-gold hover:bg-gold-dark text-white' : ''}
          >
            Catégories
          </Button>
        </div>
      </div>

      {activeTab === 'categories' ? (
        <CategoriesManager type="blog" />
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Rechercher (Titre, Auteur, Catégorie, Contenu)..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="pl-10 dark:bg-navy-dark dark:border-white/10"
              />
            </div>
            <Dialog open={isAddOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger>
              <Button className="bg-gold hover:bg-gold-dark text-white gap-2">
                <Plus size={18} /> Nouvel Article
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-navy-light dark:text-white border-0">
              <DialogHeader>
                <DialogTitle>
                  {editingArticle ? "Modifier l'article" : "Ajouter un article"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveArticle} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Titre</label>
                    <Input
                      name="title"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="dark:bg-navy-dark dark:border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date de création</label>
                    <Input
                      name="createdAtStr"
                      type="date"
                      defaultValue={editingArticle?.createdAt?.toDate ? editingArticle.createdAt.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                      className="dark:bg-navy-dark dark:border-white/10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Auteur</label>
                    <Input
                      name="author"
                      defaultValue={editingArticle?.author}
                      className="dark:bg-navy-dark dark:border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Temps de lecture (ex: 5 min)
                    </label>
                    <Input
                      name="readingTime"
                      defaultValue={editingArticle?.readingTime}
                      className="dark:bg-navy-dark dark:border-white/10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Catégorie</label>
                        <select
                          name="categoryId"
                          defaultValue={editingArticle?.categoryId || ""}
                          className="w-full flex h-10 rounded-md border border-input bg-background dark:bg-navy-dark dark:border-white/10 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Sélectionner une catégorie...</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Statut</label>
                        <select
                          name="status"
                          defaultValue={editingArticle?.status || "Brouillon"}
                          className="w-full flex h-10 w-full rounded-md border border-input bg-background dark:bg-navy-dark dark:border-white/10 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="Brouillon">Brouillon</option>
                          <option value="Publié">Publié</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2 flex-grow">
                      <label className="text-sm font-medium">Contenu</label>
                      <Textarea
                        name="content"
                        rows={14}
                        defaultValue={editingArticle?.content}
                        className="dark:bg-navy-dark dark:border-white/10 resize-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Image de couverture (optionnel)
                      </label>
                      <ImageUploadInput
                        folder={`articles/${title || 'nouveau'}`}
                        value={coverImage}
                        onChange={setCoverImage}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Galerie d'images (optionnel)
                      </label>
                      <MultipleImageUploadInput
                        folder={`articles/${title || 'nouveau'}/gallery`}
                        urls={galleryImages}
                        onChange={setGalleryImages}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gold hover:bg-gold-dark text-white"
                  >
                    {isSubmitting
                      ? "Sauvegarde..."
                      : editingArticle
                        ? "Modifier"
                        : "Créer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>

      <div className="bg-white dark:bg-navy-light border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 dark:border-white/10">
              <TableHead>Image</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-slate-500"
                >
                  Aucun article
                </TableCell>
              </TableRow>
            ) : (
              filteredArticles.map((article) => (
                <TableRow
                  key={article.id}
                  className="border-b border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <TableCell>
                    {article.coverImage ? (
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-200 dark:bg-white/10 rounded flex items-center justify-center text-xs text-slate-400">
                        Sans img
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate" title={article.title}>{article.title}</TableCell>
                  <TableCell className="max-w-[150px] truncate" title={article.categoryId || "-"}>{article.categoryId || "-"}</TableCell>
                  <TableCell>{article.status || "Brouillon"}</TableCell>
                  <TableCell>
                    {article.createdAt?.toDate().toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(article)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteArticle(article.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
        </>
      )}
    </div>
  );
}
