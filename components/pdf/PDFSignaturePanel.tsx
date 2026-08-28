'use client';

import { useRef, useState, useCallback } from 'react';
import type { Annotation } from '@/lib/pdfAnnotation';

interface PDFSignaturePanelProps {
  pageNumber: number;
  onAddAnnotation: (ann: Annotation) => void;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export default function PDFSignaturePanel({ pageNumber, onAddAnnotation, onToast }: PDFSignaturePanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const [color, setColor] = useState('#000000');
  const isDrawing = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (mode !== 'draw') return;
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }, [mode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing.current || mode !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }, [mode, color]);

  const handleMouseUp = useCallback(() => {
    isDrawing.current = false;
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handlePlace = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (mode === 'draw') {
      const ctx = canvas.getContext('2d')!;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let hasContent = false;
      for (let i = 3; i < data.data.length; i += 4) {
        if (data.data[i] > 0) { hasContent = true; break; }
      }
      if (!hasContent) { onToast('error', 'Draw your signature first.'); return; }
    }

    if (mode === 'type' && !typedName.trim()) {
      onToast('error', 'Type your name first.');
      return;
    }

    let text = mode === 'type' ? typedName : 'Signature';
    let fontSize = mode === 'type' ? 24 : 14;

    onAddAnnotation({
      id: `ann-${Date.now()}`,
      type: 'text',
      pageNumber,
      color,
      opacity: 1,
      strokeWidth: 2,
      x: 100,
      y: 200,
      text,
      fontSize,
    });

    onToast('success', 'Signature placed on page. Drag to position.');
    clearCanvas();
  };

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-2">
        <button onClick={() => setMode('draw')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === 'draw' ? 'bg-purple-600 text-white' : 'bg-theme-secondary text-theme-secondary'}`}>
          Draw Signature
        </button>
        <button onClick={() => setMode('type')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === 'type' ? 'bg-purple-600 text-white' : 'bg-theme-secondary text-theme-secondary'}`}>
          Type Signature
        </button>
      </div>

      {mode === 'draw' ? (
        <div className="space-y-2">
          <canvas
            ref={canvasRef}
            width={400}
            height={120}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-32 bg-white rounded-xl border-2 border-dashed border-theme-secondary cursor-crosshair"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs text-theme-muted">Color:</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent" />
            </div>
            <button onClick={clearCanvas} className="text-xs text-red-400 hover:text-red-300">Clear</button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Type your name..."
            className="w-full px-3 py-2 rounded-lg bg-theme-secondary border border-theme-muted text-theme-primary text-sm outline-none focus:border-purple-500 font-serif italic text-lg"
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-theme-muted">Color:</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent" />
          </div>
          {typedName && (
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-2xl font-serif italic" style={{ color }}>{typedName}</p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handlePlace}
        className="w-full py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500"
      >
        Place Signature on Page
      </button>
    </div>
  );
}
