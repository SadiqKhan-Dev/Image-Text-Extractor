'use client';

import { useEffect, useRef } from 'react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ['Ctrl', 'V'], description: 'Paste image from clipboard' },
  { keys: ['Ctrl', 'C'], description: 'Copy extracted text' },
  { keys: ['Ctrl', 'F'], description: 'Search in extracted text' },
  { keys: ['Ctrl', 'S'], description: 'Download extracted text' },
  { keys: ['Ctrl', '/'], description: 'Toggle shortcuts panel' },
  { keys: ['Esc'], description: 'Close menus / Reset search' },
  { keys: ['Right-click'], description: 'Paste image from context menu' },
  { keys: ['Drag & Drop'], description: 'Upload image anywhere on page' },
];

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-md mx-4 rounded-2xl bg-slate-900 dark:bg-slate-900 bg-white border border-slate-700 dark:border-slate-700 border-slate-200 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-200 dark:text-slate-200 text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-400 text-slate-500 hover:text-white dark:hover:text-white hover:text-slate-900 hover:bg-slate-700/80 dark:hover:bg-slate-700/80 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((shortcut, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-800/40 dark:hover:bg-slate-800/40 hover:bg-slate-100 transition-colors"
            >
              <span className="text-sm text-slate-300 dark:text-slate-300 text-slate-600">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <span key={j}>
                    <kbd className="px-2 py-0.5 rounded-md bg-slate-700/60 dark:bg-slate-700/60 bg-slate-200 border border-slate-600 dark:border-slate-600 border-slate-300 text-xs font-mono text-slate-300 dark:text-slate-300 text-slate-600">
                      {key}
                    </kbd>
                    {j < shortcut.keys.length - 1 && (
                      <span className="text-slate-600 dark:text-slate-600 text-slate-400 mx-0.5">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
