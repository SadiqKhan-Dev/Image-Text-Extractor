'use client';

import { useState, useRef } from 'react';
import { createWorker, type Worker } from 'tesseract.js';
import type { PDFDocumentProxy } from '@/lib/pdfSetup';
import { renderPageToImage } from '@/lib/pdfUtils';

interface PDFOCRPanelProps {
  doc: PDFDocumentProxy;
  totalPages: number;
  currentPage: number;
}

interface OCRResult {
  text: string;
  confidence: number;
}

export default function PDFOCRPanel({ doc, totalPages, currentPage }: PDFOCRPanelProps) {
  const [results, setResults] = useState<Record<number, OCRResult>>({});
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedPage, setSelectedPage] = useState(currentPage);
  const [language, setLanguage] = useState('eng');
  const workerRef = useRef<Worker | null>(null);

  const languages = [
    { code: 'eng', name: 'English' },
    { code: 'spa', name: 'Spanish' },
    { code: 'fra', name: 'French' },
    { code: 'deu', name: 'German' },
    { code: 'ita', name: 'Italian' },
    { code: 'por', name: 'Portuguese' },
    { code: 'rus', name: 'Russian' },
    { code: 'jpn', name: 'Japanese' },
    { code: 'chi_sim', name: 'Chinese (Simp)' },
    { code: 'chi_tra', name: 'Chinese (Trad)' },
    { code: 'kor', name: 'Korean' },
    { code: 'ara', name: 'Arabic' },
    { code: 'hin', name: 'Hindi' },
  ];

  const getWorker = async () => {
    if (!workerRef.current) {
      workerRef.current = await createWorker(language);
    }
    return workerRef.current;
  };

  const handleExtractSingle = async () => {
    setProcessing(true);
    try {
      const worker = await getWorker();
      const blob = await renderPageToImage(doc, selectedPage, 2, 'png');
      const { data } = await worker.recognize(blob);
      setResults((prev) => ({ ...prev, [selectedPage]: { text: data.text, confidence: data.confidence } }));
    } catch {
      console.error('OCR failed');
    }
    setProcessing(false);
  };

  const handleExtractAll = async () => {
    setProcessing(true);
    setProgress(0);
    try {
      const worker = await getWorker();
      for (let i = 1; i <= totalPages; i++) {
        setProgress(Math.round((i / totalPages) * 100));
        const blob = await renderPageToImage(doc, i, 2, 'png');
        const { data } = await worker.recognize(blob);
        setResults((prev) => ({ ...prev, [i]: { text: data.text, confidence: data.confidence } }));
      }
    } catch {
      console.error('OCR failed');
    }
    setProcessing(false);
    setProgress(0);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleExportTxt = () => {
    const allText = Object.entries(results)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([page, r]) => `--- Page ${page} ---\n${r.text}`)
      .join('\n\n');
    const blob = new Blob([allText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ocr-results.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const allText = Object.entries(results)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([page, r]) => `--- Page ${page} ---\n${r.text}`)
    .join('\n\n');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="text-sm bg-theme-secondary rounded-lg px-2 py-1.5 border border-theme-muted">
          {languages.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
        <select value={selectedPage} onChange={(e) => setSelectedPage(Number(e.target.value))} className="text-sm bg-theme-secondary rounded-lg px-2 py-1.5 border border-theme-muted">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <option key={p} value={p}>Page {p}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button onClick={handleExtractSingle} disabled={processing} className="flex-1 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 disabled:opacity-50">
          {processing ? 'Extracting...' : 'Extract Current Page'}
        </button>
        <button onClick={handleExtractAll} disabled={processing} className="flex-1 py-2 rounded-lg bg-theme-secondary text-theme-primary text-sm font-medium hover:bg-theme-muted disabled:opacity-50">
          {processing ? `Extracting... ${progress}%` : 'Extract All Pages'}
        </button>
      </div>

      {processing && (
        <div className="w-full bg-theme-secondary rounded-full h-2">
          <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Results per page */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {Object.entries(results)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([page, result]) => (
            <div key={page} className="bg-theme-secondary/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-theme-primary">Page {page}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${result.confidence > 80 ? 'bg-green-500/20 text-green-500' : result.confidence > 50 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>
                    {result.confidence.toFixed(1)}%
                  </span>
                  <button onClick={() => handleCopyText(result.text)} className="text-[10px] text-purple-400 hover:text-purple-300">Copy</button>
                </div>
              </div>
              <p className="text-xs text-theme-secondary whitespace-pre-wrap leading-relaxed">{result.text}</p>
            </div>
          ))}
      </div>

      {Object.keys(results).length > 0 && (
        <div className="flex gap-2">
          <button onClick={() => handleCopyText(allText)} className="flex-1 py-2 rounded-lg bg-theme-secondary text-theme-primary text-sm font-medium hover:bg-theme-muted">
            Copy All Text
          </button>
          <button onClick={handleExportTxt} className="flex-1 py-2 rounded-lg bg-theme-secondary text-theme-primary text-sm font-medium hover:bg-theme-muted">
            Export as TXT
          </button>
        </div>
      )}
    </div>
  );
}
