'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface ExportMenuProps {
  text: string;
  disabled?: boolean;
}

export default function ExportMenu({ text, disabled = false }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const downloadFile = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  }, []);

  const handleExportTxt = useCallback(() => {
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(text, `extracted-text-${date}.txt`, 'text/plain;charset=utf-8');
  }, [text, downloadFile]);

  const handleExportPdf = useCallback(async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    doc.setFontSize(18);
    doc.text('Extracted Text', 20, 20);
    doc.setFontSize(10);
    doc.setTextColor(128);
    doc.text(`Generated on ${date} — Image Text Extractor`, 20, 28);

    doc.setTextColor(0);
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(text, 170);
    doc.text(lines, 20, 40);

    doc.save(`extracted-text-${new Date().toISOString().slice(0, 10)}.pdf`);
    setIsOpen(false);
  }, [text]);

  const handleExportDocx = useCallback(async () => {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
    const { saveAs } = await import('file-saver');

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Extracted Text', bold: true, size: 32 })],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            children: [new TextRun({ text: `Generated on ${new Date().toLocaleDateString()}`, size: 18, color: '888888' })],
            spacing: { after: 200 },
          }),
          ...text.split('\n').map(line =>
            new Paragraph({
              children: [new TextRun({ text: line, size: 22 })],
              spacing: { after: 100 },
            })
          ),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `extracted-text-${new Date().toISOString().slice(0, 10)}.docx`);
    setIsOpen(false);
  }, [text]);

  return (
    <div ref={menuRef} className="relative flex-1">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={[
          'w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all',
          'flex items-center justify-center gap-2',
          'border border-slate-600 dark:border-slate-600 border-slate-300 bg-slate-800/60 dark:bg-slate-800/60 bg-slate-100',
          'text-slate-300 dark:text-slate-300 text-slate-700 hover:text-white dark:hover:text-white hover:text-slate-900 hover:bg-slate-700/80 dark:hover:bg-slate-700/80 hover:bg-slate-200',
          'disabled:opacity-40 disabled:cursor-not-allowed',
        ].join(' ')}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full rounded-xl bg-slate-800 dark:bg-slate-800 bg-white border border-slate-700 dark:border-slate-700 border-slate-200 shadow-2xl overflow-hidden z-50">
          <button
            onClick={handleExportTxt}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 dark:text-slate-300 text-slate-700 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 hover:bg-slate-100 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-slate-700/60 dark:bg-slate-700/60 bg-slate-200 flex items-center justify-center text-xs font-mono text-slate-400 dark:text-slate-400 text-slate-500">TXT</span>
            Plain Text
          </button>
          <button
            onClick={handleExportPdf}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 dark:text-slate-300 text-slate-700 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 hover:bg-slate-100 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-red-900/40 dark:bg-red-900/40 bg-red-50 flex items-center justify-center text-xs font-mono text-red-400">PDF</span>
            PDF Document
          </button>
          <button
            onClick={handleExportDocx}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 dark:text-slate-300 text-slate-700 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 hover:bg-slate-100 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-blue-900/40 dark:bg-blue-900/40 bg-blue-50 flex items-center justify-center text-xs font-mono text-blue-400">DOC</span>
            Word Document
          </button>
        </div>
      )}
    </div>
  );
}
