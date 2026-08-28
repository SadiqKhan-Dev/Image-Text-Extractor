'use client';

import { useEffect, useRef } from 'react';

interface ContextMenuProps { x: number; y: number; onClose: () => void; onPaste: () => void; }

export default function ContextMenu({ x, y, onClose, onPaste }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div ref={menuRef} style={{ position: 'fixed', top: y, left: x, zIndex: 9999 }} className="min-w-[240px] rounded-xl border border-theme-secondary bg-theme-card shadow-2xl shadow-black/30 py-1.5">
      <button onClick={() => { onPaste(); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-theme-primary hover:bg-purple-500/10 hover:text-purple-500 transition-colors">
        <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        Paste Image from Clipboard
        <span className="ml-auto text-xs text-theme-faint font-mono">Ctrl+V</span>
      </button>
      <div className="mx-3 my-1 border-t border-theme-muted" />
      <button onClick={() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true })); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-theme-primary hover:bg-purple-500/10 hover:text-purple-500 transition-colors">
        <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
        Keyboard Shortcuts
        <span className="ml-auto text-xs text-theme-faint font-mono">Ctrl+/</span>
      </button>
      <button onClick={() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', ctrlKey: true })); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-theme-primary hover:bg-purple-500/10 hover:text-purple-500 transition-colors">
        <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Extraction History
        <span className="ml-auto text-xs text-theme-faint font-mono">Ctrl+H</span>
      </button>
    </div>
  );
}
