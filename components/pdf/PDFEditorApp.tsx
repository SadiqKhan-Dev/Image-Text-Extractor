'use client';

import { useState, useCallback } from 'react';
import type { PDFDocumentProxy } from '@/lib/pdfSetup';
import { loadPDFFromFile } from '@/lib/pdfUtils';
import type { Annotation } from '@/lib/pdfAnnotation';
import PDFUploader from './PDFUploader';
import PDFToolbar from './PDFToolbar';
import PDFViewer from './PDFViewer';
import PDFPageManager from './PDFPageManager';
import PDFAnnotationToolbar from './PDFAnnotationToolbar';
import PDFMergeSplit from './PDFMergeSplit';
import PDFConvertPanel from './PDFConvertPanel';
import PDFOCRPanel from './PDFOCRPanel';

export default function PDFEditorApp() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Viewer state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState('viewer');

  // Page management
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [deletedPages, setDeletedPages] = useState<Set<number>>(new Set());
  const [rotatedPages, setRotatedPages] = useState<Record<number, number>>({});

  // Annotation state
  const [annotations, setAnnotations] = useState<Record<number, Annotation[]>>({});
  const [activeAnnotationTool, setActiveAnnotationTool] = useState('highlight');
  const [annotationColor, setAnnotationColor] = useState('#FFEB3B');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(14);

  const handleFileSelect = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const pdfDoc = await loadPDFFromFile(file);
      setPdfFile(file);
      setDoc(pdfDoc);
      setTotalPages(pdfDoc.numPages);
      setCurrentPage(1);
      setPageOrder(Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1));
      setDeletedPages(new Set());
      setRotatedPages({});
      setAnnotations({});
    } catch (err) {
      setError('Failed to load PDF. The file may be corrupted or password-protected.');
    }
    setLoading(false);
  }, []);

  const handlePageDelete = (page: number) => {
    setDeletedPages((prev) => {
      const next = new Set(prev);
      next.add(page);
      return next;
    });
    if (currentPage === page) {
      const activePages = pageOrder.filter((p) => !deletedPages.has(p) && p !== page);
      if (activePages.length > 0) setCurrentPage(activePages[0]);
    }
  };

  const handlePageRestore = (page: number) => {
    setDeletedPages((prev) => {
      const next = new Set(prev);
      next.delete(page);
      return next;
    });
  };

  const handlePageRotate = (page: number) => {
    setRotatedPages((prev) => ({
      ...prev,
      [page]: ((prev[page] || 0) + 90) % 360,
    }));
  };

  const handleAnnotationsChange = (pageAnnotations: Annotation[]) => {
    setAnnotations((prev) => ({ ...prev, [currentPage]: pageAnnotations }));
  };

  const showAnnotations = activeTool === 'annotate';
  const activePageAnnotations = annotations[currentPage] || [];

  return (
    <div className="min-h-screen bg-theme-bg text-theme-primary">
      {/* Header */}
      <header className="border-b border-theme-secondary bg-theme-card">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-theme-primary">PDF Editor</h1>
          </div>
          <a href="/" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            ← Back to OCR Tool
          </a>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {!doc ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-theme-muted">Loading PDF...</p>
              </div>
            ) : (
              <>
                <PDFUploader onFileSelect={handleFileSelect} />
                {error && (
                  <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-80px)]">
            {/* Toolbar */}
            <PDFToolbar
              activeTool={activeTool}
              onToolChange={setActiveTool}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              zoom={zoom}
              onZoomChange={setZoom}
            />

            {/* Annotation toolbar (when annotate mode) */}
            {showAnnotations && (
              <PDFAnnotationToolbar
                activeTool={activeAnnotationTool}
                onToolSelect={setActiveAnnotationTool}
                color={annotationColor}
                onColorChange={setAnnotationColor}
                strokeWidth={strokeWidth}
                onStrokeWidthChange={setStrokeWidth}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
              />
            )}

            {/* Main content area */}
            <div className="flex gap-4 flex-1 min-h-0">
              {/* Sidebar - Page Manager */}
              {(activeTool === 'viewer' || activeTool === 'annotate') && doc && (
                <PDFPageManager
                  doc={doc}
                  pageOrder={pageOrder}
                  deletedPages={deletedPages}
                  rotatedPages={rotatedPages}
                  currentPage={currentPage}
                  onPageSelect={setCurrentPage}
                  onPageDelete={handlePageDelete}
                  onPageRestore={handlePageRestore}
                  onPageRotate={handlePageRotate}
                  onReorder={setPageOrder}
                />
              )}

              {/* Center - Viewer or panels */}
              <div className="flex-1 flex flex-col min-h-0">
                {(activeTool === 'viewer' || activeTool === 'annotate') && doc ? (
                  <PDFViewer
                    doc={doc}
                    pageNumber={currentPage}
                    zoom={zoom}
                    annotations={showAnnotations ? activePageAnnotations : []}
                    activeTool={showAnnotations ? activeAnnotationTool : 'viewer'}
                    onAnnotationsChange={handleAnnotationsChange}
                  />
                ) : activeTool === 'merge' || activeTool === 'split' ? (
                  <div className="flex-1 overflow-auto bg-theme-card rounded-2xl border border-theme-secondary p-6">
                    <PDFMergeSplit pdfFile={pdfFile} totalPages={totalPages} />
                  </div>
                ) : activeTool === 'convert' && doc ? (
                  <div className="flex-1 overflow-auto bg-theme-card rounded-2xl border border-theme-secondary p-6">
                    <PDFConvertPanel doc={doc} pdfFile={pdfFile} totalPages={totalPages} currentPage={currentPage} />
                  </div>
                ) : activeTool === 'ocr' && doc ? (
                  <div className="flex-1 overflow-auto bg-theme-card rounded-2xl border border-theme-secondary p-6">
                    <PDFOCRPanel doc={doc} totalPages={totalPages} currentPage={currentPage} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
