'use client';

import { useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onPaste: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContextMenu({ x, y, onClose, onPaste }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // ── Close on click outside ──────────────────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // ── Close on Escape ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // ── Adjust position to stay within viewport ────────────────────────────────
  const adjustedStyle: React.CSSProperties = {
    position: 'fixed',
    top: y,
    left: x,
    zIndex: 9999,
  };

  return (
    <div
      ref={menuRef}
      style={adjustedStyle}
      className="min-w-[220px] rounded-xl border border-slate-700 bg-slate-800 shadow-2xl shadow-black/50 py-1.5 animate-in fade-in zoom-in-95 duration-100"
    >
      <button
        onClick={() => {
          onPaste();
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-purple-600/20 hover:text-purple-300 transition-colors"
      >
        <svg
          className="w-4 h-4 text-purple-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        Paste Image from Clipboard
        <span className="ml-auto text-xs text-slate-500 font-mono">Ctrl+V</span>
      </button>
    </div>
  );
}
