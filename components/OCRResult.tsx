'use client';

import { useState, useCallback } from 'react';
import type { OCRProgressInfo } from '@/lib/ocr';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OCRResultProps {
  extractedText: string;
  isProcessing: boolean;
  progress: OCRProgressInfo | null;
  error: string | null;
  hasImage: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OCRResult({
  extractedText,
  isProcessing,
  progress,
  error,
  hasImage,
}: OCRResultProps) {
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>(
    'idle'
  );

  // ── Derived values ──────────────────────────────────────────────────────────

  const words = extractedText.trim()
    ? extractedText.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const chars = extractedText.length;
  const lines = extractedText.trim()
    ? extractedText.trim().split('\n').length
    : 0;

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleCopy = useCallback(async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopyState('success');
    } catch {
      // Fallback for older browsers / non-HTTPS contexts
      try {
        const el = document.createElement('textarea');
        el.value = extractedText;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopyState('success');
      } catch {
        setCopyState('error');
      }
    } finally {
      setTimeout(() => setCopyState('idle'), 2500);
    }
  }, [extractedText]);

  const handleDownload = useCallback(() => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `extracted-text-${new Date()
      .toISOString()
      .slice(0, 10)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [extractedText]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400 text-xs font-bold">
            2
          </span>
          Extracted Text
        </h2>

        {/* Stats */}
        {extractedText && (
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>{words} words</span>
            <span className="text-slate-700">·</span>
            <span>{chars} chars</span>
            <span className="text-slate-700">·</span>
            <span>{lines} lines</span>
          </div>
        )}
      </div>

      {/* ── Progress bar ─────────────────────────────────────────────────────── */}
      {isProcessing && progress && (
        <div className="mb-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-300 text-sm">{progress.status}</span>
            <span className="text-purple-400 text-sm font-semibold tabular-nums">
              {progress.progress}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-violet-400 rounded-full transition-[width] duration-300 ease-out"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Initialising skeleton (before first progress event) ──────────────── */}
      {isProcessing && !progress && (
        <div className="mb-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-slate-400 text-sm">
              Initialising OCR engine… (first run may take a moment)
            </span>
          </div>
          {/* Pulse bar */}
          <div className="mt-3 w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-purple-700/50 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* ── Error banner ─────────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
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
          <div>
            <p className="text-red-400 font-medium text-sm">
              Recognition failed
            </p>
            <p className="text-red-500/80 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* ── Text area ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0">
        <textarea
          value={extractedText}
          readOnly
          placeholder={
            !hasImage
              ? 'Upload an image to start extracting text…'
              : isProcessing
              ? 'Recognising text — please wait…'
              : error
              ? 'No text could be extracted. Try a clearer image.'
              : 'No text found in the image.'
          }
          aria-label="Extracted text output"
          className={[
            'flex-1 min-h-72 w-full p-4 rounded-2xl resize-none',
            'bg-slate-800/50 border text-slate-200 text-sm leading-relaxed',
            'placeholder-slate-600 font-mono',
            'focus:outline-none focus:ring-2 focus:ring-purple-500/60',
            'transition-colors scrollbar-thin',
            extractedText
              ? 'border-slate-600/80'
              : 'border-slate-700/50',
          ].join(' ')}
        />

        {/* ── Action buttons (only shown when there is text) ──────────────────── */}
        {extractedText && !isProcessing && (
          <div className="flex gap-3 mt-4">
            {/* Copy */}
            <button
              onClick={handleCopy}
              className={[
                'flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200',
                'flex items-center justify-center gap-2',
                copyState === 'success'
                  ? 'bg-emerald-600 text-white border border-emerald-500'
                  : copyState === 'error'
                  ? 'bg-red-700 text-white border border-red-600'
                  : 'bg-purple-600 hover:bg-purple-500 text-white border border-purple-500',
              ].join(' ')}
            >
              {copyState === 'success' ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied!
                </>
              ) : copyState === 'error' ? (
                'Copy failed'
              ) : (
                <>
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy Text
                </>
              )}
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className={[
                'flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all',
                'flex items-center justify-center gap-2',
                'border border-slate-600 bg-slate-800/60',
                'text-slate-300 hover:text-white hover:bg-slate-700/80',
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download .txt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
