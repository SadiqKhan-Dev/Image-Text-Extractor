'use client';

import { useState, useCallback } from 'react';
import { mergePDFs, extractPages, splitPDF } from '@/lib/pdfMergeSplit';

interface PDFMergeSplitProps {
  pdfFile: File | null;
  totalPages: number;
}

export default function PDFMergeSplit({ pdfFile, totalPages }: PDFMergeSplitProps) {
  const [mode, setMode] = useState<'merge' | 'split'>('merge');
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [splitMode, setSplitMode] = useState<'selected' | 'individual' | 'ranges'>('selected');
  const [ranges, setRanges] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleMergeFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMergeFiles((prev) => [...prev, ...files]);
  }, []);

  const handleMerge = async () => {
    if (mergeFiles.length < 2) { setMessage({ type: 'error', text: 'Add at least 2 PDF files to merge.' }); return; }
    setProcessing(true);
    setMessage(null);
    try {
      const blob = await mergePDFs(mergeFiles);
      downloadBlob(blob, 'merged.pdf');
      setMessage({ type: 'success', text: `Merged ${mergeFiles.length} PDFs successfully!` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to merge PDFs.' });
    }
    setProcessing(false);
  };

  const handleSplit = async () => {
    if (!pdfFile) return;
    setProcessing(true);
    setMessage(null);
    try {
      if (splitMode === 'individual') {
        const pages = await splitPDF(pdfFile);
        for (let i = 0; i < pages.length; i++) {
          downloadBlob(pages[i], `page-${i + 1}.pdf`);
        }
        setMessage({ type: 'success', text: `Split into ${pages.length} files.` });
      } else if (splitMode === 'selected') {
        const indices = Array.from(selectedPages).map((p) => p - 1);
        if (indices.length === 0) { setMessage({ type: 'error', text: 'Select pages to extract.' }); setProcessing(false); return; }
        const blob = await extractPages(pdfFile, indices);
        downloadBlob(blob, 'extracted.pdf');
        setMessage({ type: 'success', text: `Extracted ${indices.length} pages.` });
      } else {
        const pageIndices = parseRanges(ranges, totalPages);
        if (pageIndices.length === 0) { setMessage({ type: 'error', text: 'Enter valid page ranges (e.g., 1-3,5,7-10).' }); setProcessing(false); return; }
        const blob = await extractPages(pdfFile, pageIndices.map((p) => p - 1));
        downloadBlob(blob, 'extracted.pdf');
        setMessage({ type: 'success', text: `Extracted ${pageIndices.length} pages.` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to split PDF.' });
    }
    setProcessing(false);
  };

  const togglePage = (page: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      next.has(page) ? next.delete(page) : next.add(page);
      return next;
    });
  };

  const selectAll = () => {
    const all = new Set(Array.from({ length: totalPages }, (_, i) => i + 1));
    setSelectedPages(all);
  };

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-2">
        <button onClick={() => setMode('merge')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'merge' ? 'bg-purple-600 text-white' : 'bg-theme-secondary text-theme-secondary'}`}>
          Merge PDFs
        </button>
        <button onClick={() => setMode('split')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'split' ? 'bg-purple-600 text-white' : 'bg-theme-secondary text-theme-secondary'}`}>
          Split / Extract
        </button>
      </div>

      {mode === 'merge' ? (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-theme-secondary rounded-xl p-6 text-center">
            <input type="file" accept=".pdf" multiple onChange={handleMergeFiles} className="hidden" id="merge-input" />
            <label htmlFor="merge-input" className="cursor-pointer text-theme-muted hover:text-theme-primary">
              + Add PDF files
            </label>
          </div>
          {mergeFiles.length > 0 && (
            <div className="space-y-2">
              {mergeFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-theme-secondary/50 rounded-lg px-3 py-2 text-sm">
                  <span className="text-theme-primary truncate">{f.name}</span>
                  <button onClick={() => setMergeFiles((prev) => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                </div>
              ))}
              <button onClick={handleMerge} disabled={processing} className="w-full py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 disabled:opacity-50">
                {processing ? 'Merging...' : `Merge ${mergeFiles.length} PDFs`}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2 text-sm">
            {(['selected', 'individual', 'ranges'] as const).map((m) => (
              <button key={m} onClick={() => setSplitMode(m)} className={`px-3 py-1.5 rounded-lg font-medium transition-all ${splitMode === m ? 'bg-purple-600 text-white' : 'bg-theme-secondary text-theme-secondary'}`}>
                {m === 'selected' ? 'Select Pages' : m === 'individual' ? 'All Pages Separate' : 'By Range'}
              </button>
            ))}
          </div>

          {splitMode === 'selected' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-purple-400 hover:text-purple-300">Select All</button>
                <button onClick={() => setSelectedPages(new Set())} className="text-xs text-theme-faint hover:text-theme-secondary">Clear</button>
                <span className="text-xs text-theme-faint ml-auto">{selectedPages.size} selected</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => togglePage(page)} className={`w-8 h-8 rounded text-xs font-medium transition-all ${selectedPages.has(page) ? 'bg-purple-600 text-white' : 'bg-theme-secondary text-theme-secondary hover:bg-theme-muted'}`}>
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}

          {splitMode === 'ranges' && (
            <input type="text" value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="e.g., 1-3,5,7-10" className="w-full px-3 py-2 rounded-lg bg-theme-secondary border border-theme-muted text-theme-primary text-sm outline-none focus:border-purple-500" />
          )}

          <button onClick={handleSplit} disabled={processing} className="w-full py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 disabled:opacity-50">
            {processing ? 'Processing...' : 'Extract Pages'}
          </button>
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

function parseRanges(input: string, max: number): number[] {
  const pages = new Set<number>();
  input.split(',').forEach((part) => {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(Number);
      for (let i = start; i <= Math.min(end, max); i++) pages.add(i);
    } else {
      const n = Number(trimmed);
      if (n >= 1 && n <= max) pages.add(n);
    }
  });
  return Array.from(pages).sort((a, b) => a - b);
}
