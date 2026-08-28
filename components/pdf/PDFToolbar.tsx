'use client';

interface PDFToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitWidth: () => void;
  onFitPage: () => void;
  fitMode: 'none' | 'width' | 'page';
  onExport: () => void;
  onPrint: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSearch: () => void;
  fileName: string;
}

const tools = [
  { id: 'viewer', label: 'View', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { id: 'annotate', label: 'Annotate', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
  { id: 'stamp', label: 'Stamps', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { id: 'signature', label: 'Sign', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
  { id: 'merge', label: 'Merge', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { id: 'split', label: 'Split', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { id: 'convert', label: 'Convert', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  { id: 'ocr', label: 'OCR', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'watermark', label: 'Watermark', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
  { id: 'search', label: 'Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { id: 'metadata', label: 'Info', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export default function PDFToolbar({
  activeTool, onToolChange, totalPages, currentPage, onPageChange,
  zoom, onZoomChange, onFitWidth, onFitPage, fitMode,
  onExport, onPrint, onUndo, onRedo, canUndo, canRedo, onSearch, fileName
}: PDFToolbarProps) {
  const zoomLevels = [50, 75, 100, 125, 150, 200, 300];

  return (
    <div className="space-y-2 mb-3">
      {/* Top bar: file info + actions */}
      <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-theme-card border border-theme-secondary">
        {/* File name */}
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span className="text-xs text-theme-secondary truncate max-w-[200px]">{fileName}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" className="p-1.5 rounded-lg text-theme-faint hover:bg-theme-secondary disabled:opacity-30 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
          </button>
          <button onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)" className="p-1.5 rounded-lg text-theme-faint hover:bg-theme-secondary disabled:opacity-30 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
          </button>

          <div className="w-px h-5 bg-theme-secondary mx-1" />

          <button onClick={onPrint} title="Print (Ctrl+P)" className="p-1.5 rounded-lg text-theme-faint hover:bg-theme-secondary transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          </button>
          <button onClick={onExport} title="Export (Ctrl+S)" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-500 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export
          </button>
        </div>
      </div>

      {/* Tool tabs + nav + zoom */}
      <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-theme-card border border-theme-secondary flex-wrap">
        {/* Tool buttons */}
        <div className="flex items-center gap-0.5 flex-wrap">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                activeTool === tool.id
                  ? 'bg-purple-600 text-white'
                  : 'text-theme-secondary hover:bg-theme-secondary'
              }`}
              title={tool.label}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
              </svg>
              <span className="hidden lg:inline">{tool.label}</span>
            </button>
          ))}
        </div>

        {/* Page navigation */}
        {totalPages > 0 && (
          <div className="flex items-center gap-1.5">
            <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} className="p-1 rounded-lg text-theme-faint hover:bg-theme-secondary disabled:opacity-30">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-[11px] text-theme-secondary tabular-nums flex items-center gap-0.5">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => { const v = parseInt(e.target.value); if (v >= 1 && v <= totalPages) onPageChange(v); }}
                className="w-8 text-center bg-theme-secondary rounded px-0.5 py-0.5 text-[11px] outline-none border border-theme-muted focus:border-purple-500"
              />
              <span>/ {totalPages}</span>
            </span>
            <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages} className="p-1 rounded-lg text-theme-faint hover:bg-theme-secondary disabled:opacity-30">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button onClick={() => onZoomChange(Math.max(50, zoom - 25))} className="p-1 rounded-lg text-theme-faint hover:bg-theme-secondary" title="Zoom Out (-)">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
          </button>
          <select
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="text-[11px] bg-theme-secondary text-theme-secondary border border-theme-muted rounded-lg px-1.5 py-1 outline-none"
          >
            {zoomLevels.map((z) => (
              <option key={z} value={z}>{z}%</option>
            ))}
          </select>
          <button onClick={() => onZoomChange(Math.min(300, zoom + 25))} className="p-1 rounded-lg text-theme-faint hover:bg-theme-secondary" title="Zoom In (+)">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>

          <div className="w-px h-4 bg-theme-secondary mx-0.5" />

          <button onClick={onFitWidth} className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${fitMode === 'width' ? 'bg-purple-600 text-white' : 'text-theme-faint hover:bg-theme-secondary'}`} title="Fit to Width">
            W
          </button>
          <button onClick={onFitPage} className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${fitMode === 'page' ? 'bg-purple-600 text-white' : 'text-theme-faint hover:bg-theme-secondary'}`} title="Fit to Page">
            P
          </button>
        </div>
      </div>
    </div>
  );
}
