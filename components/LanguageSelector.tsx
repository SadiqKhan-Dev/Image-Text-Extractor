'use client';

import { useState, useRef, useEffect } from 'react';
import { LANGUAGES } from '@/lib/ocr';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  disabled?: boolean;
}

export default function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  disabled = false,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredLanguages = Object.entries(LANGUAGES).filter(([code, name]) =>
    name.toLowerCase().includes(search.toLowerCase()) ||
    code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
        disabled={disabled}
        className={[
          'flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all',
          'border border-slate-700 dark:border-slate-700 border-slate-300',
          'bg-slate-800/60 dark:bg-slate-800/60 bg-slate-100',
          'text-slate-300 dark:text-slate-300 text-slate-700',
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-500/60 hover:text-white dark:hover:text-white hover:text-slate-900',
        ].join(' ')}
      >
        <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        {LANGUAGES[selectedLanguage] ?? 'English'}
        <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 max-h-72 overflow-y-auto rounded-xl bg-slate-800 dark:bg-slate-800 bg-white border border-slate-700 dark:border-slate-700 border-slate-200 shadow-2xl z-50">
          {/* Search */}
          <div className="p-2 border-b border-slate-700 dark:border-slate-700 border-slate-200">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search languages..."
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-700/50 dark:bg-slate-700/50 bg-slate-100 text-sm text-slate-200 dark:text-slate-200 text-slate-800 placeholder-slate-500 dark:placeholder-slate-500 placeholder-slate-400 outline-none"
            />
          </div>

          {/* Language list */}
          <div className="p-1">
            {filteredLanguages.map(([code, name]) => (
              <button
                key={code}
                onClick={() => {
                  onLanguageChange(code);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={[
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                  code === selectedLanguage
                    ? 'bg-purple-600/20 text-purple-300 dark:text-purple-300 text-purple-600'
                    : 'text-slate-300 dark:text-slate-300 text-slate-700 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 hover:bg-slate-100',
                ].join(' ')}
              >
                {code === selectedLanguage && (
                  <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span className={code === selectedLanguage ? '' : 'ml-5.5'}>{name}</span>
                <span className="ml-auto text-xs text-slate-500 dark:text-slate-500 text-slate-400 font-mono">{code}</span>
              </button>
            ))}
            {filteredLanguages.length === 0 && (
              <p className="text-center text-sm text-slate-500 dark:text-slate-500 text-slate-400 py-3">No languages found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
