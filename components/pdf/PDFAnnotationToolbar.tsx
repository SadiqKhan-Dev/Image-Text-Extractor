'use client';

import { useState } from 'react';

interface PDFAnnotationToolbarProps {
  activeTool: string;
  onToolSelect: (tool: string) => void;
  color: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  onDeleteAnnotation: () => void;
}

const annotationTools = [
  { id: 'highlight', label: 'Highlight', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { id: 'underline', label: 'Underline', icon: 'M7 11h10m-5-4v8m-3 0h6' },
  { id: 'strikethrough', label: 'Strike', icon: 'M17 12H7m10-4H7m10 8H7' },
  { id: 'text', label: 'Text', icon: 'M4 6h16M4 12h16m-7 6h7' },
  { id: 'note', label: 'Note', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
  { id: 'rectangle', label: 'Rect', icon: 'M4 4h16v16H4V4z' },
  { id: 'circle', label: 'Circle', icon: 'M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0' },
  { id: 'line', label: 'Line', icon: 'M4 20L20 4' },
  { id: 'arrow', label: 'Arrow', icon: 'M5 19L19 5m0 0v10m0-10H9' },
  { id: 'freehand', label: 'Draw', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
];

const presetColors = ['#FF5722', '#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FF9800', '#FFEB3B', '#00BCD4', '#000000', '#FFFFFF'];

export default function PDFAnnotationToolbar({
  activeTool, onToolSelect, color, onColorChange, strokeWidth, onStrokeWidthChange,
  fontSize, onFontSizeChange, opacity, onOpacityChange, onDeleteAnnotation
}: PDFAnnotationToolbarProps) {
  const [showCustomColor, setShowCustomColor] = useState(false);

  return (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-theme-card border border-theme-secondary mb-2 flex-wrap">
      {/* Drawing tools */}
      <div className="flex items-center gap-0.5">
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
      </div>

      <div className="w-px h-6 bg-theme-secondary" />

      {/* Color picker */}
      <div className="flex items-center gap-1">
        {presetColors.map((c) => (
          <button
            key={c}
            onClick={() => onColorChange(c)}
            className={`w-5 h-5 rounded-full border-2 transition-all ${color === c ? 'border-purple-400 scale-125' : 'border-theme-secondary'}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <div className="relative">
          <button
            onClick={() => setShowCustomColor(!showCustomColor)}
            className="w-5 h-5 rounded-full border-2 border-theme-secondary flex items-center justify-center text-[8px] text-theme-faint hover:border-purple-400"
            title="Custom color"
          >
            +
          </button>
          {showCustomColor && (
            <div className="absolute top-7 right-0 z-50 bg-theme-card border border-theme-secondary rounded-lg p-2 shadow-xl">
              <input
                type="color"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-32 h-8 cursor-pointer"
              />
              <p className="text-[9px] text-theme-faint mt-1 text-center">{color}</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-px h-6 bg-theme-secondary" />

      {/* Stroke width */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-theme-faint">Size:</span>
        <select value={strokeWidth} onChange={(e) => onStrokeWidthChange(Number(e.target.value))} className="text-[10px] bg-theme-secondary rounded px-1 py-0.5 border border-theme-muted">
          <option value={1}>1px</option>
          <option value={2}>2px</option>
          <option value={3}>3px</option>
          <option value={4}>4px</option>
          <option value={5}>5px</option>
          <option value={8}>8px</option>
        </select>
      </div>

      {/* Opacity */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-theme-faint">Opacity:</span>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.1}
          value={opacity}
          onChange={(e) => onOpacityChange(Number(e.target.value))}
          className="w-16 h-1"
        />
        <span className="text-[10px] text-theme-faint w-6">{Math.round(opacity * 100)}%</span>
      </div>

      {/* Font size (for text/note tool) */}
      {(activeTool === 'text' || activeTool === 'note') && (
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-theme-faint">Font:</span>
          <select value={fontSize} onChange={(e) => onFontSizeChange(Number(e.target.value))} className="text-[10px] bg-theme-secondary rounded px-1 py-0.5 border border-theme-muted">
            <option value={10}>10</option>
            <option value={12}>12</option>
            <option value={14}>14</option>
            <option value={16}>16</option>
            <option value={20}>20</option>
            <option value={24}>24</option>
            <option value={32}>32</option>
            <option value={48}>48</option>
          </select>
        </div>
      )}

      <div className="w-px h-6 bg-theme-secondary" />

      {/* Delete last annotation */}
      <button
        onClick={onDeleteAnnotation}
        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
        title="Undo last annotation (Delete key)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
