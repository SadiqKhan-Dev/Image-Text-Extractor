'use client';

import { useCallback, useRef, useState } from 'react';

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
}

export default function PDFUploader({ onFileSelect }: PDFUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback((file: File) => {
    setError(null);
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum 50 MB.`);
      return;
    }
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSelect(file);
  }, [validateAndSelect]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onClick={() => fileInputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      aria-label="Upload PDF file"
      className={`flex-1 min-h-80 rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-5 p-8 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
        isDragOver ? 'border-purple-400 bg-purple-500/10 scale-[1.01]' : 'border-theme-secondary bg-theme-card hover:border-purple-500/60 hover:bg-theme-card-hover'
      }`}
    >
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-colors ${isDragOver ? 'bg-purple-500/20' : 'bg-theme-secondary'}`}>
        <svg className={`w-10 h-10 transition-colors ${isDragOver ? 'text-purple-500' : 'text-theme-faint'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>

      <div className="text-center select-none">
        <p className="text-theme-primary font-semibold text-xl mb-1">
          {isDragOver ? 'Release to upload' : 'Drag & drop your PDF'}
        </p>
        <p className="text-theme-muted text-sm">
          or <span className="text-purple-500 underline underline-offset-2">click to browse</span>
        </p>
      </div>

      <p className="text-theme-faint text-xs">PDF &nbsp;·&nbsp; Max 50 MB</p>

      {error && (
        <div className="w-full max-w-sm px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-500/50 flex items-start gap-2">
          <svg className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndSelect(f); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="hidden" />
    </div>
  );
}
