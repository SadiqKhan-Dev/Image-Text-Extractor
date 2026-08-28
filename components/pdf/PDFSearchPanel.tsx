'use client';

import { useState, useCallback } from 'react';
import type { PDFDocumentProxy } from '@/lib/pdfSetup';
import { getPageText } from '@/lib/pdfUtils';

interface PDFSearchPanelProps {
  doc: PDFDocumentProxy;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

interface SearchResult {
  page: number;
  text: string;
  matchIndex: number;
}

export default function PDFSearchPanel({ doc, totalPages, currentPage, onPageChange }: PDFSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    const q = query.toLowerCase();
    const found: SearchResult[] = [];

    for (let i = 1; i <= totalPages; i++) {
      try {
        const text = await getPageText(doc, i);
        if (text.toLowerCase().includes(q)) {
          found.push({ page: i, text: text.substring(0, 200), matchIndex: text.toLowerCase().indexOf(q) });
        }
      } catch {}
    }

    setResults(found);
    setSearched(true);
    setSearching(false);
  }, [doc, query, totalPages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const highlightMatch = (text: string, matchIdx: number) => {
    const q = query.toLowerCase();
    const lowerText = text.toLowerCase();
    const start = Math.max(0, matchIdx - 30);
    const end = Math.min(text.length, matchIdx + query.length + 50);
    const snippet = text.substring(start, end);
    const idx = snippet.toLowerCase().indexOf(q);
    if (idx === -1) return snippet;
    return (
      <>
        {snippet.substring(0, idx)}
        <mark className="bg-yellow-300 dark:bg-yellow-600 text-black px-0.5 rounded">{snippet.substring(idx, idx + query.length)}</mark>
        {snippet.substring(idx + query.length)}
      </>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search text in PDF..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-theme-secondary border border-theme-muted text-theme-primary text-sm outline-none focus:border-purple-500"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={!query.trim() || searching}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 disabled:opacity-50"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-2">
          <p className="text-xs text-theme-muted">
            {results.length} page{results.length !== 1 ? 's' : ''} found
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((r) => (
              <button
                key={r.page}
                onClick={() => onPageChange(r.page)}
                className="w-full text-left bg-theme-secondary/50 hover:bg-theme-secondary rounded-lg p-3 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-purple-400">Page {r.page}</span>
                  <svg className="w-3 h-3 text-theme-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
                <p className="text-xs text-theme-secondary leading-relaxed">
                  {highlightMatch(r.text, r.matchIndex)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {searched && results.length === 0 && (
        <div className="text-center py-8">
          <svg className="w-10 h-10 text-theme-faint mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <p className="text-sm text-theme-muted">No results found for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
