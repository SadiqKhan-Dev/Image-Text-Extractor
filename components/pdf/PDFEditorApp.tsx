'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from '@/lib/pdfSetup';
import { loadPDFFromFile } from '@/lib/pdfUtils';
import type { Annotation } from '@/lib/pdfAnnotation';
import { exportEditedPDF } from '@/lib/pdfExport';
import PDFUploader from './PDFUploader';
import PDFToolbar from './PDFToolbar';
import PDFViewer from './PDFViewer';
import PDFPageManager from './PDFPageManager';
import PDFAnnotationToolbar from './PDFAnnotationToolbar';
import PDFMergeSplit from './PDFMergeSplit';
import PDFConvertPanel from './PDFConvertPanel';
import PDFOCRPanel from './PDFOCRPanel';
import PDFMetadataPanel from './PDFMetadataPanel';
import PDFSearchPanel from './PDFSearchPanel';
import PDFWatermarkPanel from './PDFWatermarkPanel';
import PDFSignaturePanel from './PDFSignaturePanel';
import PDFStampPanel from './PDFStampPanel';
import ToastContainer, { useToast } from '@/components/Toast';

interface HistoryEntry {
  pageOrder: number[];
  deletedPages: Set<number>;
  rotatedPages: Record<number, number>;
  annotations: Record<number, Annotation[]>;
}

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
  const [fitMode, setFitMode] = useState<'none' | 'width' | 'page'>('none');

  // Page management
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [deletedPages, setDeletedPages] = useState<Set<number>>(new Set());
  const [rotatedPages, setRotatedPages] = useState<Record<number, number>>({});
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  // Annotation state
  const [annotations, setAnnotations] = useState<Record<number, Annotation[]>>({});
  const [activeAnnotationTool, setActiveAnnotationTool] = useState('highlight');
  const [annotationColor, setAnnotationColor] = useState('#FF5722');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(14);
  const [annotationOpacity, setAnnotationOpacity] = useState(1);

  // Undo/Redo
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyRef = useRef<HistoryEntry[]>([]);
  const historyIndexRef = useRef(-1);

  // Toast
  const { toasts, addToast, dismiss } = useToast();

  // Search
  const [showSearch, setShowSearch] = useState(false);

  // Save current state to history
  const pushHistory = useCallback(() => {
    const entry: HistoryEntry = {
      pageOrder: [...pageOrder],
      deletedPages: new Set(deletedPages),
      rotatedPages: { ...rotatedPages },
      annotations: Object.fromEntries(Object.entries(annotations).map(([k, v]) => [k, [...v]])),
    };
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(entry);
    if (newHistory.length > 50) newHistory.shift();
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    setHistory([...newHistory]);
    setHistoryIndex(historyIndexRef.current);
  }, [pageOrder, deletedPages, rotatedPages, annotations]);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const entry = historyRef.current[historyIndexRef.current];
    setPageOrder([...entry.pageOrder]);
    setDeletedPages(new Set(entry.deletedPages));
    setRotatedPages({ ...entry.rotatedPages });
    setAnnotations(Object.fromEntries(Object.entries(entry.annotations).map(([k, v]) => [k, [...v]])));
    setHistoryIndex(historyIndexRef.current);
    addToast('info', 'Undone');
  }, [addToast]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const entry = historyRef.current[historyIndexRef.current];
    setPageOrder([...entry.pageOrder]);
    setDeletedPages(new Set(entry.deletedPages));
    setRotatedPages({ ...entry.rotatedPages });
    setAnnotations(Object.fromEntries(Object.entries(entry.annotations).map(([k, v]) => [k, [...v]])));
    setHistoryIndex(historyIndexRef.current);
    addToast('info', 'Redone');
  }, [addToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!doc) return;
      const isInput = (e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA';

      if (e.ctrlKey && e.key === 'z' && !isInput) { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y' && !isInput) { e.preventDefault(); redo(); }
      if (e.ctrlKey && e.key === 's' && !isInput) { e.preventDefault(); handleExport(); }
      if (e.ctrlKey && e.key === 'f' && !isInput) { e.preventDefault(); setShowSearch(true); setActiveTool('search'); }
      if (e.key === 'ArrowLeft' && !isInput) { e.preventDefault(); setCurrentPage((p) => Math.max(1, p - 1)); }
      if (e.key === 'ArrowRight' && !isInput) { e.preventDefault(); setCurrentPage((p) => Math.min(totalPages, p + 1)); }
      if (e.key === '+' && !isInput) { e.preventDefault(); setZoom((z) => Math.min(300, z + 25)); }
      if (e.key === '-' && !isInput) { e.preventDefault(); setZoom((z) => Math.max(50, z - 25)); }
      if (e.key === '0' && e.ctrlKey && !isInput) { e.preventDefault(); setZoom(100); }
      if (e.key === 'Delete' && !isInput && activeTool === 'annotate') { e.preventDefault(); handleDeleteLastAnnotation(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [doc, totalPages, undo, redo, activeTool]);

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
      setSelectedPages(new Set());
      setHistory([]);
      setHistoryIndex(-1);
      historyRef.current = [];
      historyIndexRef.current = -1;
      setActiveTool('viewer');
      setZoom(100);
      setFitMode('none');
    } catch (err) {
      setError('Failed to load PDF. The file may be corrupted or password-protected.');
    }
    setLoading(false);
  }, []);

  const handlePageDelete = (page: number) => {
    pushHistory();
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

  const handleBulkDelete = () => {
    if (selectedPages.size === 0) return;
    pushHistory();
    setDeletedPages((prev) => {
      const next = new Set(prev);
      selectedPages.forEach((p) => next.add(p));
      return next;
    });
    setSelectedPages(new Set());
    addToast('success', `Deleted ${selectedPages.size} page(s)`);
  };

  const handleBulkRotate = () => {
    if (selectedPages.size === 0) return;
    pushHistory();
    setRotatedPages((prev) => {
      const next = { ...prev };
      selectedPages.forEach((p) => { next[p] = ((next[p] || 0) + 90) % 360; });
      return next;
    });
    addToast('success', `Rotated ${selectedPages.size} page(s)`);
  };

  const handlePageRestore = (page: number) => {
    pushHistory();
    setDeletedPages((prev) => {
      const next = new Set(prev);
      next.delete(page);
      return next;
    });
  };

  const handlePageRotate = (page: number) => {
    pushHistory();
    setRotatedPages((prev) => ({
      ...prev,
      [page]: ((prev[page] || 0) + 90) % 360,
    }));
  };

  const handleDuplicatePage = (page: number) => {
    pushHistory();
    setPageOrder((prev) => {
      const idx = prev.indexOf(page);
      const newOrder = [...prev];
      newOrder.splice(idx + 1, 0, page);
      return newOrder;
    });
    setTotalPages((t) => t + 1);
    addToast('success', `Duplicated page ${page}`);
  };

  const handleAnnotationsChange = (pageAnnotations: Annotation[]) => {
    setAnnotations((prev) => ({ ...prev, [currentPage]: pageAnnotations }));
  };

  const handleAddAnnotation = (ann: Annotation) => {
    pushHistory();
    setAnnotations((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), ann],
    }));
  };

  const handleDeleteLastAnnotation = () => {
    const pageAnns = annotations[currentPage] || [];
    if (pageAnns.length === 0) return;
    pushHistory();
    setAnnotations((prev) => ({
      ...prev,
      [currentPage]: pageAnns.slice(0, -1),
    }));
  };

  const handleExport = async () => {
    if (!pdfFile) return;
    try {
      await exportEditedPDF(pdfFile, pageOrder, deletedPages, rotatedPages, annotations, pdfFile.name.replace('.pdf', '-edited.pdf'));
      addToast('success', 'PDF exported successfully!');
    } catch {
      addToast('error', 'Failed to export PDF.');
    }
  };

  const handlePrint = () => {
    window.print();
    addToast('info', 'Print dialog opened');
  };

  const showAnnotations = activeTool === 'annotate';
  const activePageAnnotations = annotations[currentPage] || [];
  const activePages = pageOrder.filter((p) => !deletedPages.has(p));

  const viewerTools = ['viewer', 'annotate', 'search'];
  const showSidebar = viewerTools.includes(activeTool) && doc;

  return (
    <div className="min-h-screen bg-theme-bg text-theme-primary">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <main className="max-w-[1600px] mx-auto px-4 py-4">
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
          <div className="flex flex-col h-[calc(100vh-70px)]">
            {/* Toolbar */}
            <PDFToolbar
              activeTool={activeTool}
              onToolChange={setActiveTool}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              zoom={zoom}
              onZoomChange={setZoom}
              onFitWidth={() => setFitMode(fitMode === 'width' ? 'none' : 'width')}
              onFitPage={() => setFitMode(fitMode === 'page' ? 'none' : 'page')}
              fitMode={fitMode}
              onExport={handleExport}
              onPrint={handlePrint}
              onUndo={undo}
              onRedo={redo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onSearch={() => { setShowSearch(true); setActiveTool('search'); }}
              fileName={pdfFile?.name || 'document.pdf'}
            />

            {/* Annotation toolbar */}
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
                opacity={annotationOpacity}
                onOpacityChange={setAnnotationOpacity}
                onDeleteAnnotation={handleDeleteLastAnnotation}
              />
            )}

            {/* Main content area */}
            <div className="flex gap-3 flex-1 min-h-0">
              {/* Sidebar */}
              {showSidebar && doc && (
                <div className="flex flex-col gap-2">
                  <PDFPageManager
                    doc={doc}
                    pageOrder={pageOrder}
                    deletedPages={deletedPages}
                    rotatedPages={rotatedPages}
                    currentPage={currentPage}
                    selectedPages={selectedPages}
                    onPageSelect={setCurrentPage}
                    onPageDelete={handlePageDelete}
                    onPageRestore={handlePageRestore}
                    onPageRotate={handlePageRotate}
                    onPageDuplicate={handleDuplicatePage}
                    onReorder={setPageOrder}
                    onSelectToggle={(page) => {
                      setSelectedPages((prev) => {
                        const next = new Set(prev);
                        next.has(page) ? next.delete(page) : next.add(page);
                        return next;
                      });
                    }}
                    onSelectAll={() => setSelectedPages(new Set(activePages))}
                    onDeselectAll={() => setSelectedPages(new Set())}
                  />
                  {/* Bulk actions */}
                  {selectedPages.size > 0 && (
                    <div className="flex flex-col gap-1 px-1">
                      <span className="text-[10px] text-theme-faint text-center">{selectedPages.size} selected</span>
                      <button onClick={handleBulkRotate} className="w-full py-1 rounded bg-theme-secondary text-[10px] text-theme-secondary hover:bg-theme-muted">Rotate All</button>
                      <button onClick={handleBulkDelete} className="w-full py-1 rounded bg-red-600/20 text-[10px] text-red-400 hover:bg-red-600/30">Delete All</button>
                    </div>
                  )}
                </div>
              )}

              {/* Center */}
              <div className="flex-1 flex flex-col min-h-0">
                {(activeTool === 'viewer' || activeTool === 'annotate') && doc ? (
                  <PDFViewer
                    doc={doc}
                    pageNumber={currentPage}
                    zoom={zoom}
                    fitMode={fitMode}
                    annotations={showAnnotations ? activePageAnnotations : []}
                    activeTool={showAnnotations ? activeAnnotationTool : 'viewer'}
                    annotationColor={annotationColor}
                    strokeWidth={strokeWidth}
                    fontSize={fontSize}
                    opacity={annotationOpacity}
                    onAnnotationsChange={handleAnnotationsChange}
                    onToast={addToast}
                  />
                ) : activeTool === 'merge' || activeTool === 'split' ? (
                  <div className="flex-1 overflow-auto bg-theme-card rounded-2xl border border-theme-secondary p-5">
                    <PDFMergeSplit pdfFile={pdfFile} totalPages={totalPages} />
                  </div>
                ) : activeTool === 'convert' && doc ? (
                  <div className="flex-1 overflow-auto bg-theme-card rounded-2xl border border-theme-secondary p-5">
                    <PDFConvertPanel doc={doc} pdfFile={pdfFile} totalPages={totalPages} currentPage={currentPage} />
                  </div>
                ) : activeTool === 'ocr' && doc ? (
                  <div className="flex-1 overflow-auto bg-theme-card rounded-2xl border border-theme-secondary p-5">
                    <PDFOCRPanel doc={doc} totalPages={totalPages} currentPage={currentPage} />
                  </div>
                ) : activeTool === 'metadata' && doc && pdfFile ? (
                  <div className="flex-1 overflow-auto bg-theme-card rounded-2xl border border-theme-secondary p-5">
                    <PDFMetadataPanel doc={doc} file={pdfFile} />
                  </div>
                ) : activeTool === 'search' && doc ? (
                  <div className="flex-1 overflow-auto bg-theme-card rounded-2xl border border-theme-secondary p-5">
                    <PDFSearchPanel doc={doc} totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
                  </div>
                ) : activeTool === 'watermark' && pdfFile ? (
                  <div className="flex-1 overflow-auto bg-theme-card rounded-2xl border border-theme-secondary p-5">
                    <PDFWatermarkPanel pdfFile={pdfFile} totalPages={totalPages} onToast={addToast} />
                  </div>
                ) : activeTool === 'signature' ? (
                  <div className="flex-1 overflow-auto bg-theme-card rounded-2xl border border-theme-secondary p-5">
                    <PDFSignaturePanel pageNumber={currentPage} onAddAnnotation={handleAddAnnotation} onToast={addToast} />
                  </div>
                ) : activeTool === 'stamp' ? (
                  <div className="flex-1 overflow-auto bg-theme-card rounded-2xl border border-theme-secondary p-5">
                    <PDFStampPanel pageNumber={currentPage} onAddAnnotation={handleAddAnnotation} />
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
