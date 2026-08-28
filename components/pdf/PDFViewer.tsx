'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { PDFDocumentProxy } from '@/lib/pdfSetup';
import { renderPageToCanvas } from '@/lib/pdfUtils';
import { drawAnnotations, type Annotation } from '@/lib/pdfAnnotation';

interface PDFViewerProps {
  doc: PDFDocumentProxy;
  pageNumber: number;
  zoom: number;
  annotations: Annotation[];
  activeTool: string;
  onAnnotationsChange: (annotations: Annotation[]) => void;
}

export default function PDFViewer({ doc, pageNumber, zoom, annotations, activeTool, onAnnotationsChange }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentAnnotation = useRef<Annotation | null>(null);

  const scale = zoom / 100;

  // Render PDF page
  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      const canvas = canvasRef.current;
      if (!canvas || !doc) return;
      const page = await doc.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      await page.render({ canvas, viewport } as any).promise;
      if (!cancelled) drawAnnotations(ctx, annotations);
    };
    render();
    return () => { cancelled = true; };
  }, [doc, pageNumber, scale, annotations]);

  const getCanvasCoords = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'viewer') return;
    isDrawing.current = true;
    startPos.current = getCanvasCoords(e);

    if (activeTool === 'text') {
      const text = prompt('Enter annotation text:');
      if (text) {
        const ann: Annotation = {
          id: `ann-${Date.now()}`, type: 'text', pageNumber,
          color: '#FFEB3B', opacity: 1, strokeWidth: 2,
          x: startPos.current.x, y: startPos.current.y,
          text, fontSize: 14,
        };
        onAnnotationsChange([...annotations, ann]);
      }
      isDrawing.current = false;
      return;
    }

    if (activeTool === 'freehand') {
      currentAnnotation.current = {
        id: `ann-${Date.now()}`, type: 'freehand', pageNumber,
        color: '#FF5722', opacity: 1, strokeWidth: 2,
        points: [startPos.current],
      };
      return;
    }

    if (['highlight', 'underline', 'strikethrough', 'rectangle', 'circle'].includes(activeTool)) {
      currentAnnotation.current = {
        id: `ann-${Date.now()}`, type: activeTool as any, pageNumber,
        color: activeTool === 'highlight' ? '#FFEB3B' : '#FF5722',
        opacity: activeTool === 'highlight' ? 0.3 : 1,
        strokeWidth: activeTool === 'highlight' ? 0 : 2,
        x: startPos.current.x, y: startPos.current.y, width: 0, height: 0,
      } as any;
      return;
    }

    if (['line', 'arrow'].includes(activeTool)) {
      currentAnnotation.current = {
        id: `ann-${Date.now()}`, type: activeTool as any, pageNumber,
        color: '#FF5722', opacity: 1, strokeWidth: 2,
        x1: startPos.current.x, y1: startPos.current.y,
        x2: startPos.current.x, y2: startPos.current.y,
      } as any;
    }
  }, [activeTool, pageNumber, annotations, onAnnotationsChange, getCanvasCoords]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing.current || !currentAnnotation.current) return;
    const pos = getCanvasCoords(e);
    const ann = currentAnnotation.current;

    if (ann.type === 'freehand') {
      (ann as any).points = [...(ann as any).points, pos];
    } else if (['line', 'arrow'].includes(ann.type)) {
      (ann as any).x2 = pos.x;
      (ann as any).y2 = pos.y;
    } else {
      (ann as any).width = pos.x - startPos.current.x;
      (ann as any).height = pos.y - startPos.current.y;
    }

    // Re-render with current annotation
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      const page = doc.getPage(pageNumber);
      page.then((p) => {
        const viewport = p.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        p.render({ canvas, viewport } as any).promise.then(() => {
          drawAnnotations(ctx, [...annotations, ann]);
        });
      });
    }
  }, [doc, pageNumber, scale, annotations, getCanvasCoords]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current || !currentAnnotation.current) {
      isDrawing.current = false;
      return;
    }
    onAnnotationsChange([...annotations, currentAnnotation.current]);
    currentAnnotation.current = null;
    isDrawing.current = false;
  }, [annotations, onAnnotationsChange]);

  const cursorStyle = activeTool === 'viewer' ? 'default' : activeTool === 'text' ? 'text' : 'crosshair';

  return (
    <div ref={containerRef} className="flex-1 overflow-auto flex justify-center bg-theme-secondary/30 rounded-2xl p-4 min-h-0">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="shadow-xl rounded-lg"
        style={{ cursor: cursorStyle }}
      />
    </div>
  );
}
