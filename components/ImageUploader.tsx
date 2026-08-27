'use client';

import { useCallback, useRef, useState } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  isProcessing: boolean;
  onReset: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageUploader({
  onFileSelect,
  previewUrl,
  isProcessing,
  onReset,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateAndSelect = useCallback(
    (file: File) => {
      setValidationError(null);

      if (!ACCEPTED_MIME_TYPES.has(file.type)) {
        setValidationError(
          'Unsupported format. Please upload a PNG, JPG, JPEG, or WEBP image.'
        );
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(1);
        setValidationError(
          `File is too large (${sizeMB} MB). Maximum allowed size is 10 MB.`
        );
        return;
      }

      onFileSelect(file);
    },
    [onFileSelect]
  );

  // ── Event handlers ──────────────────────────────────────────────────────────

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSelect(file);
      // Reset so the same file can trigger another change event
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [validateAndSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      // Only fire when leaving the drop zone itself, not a child element
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setIsDragOver(false);
      }
    },
    []
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 rounded-md bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400 text-xs font-bold">
          1
        </span>
        Upload Image
      </h2>

      {!previewUrl ? (
        /* ── Drop zone ─────────────────────────────────────────────────────── */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          aria-label="Upload image file"
          className={[
            'flex-1 min-h-72 rounded-2xl border-2 border-dashed cursor-pointer',
            'flex flex-col items-center justify-center gap-5 p-8',
            'transition-all duration-200 outline-none',
            'focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
            isDragOver
              ? 'border-purple-400 bg-purple-950/40 scale-[1.01]'
              : 'border-slate-700 bg-slate-800/40 hover:border-purple-500/60 hover:bg-slate-800/70',
          ].join(' ')}
        >
          {/* Icon */}
          <div
            className={[
              'w-20 h-20 rounded-2xl flex items-center justify-center transition-colors',
              isDragOver ? 'bg-purple-800/50' : 'bg-slate-700/60',
            ].join(' ')}
          >
            <svg
              className={`w-10 h-10 transition-colors ${
                isDragOver ? 'text-purple-300' : 'text-slate-400'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Labels */}
          <div className="text-center select-none">
            <p className="text-white font-semibold text-xl mb-1">
              {isDragOver ? 'Release to upload' : 'Drag & drop your image'}
            </p>
            <p className="text-slate-400 text-sm">
              or{' '}
              <span className="text-purple-400 underline underline-offset-2">
                click to browse
              </span>
            </p>
          </div>

          {/* Keyboard shortcut hint */}
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span className="px-1.5 py-0.5 rounded border border-slate-600 bg-slate-700/50 font-mono text-slate-400">
              Ctrl+V
            </span>
            <span>to paste from clipboard</span>
          </div>

          {/* Accepted formats hint */}
          <p className="text-slate-500 text-xs">
            PNG · JPG · JPEG · WEBP &nbsp;·&nbsp; Max 10 MB
          </p>

          {/* Validation error */}
          {validationError && (
            <div className="w-full max-w-sm px-4 py-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start gap-2">
              <svg
                className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-400 text-sm">{validationError}</p>
            </div>
          )}
        </div>
      ) : (
        /* ── Image preview ──────────────────────────────────────────────────── */
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative flex-1 min-h-72 rounded-2xl overflow-hidden bg-slate-800/60 border border-slate-700/50 flex items-center justify-center">
            {/* Processing overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 shadow-xl">
                  <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-purple-300 text-sm font-medium">
                    Processing image…
                  </span>
                </div>
              </div>
            )}

            {/* Preview — intentional <img> for blob URLs (next/image does not support blob:) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Uploaded image preview"
              className="max-w-full max-h-[420px] object-contain rounded-xl"
            />
          </div>

          {/* Replace image button */}
          <button
            onClick={onReset}
            disabled={isProcessing}
            className={[
              'w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all',
              'flex items-center justify-center gap-2',
              'border border-slate-700 bg-slate-800/60',
              'text-slate-300 hover:text-white hover:bg-slate-700/80',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            ].join(' ')}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Upload a Different Image
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
