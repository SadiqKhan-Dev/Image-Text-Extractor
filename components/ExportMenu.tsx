'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface ExportMenuProps { text: string; disabled?: boolean; }

export default function ExportMenu({ text, disabled = false }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const downloadFile = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); setIsOpen(false);
  }, []);

  const handleExportTxt = useCallback(() => { downloadFile(text, `extracted-text-${new Date().toISOString().slice(0, 10)}.txt`, 'text/plain;charset=utf-8'); }, [text, downloadFile]);

  const handleExportPdf = useCallback(async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text('Extracted Text', 20, 20);
    doc.setFontSize(10); doc.setTextColor(128); doc.text(`Generated on ${new Date().toLocaleDateString()} — Image Text Extractor`, 20, 28);
    doc.setTextColor(0); doc.setFontSize(11);
    doc.text(doc.splitTextToSize(text, 170), 20, 40);
    doc.save(`extracted-text-${new Date().toISOString().slice(0, 10)}.pdf`); setIsOpen(false);
  }, [text]);

  const handleExportDocx = useCallback(async () => {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
    const { saveAs } = await import('file-saver');
    const doc = new Document({ sections: [{ properties: {}, children: [
      new Paragraph({ children: [new TextRun({ text: 'Extracted Text', bold: true, size: 32 })], heading: HeadingLevel.HEADING_1, alignment: AlignmentType.LEFT }),
      new Paragraph({ children: [new TextRun({ text: `Generated on ${new Date().toLocaleDateString()}`, size: 18, color: '888888' })], spacing: { after: 200 } }),
      ...text.split('\n').map(line => new Paragraph({ children: [new TextRun({ text: line, size: 22 })], spacing: { after: 100 } })),
    ] }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `extracted-text-${new Date().toISOString().slice(0, 10)}.docx`); setIsOpen(false);
  }, [text]);

  return (
    <div ref={menuRef} className="relative flex-1">
      <button onClick={() => !disabled && setIsOpen(!isOpen)} disabled={disabled} className="w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border border-theme-secondary bg-theme-card text-theme-secondary hover:text-theme-primary hover:bg-theme-card-hover disabled:opacity-40 disabled:cursor-not-allowed">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        Export
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full rounded-xl bg-theme-card border border-theme-secondary shadow-2xl overflow-hidden z-50">
          <button onClick={handleExportTxt} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-theme-secondary hover:bg-theme-secondary transition-colors">
            <span className="w-8 h-8 rounded-lg bg-theme-secondary flex items-center justify-center text-xs font-mono text-theme-faint">TXT</span>
            Plain Text
          </button>
          <button onClick={handleExportPdf} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-theme-secondary hover:bg-theme-secondary transition-colors">
            <span className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-xs font-mono text-red-500">PDF</span>
            PDF Document
          </button>
          <button onClick={handleExportDocx} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-theme-secondary hover:bg-theme-secondary transition-colors">
            <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-xs font-mono text-blue-500">DOC</span>
            Word Document
          </button>
        </div>
      )}
    </div>
  );
}
