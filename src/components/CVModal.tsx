import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Document, Page, pdfjs } from 'react-pdf';
import { Download, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface CVModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvUrl: string;
}

export function CVModal({ isOpen, onClose, cvUrl }: CVModalProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    if (isOpen) {
      setPageNumber(1);
      setScale(1.0);
    }
  }, [isOpen]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const downloadCV = () => {
    const link = document.createElement('a');
    link.href = cvUrl;
    link.download = 'CV_Narcisse_Nasser_Bandjim.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] bg-navy-dark border-white/10 p-0 flex flex-col overflow-hidden text-white sm:rounded-xl">
        <DialogHeader className="sr-only">
            <DialogTitle>Mon CV</DialogTitle>
        </DialogHeader>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-navy shrink-0 z-10">
          <h2 className="text-lg font-serif text-white">Mon CV</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadCV} className="text-gold border-gold/50 hover:bg-gold/10 hover:text-gold" title="Télécharger">
              <Download size={16} className="mr-2" />
              Télécharger
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 ml-2">
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 p-2 bg-navy-light shrink-0 border-b border-white/10 z-10 flex-wrap">
          <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="text-white hover:bg-white/10 h-8 w-8" disabled={scale <= 0.5}>
            <ZoomOut size={16} />
          </Button>
          <span className="text-xs sm:text-sm text-white/70 w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(3, s + 0.25))} className="text-white hover:bg-white/10 h-8 w-8" disabled={scale >= 3}>
            <ZoomIn size={16} />
          </Button>
          
          <div className="w-px h-6 bg-white/20 mx-1 sm:mx-2 hidden sm:block" />
          
          <Button variant="ghost" size="icon" onClick={() => setPageNumber(p => Math.max(1, p - 1))} className="text-white hover:bg-white/10 h-8 w-8" disabled={pageNumber <= 1}>
            <ChevronLeft size={16} />
          </Button>
          <span className="text-xs sm:text-sm text-white/70">
            {pageNumber} / {numPages || '-'}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))} className="text-white hover:bg-white/10 h-8 w-8" disabled={pageNumber >= (numPages || 1)}>
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-black/50 flex justify-center p-4 sm:p-8 relative">
          {cvUrl ? (
            <Document
              file={cvUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-gold" size={32} /></div>}
              error={<div className="absolute inset-0 flex items-center justify-center text-red-400">Erreur lors du chargement du PDF.</div>}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                renderTextLayer={true} 
                renderAnnotationLayer={true} 
                className="shadow-2xl"
              />
            </Document>
          ) : (
            <div className="flex items-center justify-center h-full text-white/50">Aucun CV disponible</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
