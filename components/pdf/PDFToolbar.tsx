'use client';

interface PDFToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

const tools = [
  { id: 'viewer', label: 'Viewer', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { id: 'annotate', label: 'Annotate', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
  { id: 'merge', label: 'Merge', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { id: 'split', label: 'Split', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { id: 'convert', label: 'Convert', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  { id: 'ocr', label: 'OCR', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

export default function PDFToolbar({ activeTool, onToolChange, totalPages, currentPage, onPageChange, zoom, onZoomChange }: PDFToolbarProps) {
  const zoomLevels = [50, 75, 100, 125, 150, 200, 300];

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-theme-card border border-theme-secondary mb-4 flex-wrap">
      {/* Tool buttons */}
      <div className="flex items-center gap-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTool === tool.id
                ? 'bg-purple-600 text-white border border-purple-500'
                : 'text-theme-secondary hover:bg-theme-secondary border border-transparent'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
            </svg>
            {tool.label}
          </button>
        ))}
      </div>

      {/* Page navigation */}
      {totalPages > 0 && (
        <div className="flex items-center gap-2">
          <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} className="p-1.5 rounded-lg text-theme-faint hover:bg-theme-secondary disabled:opacity-30">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-xs text-theme-secondary tabular-nums">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => { const v = parseInt(e.target.value); if (v >= 1 && v <= totalPages) onPageChange(v); }}
              className="w-10 text-center bg-theme-secondary rounded px-1 py-0.5 text-xs outline-none border border-theme-muted focus:border-purple-500"
            />
            <span className="mx-1">/</span>
            <span>{totalPages}</span>
          </span>
          <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages} className="p-1.5 rounded-lg text-theme-faint hover:bg-theme-secondary disabled:opacity-30">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}

      {/* Zoom controls */}
      <div className="flex items-center gap-2">
        <button onClick={() => onZoomChange(Math.max(50, zoom - 25))} className="p-1.5 rounded-lg text-theme-faint hover:bg-theme-secondary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
        </button>
        <select
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          className="text-xs bg-theme-secondary text-theme-secondary border border-theme-muted rounded-lg px-2 py-1.5 outline-none"
        >
          {zoomLevels.map((z) => (
            <option key={z} value={z}>{z}%</option>
          ))}
        </select>
        <button onClick={() => onZoomChange(Math.min(300, zoom + 25))} className="p-1.5 rounded-lg text-theme-faint hover:bg-theme-secondary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>
        </button>
      </div>
    </div>
  );
}
