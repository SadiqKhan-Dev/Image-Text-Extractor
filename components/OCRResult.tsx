'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { OCRProgressInfo } from '@/lib/ocr';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OCRResultProps {
  extractedText: string;
  isProcessing: boolean;
  progress: OCRProgressInfo | null;
  error: string | null;
  hasImage: boolean;
  confidence: number | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OCRResult({
  extractedText,
  isProcessing,
  progress,
  error,
  hasImage,
  confidence,
}: OCRResultProps) {
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>(
    'idle'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Derived values ──────────────────────────────────────────────────────────

  const words = extractedText.trim()
    ? extractedText.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const chars = extractedText.length;
  const lines = extractedText.trim()
    ? extractedText.trim().split('\n').length
    : 0;

  // ── Search matches ──────────────────────────────────────────────────────────

  const matchCount = useMemo(() => {
    if (!searchQuery || !extractedText) return 0;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    return (extractedText.match(regex) ?? []).length;
  }, [searchQuery, extractedText]);

  // ── Keyboard shortcut for search ────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearchQuery('');
        setCurrentMatch(0);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  // ── Navigate matches ────────────────────────────────────────────────────────

  const navigateMatch = useCallback(
    (direction: 'next' | 'prev') => {
      if (matchCount === 0) return;
      setCurrentMatch((prev) => {
        if (direction === 'next') return (prev + 1) % matchCount;
        return (prev - 1 + matchCount) % matchCount;
      });
    },
    [matchCount]
  );

  // ── Highlighted text ────────────────────────────────────────────────────────

  const highlightedText = useMemo(() => {
    if (!searchQuery || !extractedText) return null;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = extractedText.split(regex);
    return parts;
  }, [searchQuery, extractedText]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleCopy = useCallback(async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopyState('success');
    } catch {
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
        <h2 className="text-lg font-semibold text-slate-200 dark:text-slate-200 text-slate-800 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400 text-xs font-bold">
            2
          </span>
          Extracted Text
        </h2>

        <div className="flex items-center gap-3">
          {/* Confidence score */}
          {confidence !== null && confidence > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-500 text-slate-400">
              Confidence: <span className="text-purple-400 font-semibold">{confidence}%</span>
            </span>
          )}

          {/* Stats */}
          {extractedText && (
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-500 text-slate-400">
              <span>{words} words</span>
              <span className="text-slate-700 dark:text-slate-700 text-slate-300">·</span>
              <span>{chars} chars</span>
              <span className="text-slate-700 dark:text-slate-700 text-slate-300">·</span>
              <span>{lines} lines</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      {searchOpen && extractedText && (
        <div className="mb-3 flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 dark:bg-slate-800/60 bg-slate-100 border border-slate-700 dark:border-slate-700 border-slate-300">
          <svg className="w-4 h-4 text-slate-400 dark:text-slate-400 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentMatch(0);
            }}
            placeholder="Search in text..."
            className="flex-1 bg-transparent text-sm text-slate-200 dark:text-slate-200 text-slate-800 placeholder-slate-500 dark:placeholder-slate-500 placeholder-slate-400 outline-none"
          />
          {matchCount > 0 && (
            <span className="text-xs text-slate-400 dark:text-slate-400 text-slate-500 tabular-nums">
              {currentMatch + 1}/{matchCount}
            </span>
          )}
          <button onClick={() => navigateMatch('prev')} className="p-1 rounded hover:bg-slate-700 dark:hover:bg-slate-700 hover:bg-slate-200 text-slate-400 dark:text-slate-400 text-slate-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          <button onClick={() => navigateMatch('next')} className="p-1 rounded hover:bg-slate-700 dark:hover:bg-slate-700 hover:bg-slate-200 text-slate-400 dark:text-slate-400 text-slate-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button
            onClick={() => { setSearchOpen(false); setSearchQuery(''); setCurrentMatch(0); }}
            className="p-1 rounded hover:bg-slate-700 dark:hover:bg-slate-700 hover:bg-slate-200 text-slate-400 dark:text-slate-400 text-slate-500"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* ── Progress bar ─────────────────────────────────────────────────────── */}
      {isProcessing && progress && (
        <div className="mb-4 p-4 rounded-xl bg-slate-800/60 dark:bg-slate-800/60 bg-slate-100 border border-slate-700/50 dark:border-slate-700/50 border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-300 dark:text-purple-300 text-purple-600 text-sm">{progress.status}</span>
            <span className="text-purple-400 dark:text-purple-400 text-purple-600 text-sm font-semibold tabular-nums">
              {progress.progress}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-700 dark:bg-slate-700 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-violet-400 rounded-full transition-[width] duration-300 ease-out"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Initialising skeleton ────────────────────────────────────────────── */}
      {isProcessing && !progress && (
        <div className="mb-4 p-4 rounded-xl bg-slate-800/60 dark:bg-slate-800/60 bg-slate-100 border border-slate-700/50 dark:border-slate-700/50 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-slate-400 dark:text-slate-400 text-slate-600 text-sm">
              Initialising OCR engine… (first run may take a moment)
            </span>
          </div>
          <div className="mt-3 w-full h-1.5 bg-slate-700 dark:bg-slate-700 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-purple-700/50 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* ── Error banner ─────────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-950/40 dark:bg-red-950/40 bg-red-50 border border-red-800/50 dark:border-red-800/50 border-red-200 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-400 dark:text-red-400 text-red-500 mt-0.5 flex-shrink-0"
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
            <p className="text-red-400 dark:text-red-400 text-red-600 font-medium text-sm">
              Recognition failed
            </p>
            <p className="text-red-500/80 dark:text-red-500/80 text-red-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* ── Text area ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Search toggle button */}
        {extractedText && !isProcessing && !searchOpen && (
          <div className="flex justify-end mb-2">
            <button
              onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-slate-500 dark:text-slate-500 text-slate-400 hover:text-purple-400 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 hover:bg-slate-100 transition-colors"
              title="Search in text (Ctrl+F)"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>
        )}

        {/* Highlighted text overlay */}
        {highlightedText && (
          <div className="relative mb-2">
            <div className="p-4 rounded-2xl bg-slate-800/50 dark:bg-slate-800/50 bg-white border text-sm leading-relaxed font-mono max-h-40 overflow-y-auto text-slate-200 dark:text-slate-200 text-slate-800 border-slate-700/50 dark:border-slate-700/50 border-slate-200">
              {highlightedText.map((part, i) => {
                const isMatch = part.toLowerCase() === searchQuery.toLowerCase();
                return isMatch ? (
                  <mark
                    key={i}
                    className="bg-purple-500/30 text-purple-300 dark:text-purple-300 text-purple-700 rounded px-0.5"
                  >
                    {part}
                  </mark>
                ) : (
                  <span key={i}>{part}</span>
                );
              })}
            </div>
          </div>
        )}

        <textarea
          ref={textareaRef}
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
            'bg-slate-800/50 dark:bg-slate-800/50 bg-white border text-slate-200 dark:text-slate-200 text-slate-800 text-sm leading-relaxed',
            'placeholder-slate-600 dark:placeholder-slate-600 placeholder-slate-400 font-mono',
            'focus:outline-none focus:ring-2 focus:ring-purple-500/60',
            'transition-colors scrollbar-thin',
            extractedText
              ? 'border-slate-600/80 dark:border-slate-600/80 border-slate-300'
              : 'border-slate-700/50 dark:border-slate-700/50 border-slate-300',
          ].join(' ')}
        />

        {/* ── Action buttons ──────────────────────────────────────────────────── */}
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
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : copyState === 'error' ? (
                'Copy failed'
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
                'border border-slate-600 dark:border-slate-600 border-slate-300 bg-slate-800/60 dark:bg-slate-800/60 bg-slate-100',
                'text-slate-300 dark:text-slate-300 text-slate-700 hover:text-white dark:hover:text-white hover:text-slate-900 hover:bg-slate-700/80 dark:hover:bg-slate-700/80 hover:bg-slate-200',
              ].join(' ')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download .txt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
