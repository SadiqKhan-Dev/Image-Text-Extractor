'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { PDFDocumentProxy } from '@/lib/pdfSetup';
import { renderPageToCanvas } from '@/lib/pdfUtils';
import { drawAnnotations, type Annotation } from '@/lib/pdfAnnotation';

interface PDFViewerProps {
  doc: PDFDocumentProxy;
  pageNumber: number;
  zoom: number;
  fitMode: 'none' | 'width' | 'page';
  annotations: Annotation[];
  activeTool: string;
  annotationColor: string;
  strokeWidth: number;
  fontSize: number;
  opacity: number;
  onAnnotationsChange: (annotations: Annotation[]) => void;
  onToast: (type: any, message: string) => void;
}

export default function PDFViewer({
  doc, pageNumber, zoom, fitMode, annotations, activeTool,
  annotationColor, strokeWidth, fontSize, opacity,
  onAnnotationsChange, onToast
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentAnnotation = useRef<Annotation | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });

  // Calculate scale based on fit mode
  const getScale = useCallback(() => {
    if (fitMode === 'width' && containerSize.width > 0 && pageDimensions.width > 0) {
      return (containerSize.width - 32) / pageDimensions.width;
    }
    if (fitMode === 'page' && containerSize.width > 0 && containerSize.height > 0 && pageDimensions.width > 0 && pageDimensions.height > 0) {
      const scaleX = (containerSize.width - 32) / pageDimensions.width;
      const scaleY = (containerSize.height - 32) / pageDimensions.height;
      return Math.min(scaleX, scaleY);
    }
    return zoom / 100;
  }, [fitMode, zoom, containerSize, pageDimensions]);

  const scale = getScale();

  // Track container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

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
      setPageDimensions({ width: page.getViewport({ scale: 1 }).width, height: page.getViewport({ scale: 1 }).height });
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
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'viewer') return;
    isDrawing.current = true;
    startPos.current = getCanvasCoords(e);

    if (activeTool === 'text' || activeTool === 'note') {
      const text = activeTool === 'note'
        ? prompt('Enter note text:')
        : prompt('Enter text:');
      if (text) {
        const ann: Annotation = {
          id: `ann-${Date.now()}`, type: 'text', pageNumber,
          color: activeTool === 'note' ? '#FFEB3B' : annotationColor,
          opacity: activeTool === 'note' ? 0.9 : opacity,
          strokeWidth: 0,
          x: startPos.current.x, y: startPos.current.y,
          text: activeTool === 'note' ? `📝 ${text}` : text,
          fontSize: activeTool === 'note' ? 12 : fontSize,
        };
        onAnnotationsChange([...annotations, ann]);
      }
      isDrawing.current = false;
      return;
    }

    if (activeTool === 'freehand') {
      currentAnnotation.current = {
        id: `ann-${Date.now()}`, type: 'freehand', pageNumber,
        color: annotationColor, opacity, strokeWidth,
        points: [startPos.current],
      };
      return;
    }

    if (['highlight', 'underline', 'strikethrough', 'rectangle', 'circle'].includes(activeTool)) {
      currentAnnotation.current = {
        id: `ann-${Date.now()}`, type: activeTool as any, pageNumber,
        color: activeTool === 'highlight' ? '#FFEB3B' : annotationColor,
        opacity: activeTool === 'highlight' ? 0.3 : opacity,
        strokeWidth: activeTool === 'highlight' ? 0 : strokeWidth,
        x: startPos.current.x, y: startPos.current.y, width: 0, height: 0,
      } as any;
      return;
    }

    if (['line', 'arrow'].includes(activeTool)) {
      currentAnnotation.current = {
        id: `ann-${Date.now()}`, type: activeTool as any, pageNumber,
        color: annotationColor, opacity, strokeWidth,
        x1: startPos.current.x, y1: startPos.current.y,
        x2: startPos.current.x, y2: startPos.current.y,
      } as any;
    }
  }, [activeTool, pageNumber, annotations, onAnnotationsChange, getCanvasCoords, annotationColor, strokeWidth, fontSize, opacity]);

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

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      doc.getPage(pageNumber).then((p) => {
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

  const cursorStyle = activeTool === 'viewer' ? 'default' : activeTool === 'text' || activeTool === 'note' ? 'text' : 'crosshair';

  return (
    <div ref={containerRef} className="flex-1 overflow-auto flex justify-center bg-theme-secondary/30 rounded-2xl p-4 min-h-0">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="shadow-xl rounded-lg max-w-full"
        style={{ cursor: cursorStyle }}
      />
    </div>
  );
}
