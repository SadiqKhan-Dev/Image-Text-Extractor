'use client';

import { useState } from 'react';
import type { PDFDocumentProxy } from '@/lib/pdfSetup';
import { addWatermark } from '@/lib/pdfExport';

interface PDFWatermarkPanelProps {
  pdfFile: File;
  totalPages: number;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export default function PDFWatermarkPanel({ pdfFile, totalPages, onToast }: PDFWatermarkPanelProps) {
  const [text, setText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(50);
  const [color, setColor] = useState('#999999');
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(-45);
  const [processing, setProcessing] = useState(false);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [useAllPages, setUseAllPages] = useState(true);

  const presets = [
    { text: 'CONFIDENTIAL', label: 'Confidential' },
    { text: 'DRAFT', label: 'Draft' },
    { text: 'APPROVED', label: 'Approved' },
    { text: 'REJECTED', label: 'Rejected' },
    { text: 'DO NOT COPY', label: 'Do Not Copy' },
    { text: 'SAMPLE', label: 'Sample' },
  ];

  const togglePage = (page: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      next.has(page) ? next.delete(page) : next.add(page);
      return next;
    });
  };

  const handleApply = async () => {
    if (!text.trim()) { onToast('error', 'Enter watermark text.'); return; }
    setProcessing(true);
    try {
      const pages = useAllPages ? undefined : Array.from(selectedPages).map((p) => p - 1);
      const blob = await addWatermark(pdfFile, text, { fontSize, color, opacity, rotation, pages });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'watermarked.pdf';
      a.click();
      URL.revokeObjectURL(url);
      onToast('success', 'Watermark applied successfully!');
    } catch {
      onToast('error', 'Failed to apply watermark.');
    }
    setProcessing(false);
  };

  return (
    <div className="space-y-5">
      {/* Preset buttons */}
      <div>
        <label className="text-xs text-theme-muted block mb-2">Quick Presets</label>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.text}
              onClick={() => setText(p.text)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                text === p.text ? 'bg-purple-600 text-white' : 'bg-theme-secondary text-theme-secondary hover:bg-theme-muted'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text input */}
      <div>
        <label className="text-xs text-theme-muted block mb-1">Watermark Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-theme-secondary border border-theme-muted text-theme-primary text-sm outline-none focus:border-purple-500"
        />
      </div>

      {/* Settings grid */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-theme-muted block mb-1">Font Size</label>
          <input type="range" min={20} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
          <span className="text-[10px] text-theme-faint">{fontSize}px</span>
        </div>
        <div>
          <label className="text-xs text-theme-muted block mb-1">Rotation</label>
          <input type="range" min={-90} max={90} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full" />
          <span className="text-[10px] text-theme-faint">{rotation}°</span>
        </div>
        <div>
          <label className="text-xs text-theme-muted block mb-1">Opacity</label>
          <input type="range" min={0.05} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full" />
          <span className="text-[10px] text-theme-faint">{Math.round(opacity * 100)}%</span>
        </div>
        <div>
          <label className="text-xs text-theme-muted block mb-1">Color</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-8 rounded-lg cursor-pointer bg-transparent" />
        </div>
      </div>

      {/* Page selection */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" checked={useAllPages} onChange={() => setUseAllPages(true)} className="accent-purple-600" />
            <span className="text-xs text-theme-secondary">All pages</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" checked={!useAllPages} onChange={() => setUseAllPages(false)} className="accent-purple-600" />
            <span className="text-xs text-theme-secondary">Select pages</span>
          </label>
        </div>
        {!useAllPages && (
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => togglePage(p)}
                className={`w-7 h-7 rounded text-[10px] font-medium transition-all ${
                  selectedPages.has(p) ? 'bg-purple-600 text-white' : 'bg-theme-secondary text-theme-secondary hover:bg-theme-muted'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="bg-theme-secondary/30 rounded-xl p-6 flex items-center justify-center h-32 overflow-hidden relative">
        <div
          className="text-2xl font-bold select-none pointer-events-none"
          style={{
            color,
            opacity,
            transform: `rotate(${rotation}deg)`,
            fontSize: `${Math.min(fontSize, 36)}px`,
          }}
        >
          {text || 'Preview'}
        </div>
      </div>

      <button
        onClick={handleApply}
        disabled={processing || !text.trim()}
        className="w-full py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 disabled:opacity-50"
      >
        {processing ? 'Applying...' : 'Apply Watermark & Download'}
      </button>
    </div>
  );
}
