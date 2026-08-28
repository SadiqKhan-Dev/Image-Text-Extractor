'use client';

interface PDFAnnotationToolbarProps {
  activeTool: string;
  onToolSelect: (tool: string) => void;
  color: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

const annotationTools = [
  { id: 'highlight', label: 'Highlight', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { id: 'underline', label: 'Underline', icon: 'M7 11h10m-5-4v8m-3 0h6' },
  { id: 'strikethrough', label: 'Strikethrough', icon: 'M17 12H7m10-4H7m10 8H7' },
  { id: 'text', label: 'Text', icon: 'M4 6h16M4 12h16m-7 6h7' },
  { id: 'rectangle', label: 'Rectangle', icon: 'M4 4h16v16H4V4z' },
  { id: 'circle', label: 'Circle', icon: 'M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0' },
  { id: 'line', label: 'Line', icon: 'M4 20L20 4' },
  { id: 'arrow', label: 'Arrow', icon: 'M5 19L19 5m0 0v10m0-10H9' },
  { id: 'freehand', label: 'Freehand', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
];

const colors = ['#FFEB3B', '#FF9800', '#FF5722', '#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#00BCD4'];

export default function PDFAnnotationToolbar({
  activeTool, onToolSelect, color, onColorChange, strokeWidth, onStrokeWidthChange, fontSize, onFontSizeChange
}: PDFAnnotationToolbarProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-theme-card border border-theme-secondary mb-2 flex-wrap">
      <span className="text-xs text-theme-muted font-medium">Annotate:</span>
      {annotationTools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolSelect(tool.id)}
          className={`p-1.5 rounded-lg transition-all ${
            activeTool === tool.id ? 'bg-purple-600 text-white' : 'text-theme-secondary hover:bg-theme-secondary'
          }`}
          title={tool.label}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
          </svg>
        </button>
      ))}

      <div className="w-px h-6 bg-theme-secondary" />

      {/* Color picker */}
      <div className="flex items-center gap-1">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onColorChange(c)}
            className={`w-5 h-5 rounded-full border-2 transition-all ${color === c ? 'border-white scale-125' : 'border-theme-secondary'}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="w-px h-6 bg-theme-secondary" />

      {/* Stroke width */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-theme-faint">Width:</span>
        <select value={strokeWidth} onChange={(e) => onStrokeWidthChange(Number(e.target.value))} className="text-[10px] bg-theme-secondary rounded px-1 py-0.5 border border-theme-muted">
          <option value={1}>1px</option>
          <option value={2}>2px</option>
          <option value={3}>3px</option>
          <option value={4}>4px</option>
          <option value={5}>5px</option>
        </select>
      </div>

      {/* Font size (for text tool) */}
      {activeTool === 'text' && (
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-theme-faint">Font:</span>
          <select value={fontSize} onChange={(e) => onFontSizeChange(Number(e.target.value))} className="text-[10px] bg-theme-secondary rounded px-1 py-0.5 border border-theme-muted">
            <option value={10}>10px</option>
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={20}>20px</option>
            <option value={24}>24px</option>
          </select>
        </div>
      )}
    </div>
  );
}
