'use client';

import { useState, useCallback } from 'react';
import ImageUploader from './ImageUploader';
import OCRResult from './OCRResult';
import type { OCRProgressInfo } from '@/lib/ocr';

/**
 * OCRApp — root client component.
 *
 * Owns all shared state (uploaded file, preview URL, extracted text, processing
 * status) and passes it down to the two panel components via props.  The actual
 * OCR call lives in lib/ocr.ts and is dynamically imported at call time so that
 * Tesseract.js is never included in the initial page bundle.
 */
export default function OCRApp() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OCRProgressInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── File selection ──────────────────────────────────────────────────────────

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Revoke any existing object URL to avoid memory leaks
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      const newPreviewUrl = URL.createObjectURL(file);
      setUploadedFile(file);
      setPreviewUrl(newPreviewUrl);
      setExtractedText('');
      setError(null);
      setProgress(null);
      setIsProcessing(true);

      try {
        // Dynamic import — Tesseract stays out of the initial bundle
        const { extractTextFromImage } = await import('@/lib/ocr');
        const text = await extractTextFromImage(file, (info) => {
          setProgress(info);
        });
        setExtractedText(text);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred during OCR processing.';
        setError(message);
      } finally {
        setIsProcessing(false);
        setProgress(null);
      }
    },
    [previewUrl]
  );

  // ── Reset ───────────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setUploadedFile(null);
    setPreviewUrl(null);
    setExtractedText('');
    setError(null);
    setProgress(null);
    setIsProcessing(false);
  }, [previewUrl]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Two-column layout on large screens, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
        {/* Left panel — image upload & preview */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
          <ImageUploader
            onFileSelect={handleFileSelect}
            previewUrl={previewUrl}
            isProcessing={isProcessing}
            onReset={handleReset}
          />
        </div>

        {/* Right panel — OCR results */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
          <OCRResult
            extractedText={extractedText}
            isProcessing={isProcessing}
            progress={progress}
            error={error}
            hasImage={!!uploadedFile}
          />
        </div>
      </div>

      {/* Tip bar */}
      {!uploadedFile && !isProcessing && (
        <div className="mt-6 p-4 rounded-xl bg-slate-800/30 border border-slate-800 flex items-start gap-3">
          <svg
            className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-slate-500 text-sm">
            <span className="text-slate-400 font-medium">Tips for better results:</span>{' '}
            Use high-resolution images with clear, well-lit text. Horizontal
            text works best. The first scan loads the language model (~10 MB)
            — subsequent scans are instant.
          </p>
        </div>
      )}
    </div>
  );
}
