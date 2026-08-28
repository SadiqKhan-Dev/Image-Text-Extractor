'use client';

import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from '@/lib/pdfSetup';
import { renderPageToCanvas } from '@/lib/pdfUtils';

interface PDFThumbnailProps {
  doc: PDFDocumentProxy;
  pageNumber: number;
  isSelected: boolean;
  isDeleted: boolean;
  rotation: number;
  onClick: () => void;
}

export default function PDFThumbnail({ doc, pageNumber, isSelected, isDeleted, rotation, onClick }: PDFThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      const canvas = canvasRef.current;
      if (!canvas || !doc) return;
      const page = await doc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 0.2, rotation });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      await page.render({ canvas, viewport } as any).promise;
      if (!cancelled) setRendered(true);
    };
    render();
    return () => { cancelled = true; };
  }, [doc, pageNumber, rotation]);

  return (
    <div
      onClick={isDeleted ? undefined : onClick}
      className={`relative flex flex-col items-center gap-1 cursor-pointer group transition-all ${
        isDeleted ? 'opacity-30' : isSelected ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-theme-bg rounded-lg' : 'hover:ring-2 hover:ring-theme-muted rounded-lg'
      }`}
    >
      <div className="w-[100px] h-[130px] flex items-center justify-center bg-white rounded shadow-sm overflow-hidden">
        {!rendered && <div className="w-full h-full animate-pulse bg-theme-secondary" />}
        <canvas ref={canvasRef} className="max-w-full max-h-full" />
      </div>
      <span className="text-[10px] text-theme-faint tabular-nums">Page {pageNumber}</span>
      {isDeleted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
    </div>
  );
}
