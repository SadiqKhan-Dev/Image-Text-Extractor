'use client';

import type { Annotation } from '@/lib/pdfAnnotation';

interface PDFStampPanelProps {
  pageNumber: number;
  onAddAnnotation: (ann: Annotation) => void;
}

const stamps = [
  { text: 'APPROVED', color: '#4CAF50' },
  { text: 'REJECTED', color: '#F44336' },
  { text: 'CONFIDENTIAL', color: '#FF9800' },
  { text: 'DRAFT', color: '#9E9E9E' },
  { text: 'FINAL', color: '#2196F3' },
  { text: 'PAID', color: '#4CAF50' },
  { text: 'URGENT', color: '#F44336' },
  { text: 'DO NOT COPY', color: '#FF5722' },
  { text: 'VOID', color: '#9C27B0' },
  { text: 'COPY', color: '#607D8B' },
  { text: 'ORIGINAL', color: '#009688' },
  { text: 'FAXED', color: '#795548' },
];

export default function PDFStampPanel({ pageNumber, onAddAnnotation }: PDFStampPanelProps) {
  const handleStamp = (stamp: typeof stamps[0]) => {
    onAddAnnotation({
      id: `ann-${Date.now()}`,
      type: 'text',
      pageNumber,
      color: stamp.color,
      opacity: 0.6,
      strokeWidth: 0,
      x: 80,
      y: 100,
      text: stamp.text,
      fontSize: 36,
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-theme-muted">Click a stamp to place it on the current page.</p>
      <div className="grid grid-cols-2 gap-2">
        {stamps.map((stamp) => (
          <button
            key={stamp.text}
            onClick={() => handleStamp(stamp)}
            className="px-3 py-2.5 rounded-xl border-2 border-dashed text-xs font-bold tracking-wider transition-all hover:scale-105"
            style={{
              color: stamp.color,
              borderColor: stamp.color + '60',
              backgroundColor: stamp.color + '10',
            }}
          >
            {stamp.text}
          </button>
        ))}
      </div>
    </div>
  );
}
