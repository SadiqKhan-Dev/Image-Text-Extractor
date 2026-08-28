'use client';

import { useState, useCallback, useRef } from 'react';

const ACCEPTED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

interface BatchUploadProps {
  onBatchSelect: (files: File[]) => void;
  isProcessing: boolean;
}

export default function BatchUpload({ onBatchSelect, isProcessing }: BatchUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const validFiles: File[] = [];

      for (const file of Array.from(files)) {
        if (!ACCEPTED_MIME_TYPES.has(file.type)) continue;
        if (file.size > MAX_FILE_SIZE_BYTES) continue;
        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        setError('No valid images found. Accepted: PNG, JPG, JPEG, WEBP (max 10 MB each).');
        return;
      }

      onBatchSelect(validFiles);
    },
    [onBatchSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        validateAndSelect(e.dataTransfer.files);
      }
    },
    [validateAndSelect]
  );

  return (
    <div className="mt-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={[
          'rounded-xl border-2 border-dashed cursor-pointer p-4 text-center transition-all',
          isDragOver
            ? 'border-purple-400 bg-purple-950/30'
            : 'border-slate-700 dark:border-slate-700 border-slate-300 bg-slate-800/30 dark:bg-slate-800/30 bg-slate-50 hover:border-purple-500/60',
          isProcessing && 'opacity-50 cursor-not-allowed',
        ].join(' ')}
      >
        <div className="flex items-center justify-center gap-3">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <div>
            <p className="text-sm font-medium text-slate-300 dark:text-slate-300 text-slate-600">
              {isDragOver ? 'Drop images here' : 'Add more images (batch mode)'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 text-slate-400">
              Select multiple files or drag & drop
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400 dark:text-red-400 text-red-500">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        multiple
        onChange={(e) => {
          if (e.target.files) validateAndSelect(e.target.files);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
        className="hidden"
      />
    </div>
  );
}
