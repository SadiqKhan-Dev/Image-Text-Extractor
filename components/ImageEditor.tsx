'use client';

import { useState, useCallback } from 'react';
import { rotateImage, adjustBrightness, adjustContrast } from '@/lib/imageProcessing';

interface ImageEditorProps { currentImage: File; onImageProcessed: (file: File) => void; isProcessing: boolean; }

export default function ImageEditor({ currentImage, onImageProcessed, isProcessing }: ImageEditorProps) {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [isApplying, setIsApplying] = useState(false);

  const handleRotate = useCallback(async (degrees: number) => {
    setIsApplying(true);
    try { const result = await rotateImage(currentImage, degrees); onImageProcessed(result); } finally { setIsApplying(false); }
  }, [currentImage, onImageProcessed]);

  const handleApplyAdjustments = useCallback(async () => {
    if (brightness === 0 && contrast === 0) return;
    setIsApplying(true);
    try {
      let result = currentImage;
      if (brightness !== 0) result = await adjustBrightness(result, brightness);
      if (contrast !== 0) result = await adjustContrast(result, contrast);
      onImageProcessed(result); setBrightness(0); setContrast(0);
    } finally { setIsApplying(false); }
  }, [currentImage, brightness, contrast, onImageProcessed]);

  const disabled = isProcessing || isApplying;

  return (
    <div className="mt-3 p-3 rounded-xl bg-theme-secondary/50 border border-theme-muted">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        <span className="text-xs font-medium text-theme-faint">Image Editor</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-theme-faint w-12">Rotate</span>
        <div className="flex gap-1.5">
          {[90, 180, 270].map((deg) => (
            <button key={deg} onClick={() => handleRotate(deg)} disabled={disabled} className="px-2.5 py-1 rounded-lg text-xs font-mono text-theme-secondary bg-theme-secondary border border-theme-muted hover:border-purple-500/60 hover:text-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              {deg}°
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-theme-faint w-12">Bright</span>
        <input type="range" min="-100" max="100" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} disabled={disabled} className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer disabled:opacity-40" />
        <span className="text-xs text-theme-faint tabular-nums w-8 text-right">{brightness}</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-theme-faint w-12">Contrast</span>
        <input type="range" min="-100" max="100" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} disabled={disabled} className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer disabled:opacity-40" />
        <span className="text-xs text-theme-faint tabular-nums w-8 text-right">{contrast}</span>
      </div>

      {(brightness !== 0 || contrast !== 0) && (
        <button onClick={handleApplyAdjustments} disabled={disabled} className="w-full py-1.5 rounded-lg text-xs font-medium text-purple-500 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          {isApplying ? 'Applying...' : 'Apply Adjustments'}
        </button>
      )}
    </div>
  );
}
