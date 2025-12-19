import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { motion } from 'framer-motion';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Highlight {
  page: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

interface PdfViewerProps {
  filename: string;
  highlights?: Highlight[];
}

export default function PdfViewer({ filename, highlights = [] }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);

  const pdfUrl = `http://localhost:8000/api/pdf/${filename}`;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    
    // Navigate to the first page with highlights
    if (highlights.length > 0) {
      const firstHighlightPage = highlights[0].page + 1; // Convert 0-based to 1-based
      setPageNumber(firstHighlightPage);
    }
  }

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  // Get highlights for current page
  const currentPageHighlights = highlights.filter(h => h.page === pageNumber - 1);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-2 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-slate-300" />
          </button>
          
          <span className="text-sm text-slate-300 min-w-[80px] text-center">
            {loading ? '...' : `${pageNumber} / ${numPages}`}
          </span>
          
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="p-2 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-2 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ZoomOut className="h-4 w-4 text-slate-300" />
          </button>
          
          <span className="text-sm text-slate-300 min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            disabled={scale >= 2.0}
            className="p-2 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ZoomIn className="h-4 w-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* PDF Display */}
      <div className="flex-1 overflow-auto bg-slate-950 p-4">
        <div className="flex justify-center">
          <div className="relative">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" />
                </div>
              }
              error={
                <div className="p-8 text-red-400 text-center">
                  Failed to load PDF
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-2xl"
              />
            </Document>

            {/* Highlight Overlays */}
            {currentPageHighlights.map((highlight, index) => {
              const { bbox } = highlight;
              // Convert PDF coordinates to display coordinates
              // Note: This is a simplified version - you may need to adjust based on PDF dimensions
              const pageHeight = 842; // A4 height in points (adjust as needed)
              const displayScale = scale * 1.33; // Convert points to pixels (rough estimation)
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  className="absolute bg-yellow-400 pointer-events-none"
                  style={{
                    left: `${bbox.x0 * displayScale}px`,
                    top: `${(pageHeight - bbox.y1) * displayScale}px`,
                    width: `${(bbox.x1 - bbox.x0) * displayScale}px`,
                    height: `${(bbox.y1 - bbox.y0) * displayScale}px`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Highlights Info */}
      {currentPageHighlights.length > 0 && (
        <div className="px-4 py-2 bg-yellow-500/10 border-t border-yellow-500/30">
          <p className="text-xs text-yellow-300 text-center">
            {currentPageHighlights.length} highlight{currentPageHighlights.length > 1 ? 's' : ''} on this page
          </p>
        </div>
      )}
    </div>
  );
}
