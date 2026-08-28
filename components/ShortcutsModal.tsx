'use client';

import { useEffect, useRef } from 'react';

interface ShortcutsModalProps { isOpen: boolean; onClose: () => void; }

const shortcuts = [
  { keys: ['Ctrl', 'V'], description: 'Paste image from clipboard' },
  { keys: ['Ctrl', 'C'], description: 'Copy extracted text' },
  { keys: ['Ctrl', 'F'], description: 'Search in extracted text' },
  { keys: ['Ctrl', 'S'], description: 'Download extracted text' },
  { keys: ['Ctrl', '/'], description: 'Toggle shortcuts panel' },
  { keys: ['Ctrl', 'H'], description: 'Toggle extraction history' },
  { keys: ['Esc'], description: 'Close menus / clear search' },
  { keys: ['Right-click'], description: 'Paste image from context menu' },
  { keys: ['Drag & Drop'], description: 'Upload image anywhere on page' },
];

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }} className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-theme-card border border-theme-secondary shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            Keyboard Shortcuts
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-theme-faint hover:text-theme-primary hover:bg-theme-secondary transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-theme-secondary transition-colors">
              <span className="text-sm text-theme-secondary">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <span key={j}>
                    <kbd className="px-2 py-0.5 rounded-md bg-theme-secondary border border-theme-muted text-xs font-mono text-theme-secondary">{key}</kbd>
                    {j < shortcut.keys.length - 1 && <span className="text-theme-faint mx-0.5">+</span>}
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
