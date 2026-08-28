'use client';

import type { PDFDocumentProxy } from '@/lib/pdfSetup';
import PDFThumbnail from './PDFThumbnail';

interface PDFPageManagerProps {
  doc: PDFDocumentProxy;
  pageOrder: number[];
  deletedPages: Set<number>;
  rotatedPages: Record<number, number>;
  currentPage: number;
  onPageSelect: (page: number) => void;
  onPageDelete: (page: number) => void;
  onPageRestore: (page: number) => void;
  onPageRotate: (page: number) => void;
  onReorder: (newOrder: number[]) => void;
}

export default function PDFPageManager({
  doc, pageOrder, deletedPages, rotatedPages, currentPage,
  onPageSelect, onPageDelete, onPageRestore, onPageRotate, onReorder
}: PDFPageManagerProps) {
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...pageOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    onReorder(newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index === pageOrder.length - 1) return;
    const newOrder = [...pageOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    onReorder(newOrder);
  };

  const activeCount = pageOrder.filter((p) => !deletedPages.has(p)).length;

  return (
    <div className="w-[140px] flex flex-col gap-2 overflow-y-auto pr-1 flex-shrink-0">
      <div className="text-xs text-theme-muted text-center mb-1">
        {activeCount} page{activeCount !== 1 ? 's' : ''}
      </div>
      {pageOrder.map((pageNum, index) => (
        <div key={pageNum} className="relative group">
          <PDFThumbnail
            doc={doc}
            pageNumber={pageNum}
            isSelected={currentPage === pageNum}
            isDeleted={deletedPages.has(pageNum)}
            rotation={rotatedPages[pageNum] || 0}
            onClick={() => onPageSelect(pageNum)}
          />
          {/* Action buttons on hover */}
          {!deletedPages.has(pageNum) && (
            <div className="absolute top-1 right-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }} className="w-5 h-5 rounded bg-black/60 text-white flex items-center justify-center text-[10px]" title="Move up">↑</button>
              <button onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }} className="w-5 h-5 rounded bg-black/60 text-white flex items-center justify-center text-[10px]" title="Move down">↓</button>
              <button onClick={(e) => { e.stopPropagation(); onPageRotate(pageNum); }} className="w-5 h-5 rounded bg-black/60 text-white flex items-center justify-center text-[10px]" title="Rotate">↻</button>
              <button onClick={(e) => { e.stopPropagation(); onPageDelete(pageNum); }} className="w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center text-[10px]" title="Delete">✕</button>
            </div>
          )}
          {/* Restore button for deleted */}
          {deletedPages.has(pageNum) && (
            <button
              onClick={(e) => { e.stopPropagation(); onPageRestore(pageNum); }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-green-600 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Restore
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
