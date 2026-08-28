'use client';

import { useState, useCallback, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import OCRResult from './OCRResult';
import ContextMenu from './ContextMenu';
import ShortcutsModal from './ShortcutsModal';
import HistoryPanel from './HistoryPanel';
import BatchUpload from './BatchUpload';
import BatchResults from './BatchResults';
import ExportMenu from './ExportMenu';
import { saveToHistory } from '@/lib/history';
import { generateThumbnail } from '@/lib/imageProcessing';
import type { OCRProgressInfo } from '@/lib/ocr';

const ACCEPTED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

interface BatchFile {
  file: File;
  status: 'pending' | 'processing' | 'done' | 'error';
  text?: string;
  error?: string;
  previewUrl?: string;
}

export default function OCRApp() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OCRProgressInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [activeBatchIndex, setActiveBatchIndex] = useState(0);
  const [isBatchMode, setIsBatchMode] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const newPreviewUrl = URL.createObjectURL(file);
      setUploadedFile(file);
      setPreviewUrl(newPreviewUrl);
      setExtractedText('');
      setError(null);
      setProgress(null);
      setConfidence(null);
      setIsProcessing(true);

      try {
        const { extractTextFromImage } = await import('@/lib/ocr');
        const result = await extractTextFromImage(file, selectedLanguage, (info) => setProgress(info));
        setExtractedText(result.text);
        setConfidence(result.confidence);
        try {
          const thumbnail = await generateThumbnail(file);
          saveToHistory({ thumbnail, text: result.text, language: selectedLanguage, confidence: result.confidence, wordCount: result.text.trim() ? result.text.trim().split(/\s+/).filter(Boolean).length : 0 });
        } catch {}
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred during OCR processing.');
      } finally {
        setIsProcessing(false);
        setProgress(null);
      }
    },
    [previewUrl, selectedLanguage]
  );

  const processBatchFile = useCallback(
    async (batchIndex: number) => {
      setBatchFiles((prev) => prev.map((f, i) => (i === batchIndex ? { ...f, status: 'processing' as const } : f)));
      try {
        const { extractTextFromImage } = await import('@/lib/ocr');
        const file = batchFiles[batchIndex].file;
        const result = await extractTextFromImage(file, selectedLanguage);
        setBatchFiles((prev) => prev.map((f, i) => (i === batchIndex ? { ...f, status: 'done' as const, text: result.text } : f)));
        try {
          const thumbnail = await generateThumbnail(file);
          saveToHistory({ thumbnail, text: result.text, language: selectedLanguage, confidence: result.confidence, wordCount: result.text.trim() ? result.text.trim().split(/\s+/).filter(Boolean).length : 0 });
        } catch {}
      } catch (err) {
        setBatchFiles((prev) => prev.map((f, i) => (i === batchIndex ? { ...f, status: 'error' as const, error: err instanceof Error ? err.message : 'Failed' } : f)));
      }
    },
    [batchFiles, selectedLanguage]
  );

  const handleBatchSelect = useCallback((files: File[]) => {
    setIsBatchMode(true);
    setBatchFiles(files.map((file) => ({ file, status: 'pending' as const, previewUrl: URL.createObjectURL(file) })));
    setActiveBatchIndex(0);
  }, []);

  useEffect(() => {
    if (!isBatchMode) return;
    const pending = batchFiles.findIndex((f) => f.status === 'pending');
    if (pending === -1) return;
    processBatchFile(pending);
  }, [isBatchMode, batchFiles, processBatchFile]);

  const extractImageFromClipboard = useCallback(
    async (e?: ClipboardEvent) => {
      if (isProcessing) return;
      if (e?.clipboardData) {
        const files = e.clipboardData.files;
        if (files.length > 0 && ACCEPTED_MIME_TYPES.has(files[0].type)) {
          e.preventDefault();
          handleFileSelect(files[0]);
          return;
        }
      }
      try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          for (const type of item.types) {
            if (type.startsWith('image/')) {
              const blob = await item.getType(type);
              const ext = type.split('/')[1] === 'jpeg' ? 'jpg' : type.split('/')[1];
              handleFileSelect(new File([blob], `clipboard-image.${ext}`, { type: blob.type }));
              return;
            }
          }
        }
      } catch {}
    },
    [handleFileSelect, isProcessing]
  );

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      extractImageFromClipboard(e);
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [extractImageFromClipboard]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      if (isProcessing) return;
      const files = e.dataTransfer?.files;
      if (!files) return;
      if (files.length === 1) {
        const file = files[0];
        if (ACCEPTED_MIME_TYPES.has(file.type)) handleFileSelect(file);
      } else {
        handleBatchSelect(Array.from(files));
      }
    };
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    return () => { document.removeEventListener('dragover', handleDragOver); document.removeEventListener('drop', handleDrop); };
  }, [handleFileSelect, handleBatchSelect, isProcessing]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === '/') { e.preventDefault(); setShortcutsOpen((prev) => !prev); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') { e.preventDefault(); setHistoryOpen((prev) => !prev); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setUploadedFile(null); setPreviewUrl(null); setExtractedText(''); setError(null); setProgress(null); setIsProcessing(false); setConfidence(null);
  }, [previewUrl]);

  const handleBatchSelectTab = useCallback((index: number) => {
    setActiveBatchIndex(index);
    const entry = batchFiles[index];
    if (entry?.text) setExtractedText(entry.text);
  }, [batchFiles]);

  return (
    <div className="w-full">
      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <HistoryPanel isOpen={historyOpen} onClose={() => setHistoryOpen(false)} onSelectEntry={(text) => setExtractedText(text)} />

      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)} onPaste={() => extractImageFromClipboard()} />
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <button
          onClick={() => setHistoryOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-theme-muted bg-theme-card border border-theme-secondary hover:text-purple-500 hover:border-purple-500/60 transition-all"
          title="History (Ctrl+H)"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          History
        </button>
        <button
          onClick={() => setShortcutsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-theme-muted bg-theme-card border border-theme-secondary hover:text-purple-500 hover:border-purple-500/60 transition-all"
          title="Shortcuts (Ctrl+/)"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Shortcuts
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
        <div className="rounded-2xl bg-theme-card border border-theme-primary p-6 shadow-xl shadow-theme backdrop-blur-sm">
          <ImageUploader onFileSelect={handleFileSelect} previewUrl={previewUrl} isProcessing={isProcessing} onReset={handleReset} selectedLanguage={selectedLanguage} onLanguageChange={setSelectedLanguage} />
        </div>

        <div className="rounded-2xl bg-theme-card border border-theme-primary p-6 shadow-xl shadow-theme backdrop-blur-sm">
          <OCRResult extractedText={extractedText} isProcessing={isProcessing} progress={progress} error={error} hasImage={!!uploadedFile || isBatchMode} confidence={confidence} />
          {extractedText && !isProcessing && (
            <div className="flex gap-3 mt-4">
              <ExportMenu text={extractedText} />
            </div>
          )}
        </div>
      </div>

      {!isBatchMode && !uploadedFile && !isProcessing && (
        <BatchUpload onBatchSelect={handleBatchSelect} isProcessing={isProcessing} />
      )}

      {isBatchMode && (
        <BatchResults files={batchFiles} activeIndex={activeBatchIndex} onSelect={handleBatchSelectTab} isProcessing={isProcessing} />
      )}

      {!uploadedFile && !isBatchMode && !isProcessing && (
        <div className="mt-6 p-4 rounded-xl bg-theme-card border border-theme-primary flex items-start gap-3">
          <svg className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-theme-muted text-sm">
            <span className="text-theme-secondary font-medium">Tips:</span>{' '}
            Drag & drop anywhere, paste with Ctrl+V, or right-click. Select the
            image language for best accuracy. Supports batch processing for multiple images.
            First scan downloads the language model (~10 MB).
          </p>
        </div>
      )}
    </div>
  );
}
