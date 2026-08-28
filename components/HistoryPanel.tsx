'use client';

import { useState, useCallback, useEffect } from 'react';
import { getHistory, deleteFromHistory, clearHistory, type HistoryEntry } from '@/lib/history';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEntry: (text: string) => void;
}

export default function HistoryPanel({ isOpen, onClose, onSelectEntry }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (isOpen) setHistory(getHistory());
  }, [isOpen]);

  const handleDelete = useCallback((id: string) => {
    deleteFromHistory(id);
    setHistory(getHistory());
  }, []);

  const handleClear = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 max-h-[80vh] flex flex-col rounded-2xl bg-slate-900 dark:bg-slate-900 bg-white border border-slate-700 dark:border-slate-700 border-slate-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700 dark:border-slate-700 border-slate-200">
          <h2 className="text-lg font-semibold text-slate-200 dark:text-slate-200 text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Extraction History
            <span className="text-xs text-slate-500 dark:text-slate-500 text-slate-400 font-normal">({history.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={handleClear}
                className="px-3 py-1.5 rounded-lg text-xs text-red-400 dark:text-red-400 text-red-500 bg-red-950/40 dark:bg-red-950/40 bg-red-50 border border-red-800/50 dark:border-red-800/50 border-red-200 hover:bg-red-900/40 dark:hover:bg-red-900/40 hover:bg-red-100 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-400 text-slate-500 hover:text-white dark:hover:text-white hover:text-slate-900 hover:bg-slate-700/80 dark:hover:bg-slate-700/80 hover:bg-slate-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-500 text-slate-400">
              <svg className="w-10 h-10 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">No extraction history yet</p>
            </div>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 dark:bg-slate-800/40 bg-slate-100 border border-slate-700/50 dark:border-slate-700/50 border-slate-200 hover:border-purple-500/40 transition-colors group"
              >
                {/* Thumbnail */}
                <img
                  src={entry.thumbnail}
                  alt="Processed image"
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-slate-700 dark:border-slate-700 border-slate-300"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400 dark:text-slate-400 text-slate-500">
                      {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-600 text-slate-400">·</span>
                    <span className="text-xs text-purple-400">{entry.wordCount} words</span>
                    {entry.confidence > 0 && (
                      <>
                        <span className="text-xs text-slate-600 dark:text-slate-600 text-slate-400">·</span>
                        <span className="text-xs text-slate-500 dark:text-slate-500 text-slate-400">{entry.confidence}% conf.</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 dark:text-slate-300 text-slate-600 line-clamp-2 leading-relaxed">
                    {entry.text || 'No text extracted'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { onSelectEntry(entry.text); onClose(); }}
                    className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-600/20 transition-colors"
                    title="Load this text"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-600/20 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
