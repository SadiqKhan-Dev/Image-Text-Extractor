'use client';

import type { PDFDocumentProxy } from '@/lib/pdfSetup';
import PDFThumbnail from './PDFThumbnail';

interface PDFPageManagerProps {
  doc: PDFDocumentProxy;
  pageOrder: number[];
  deletedPages: Set<number>;
  rotatedPages: Record<number, number>;
  currentPage: number;
  selectedPages: Set<number>;
  onPageSelect: (page: number) => void;
  onPageDelete: (page: number) => void;
  onPageRestore: (page: number) => void;
  onPageRotate: (page: number) => void;
  onPageDuplicate: (page: number) => void;
  onReorder: (newOrder: number[]) => void;
  onSelectToggle: (page: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export default function PDFPageManager({
  doc, pageOrder, deletedPages, rotatedPages, currentPage, selectedPages,
  onPageSelect, onPageDelete, onPageRestore, onPageRotate, onPageDuplicate, onReorder,
  onSelectToggle, onSelectAll, onDeselectAll
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
    <div className="w-[130px] flex flex-col gap-1.5 overflow-y-auto pr-1 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-theme-faint">{activeCount} page{activeCount !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-0.5">
          <button onClick={onSelectAll} className="text-[9px] text-purple-400 hover:text-purple-300" title="Select all">All</button>
          <span className="text-theme-faint text-[9px]">/</span>
          <button onClick={onDeselectAll} className="text-[9px] text-theme-faint hover:text-theme-secondary" title="Deselect all">None</button>
        </div>
      </div>

      {/* Page thumbnails */}
      {pageOrder.map((pageNum, index) => (
        <div key={pageNum} className="relative group">
          {/* Selection checkbox */}
          <button
            onClick={(e) => { e.stopPropagation(); onSelectToggle(pageNum); }}
            className={`absolute top-0.5 left-0.5 z-10 w-4 h-4 rounded text-[8px] flex items-center justify-center transition-all border ${
              selectedPages.has(pageNum)
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-theme-card/80 border-theme-secondary text-transparent group-hover:border-theme-muted'
            }`}
          >
            {selectedPages.has(pageNum) && '✓'}
          </button>

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
            <div className="absolute top-0.5 right-0.5 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }} className="w-4 h-4 rounded bg-black/70 text-white flex items-center justify-center text-[8px]" title="Move up">↑</button>
              <button onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }} className="w-4 h-4 rounded bg-black/70 text-white flex items-center justify-center text-[8px]" title="Move down">↓</button>
              <button onClick={(e) => { e.stopPropagation(); onPageRotate(pageNum); }} className="w-4 h-4 rounded bg-black/70 text-white flex items-center justify-center text-[8px]" title="Rotate">↻</button>
              <button onClick={(e) => { e.stopPropagation(); onPageDuplicate(pageNum); }} className="w-4 h-4 rounded bg-black/70 text-white flex items-center justify-center text-[8px]" title="Duplicate">⊕</button>
              <button onClick={(e) => { e.stopPropagation(); onPageDelete(pageNum); }} className="w-4 h-4 rounded bg-red-600 text-white flex items-center justify-center text-[8px]" title="Delete">✕</button>
            </div>
          )}

          {/* Restore button for deleted */}
          {deletedPages.has(pageNum) && (
            <button
              onClick={(e) => { e.stopPropagation(); onPageRestore(pageNum); }}
              className="absolute bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-green-600 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Restore
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
