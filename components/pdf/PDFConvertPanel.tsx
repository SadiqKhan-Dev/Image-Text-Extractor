'use client';

import { useState, useCallback } from 'react';
import type { PDFDocumentProxy } from '@/lib/pdfSetup';
import { renderPageToImage } from '@/lib/pdfUtils';
import { imagesToPDF } from '@/lib/pdfMergeSplit';

interface PDFConvertPanelProps {
  doc: PDFDocumentProxy;
  pdfFile: File | null;
  totalPages: number;
  currentPage: number;
}

export default function PDFConvertPanel({ doc, pdfFile, totalPages, currentPage }: PDFConvertPanelProps) {
  const [mode, setMode] = useState<'toImage' | 'toPDF'>('toImage');
  const [dpi, setDpi] = useState(200);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [quality, setQuality] = useState(90);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleExportCurrentPage = async () => {
    setProcessing(true);
    setMessage(null);
    try {
      const scale = dpi / 72;
      const blob = await renderPageToImage(doc, currentPage, scale, format, quality / 100);
      downloadBlob(blob, `page-${currentPage}.${format}`);
      setMessage({ type: 'success', text: `Exported page ${currentPage} as ${format.toUpperCase()}.` });
    } catch {
      setMessage({ type: 'error', text: 'Failed to export page.' });
    }
    setProcessing(false);
  };

  const handleExportAllPages = async () => {
    setProcessing(true);
    setMessage(null);
    setProgress(0);
    try {
      const scale = dpi / 72;
      const blobs: { blob: Blob; name: string }[] = [];
      for (let i = 1; i <= totalPages; i++) {
        setProgress(Math.round((i / totalPages) * 100));
        const blob = await renderPageToImage(doc, i, scale, format, quality / 100);
        blobs.push({ blob, name: `page-${i}.${format}` });
      }

      // Create ZIP if multiple pages
      if (blobs.length > 1) {
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        for (const { blob, name } of blobs) {
          zip.file(name, blob);
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(zipBlob, `pages.zip`);
        setMessage({ type: 'success', text: `Exported ${totalPages} pages as ZIP.` });
      } else {
        downloadBlob(blobs[0].blob, blobs[0].name);
        setMessage({ type: 'success', text: `Exported page 1 as ${format.toUpperCase()}.` });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to export pages.' });
    }
    setProcessing(false);
    setProgress(0);
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
  }, []);

  const handleCreatePDF = async () => {
    if (imageFiles.length === 0) { setMessage({ type: 'error', text: 'Add images first.' }); return; }
    setProcessing(true);
    setMessage(null);
    try {
      const blob = await imagesToPDF(imageFiles, pageSize);
      downloadBlob(blob, 'images.pdf');
      setMessage({ type: 'success', text: `Created PDF with ${imageFiles.length} pages.` });
    } catch {
      setMessage({ type: 'error', text: 'Failed to create PDF.' });
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode('toImage')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'toImage' ? 'bg-purple-600 text-white' : 'bg-theme-secondary text-theme-secondary'}`}>
          PDF → Image
        </button>
        <button onClick={() => setMode('toPDF')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'toPDF' ? 'bg-purple-600 text-white' : 'bg-theme-secondary text-theme-secondary'}`}>
          Image → PDF
        </button>
      </div>

      {mode === 'toImage' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-theme-muted block mb-1">DPI</label>
              <select value={dpi} onChange={(e) => setDpi(Number(e.target.value))} className="w-full text-sm bg-theme-secondary rounded-lg px-2 py-1.5 border border-theme-muted">
                <option value={72}>72 (Screen)</option>
                <option value={150}>150</option>
                <option value={200}>200</option>
                <option value={300}>300 (Print)</option>
                <option value={600}>600 (High)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-theme-muted block mb-1">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="w-full text-sm bg-theme-secondary rounded-lg px-2 py-1.5 border border-theme-muted">
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
              </select>
            </div>
            {format === 'jpeg' && (
              <div>
                <label className="text-xs text-theme-muted block mb-1">Quality</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="flex-1" />
                  <span className="text-[10px] text-theme-faint w-6">{quality}%</span>
                </div>
              </div>
            )}
          </div>

          {processing && progress > 0 && (
            <div className="w-full bg-theme-secondary rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={handleExportCurrentPage} disabled={processing} className="flex-1 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 disabled:opacity-50">
              Export Current Page
            </button>
            <button onClick={handleExportAllPages} disabled={processing} className="flex-1 py-2 rounded-lg bg-theme-secondary text-theme-primary text-sm font-medium hover:bg-theme-muted disabled:opacity-50">
              Export All Pages (ZIP)
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-theme-secondary rounded-xl p-6 text-center">
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="img-input" />
            <label htmlFor="img-input" className="cursor-pointer text-theme-muted hover:text-theme-primary">
              + Add images
            </label>
          </div>
          {imageFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-theme-faint">{imageFiles.length} image(s)</span>
                <button onClick={() => setImageFiles([])} className="text-xs text-red-400 hover:text-red-300">Clear</button>
              </div>

              {/* Image preview list */}
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {imageFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-theme-secondary/50 rounded-lg px-2 py-1">
                    <span className="text-[10px] text-theme-secondary truncate">{f.name}</span>
                    <button onClick={() => setImageFiles((prev) => prev.filter((_, j) => j !== i))} className="text-[10px] text-red-400 hover:text-red-300">✕</button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-theme-muted block mb-1">Page Size</label>
                  <select value={pageSize} onChange={(e) => setPageSize(e.target.value as any)} className="w-full text-sm bg-theme-secondary rounded-lg px-2 py-1.5 border border-theme-muted">
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                    <option value="fit">Fit to Image</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-theme-muted block mb-1">Orientation</label>
                  <select value={orientation} onChange={(e) => setOrientation(e.target.value as any)} className="w-full text-sm bg-theme-secondary rounded-lg px-2 py-1.5 border border-theme-muted">
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>

              <button onClick={handleCreatePDF} disabled={processing} className="w-full py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 disabled:opacity-50">
                {processing ? 'Creating...' : 'Create PDF'}
              </button>
            </div>
          )}
        </div>
      )}

      {message && (
        <div className={`px-3 py-2 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
