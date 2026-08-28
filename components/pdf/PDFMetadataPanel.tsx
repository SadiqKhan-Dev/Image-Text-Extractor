'use client';

import { useState, useEffect } from 'react';
import type { PDFDocumentProxy } from '@/lib/pdfSetup';
import { getPDFMetadata, type PDFMetadata } from '@/lib/pdfUtils';
import { getPDFFileInfo } from '@/lib/pdfExport';

interface PDFMetadataPanelProps {
  doc: PDFDocumentProxy;
  file: File;
}

export default function PDFMetadataPanel({ doc, file }: PDFMetadataPanelProps) {
  const [meta, setMeta] = useState<PDFMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const m = await getPDFMetadata(doc);
        if (!cancelled) setMeta(m);
      } catch {}
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [doc]);

  const fileInfo = getPDFFileInfo(file, doc);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* File Info */}
      <div>
        <h3 className="text-sm font-semibold text-theme-primary mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          File Information
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <InfoRow label="File Name" value={fileInfo.name} />
          <InfoRow label="File Size" value={fileInfo.size} />
          <InfoRow label="Pages" value={String(fileInfo.pages)} />
          <InfoRow label="Type" value={fileInfo.type} />
        </div>
      </div>

      {/* Document Properties */}
      {meta && (
        <div>
          <h3 className="text-sm font-semibold text-theme-primary mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Document Properties
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Title" value={meta.title || '(not set)'} />
            <InfoRow label="Author" value={meta.author || '(not set)'} />
            <InfoRow label="Subject" value={meta.subject || '(not set)'} />
            <InfoRow label="Keywords" value={meta.keywords || '(not set)'} />
            <InfoRow label="Creator" value={meta.creator || '(not set)'} />
            <InfoRow label="Producer" value={meta.producer || '(not set)'} />
            <InfoRow label="Created" value={meta.creationDate ? meta.creationDate.toLocaleDateString() : '(unknown)'} />
            <InfoRow label="Modified" value={meta.modDate ? meta.modDate.toLocaleDateString() : '(unknown)'} />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-theme-secondary/50 rounded-lg px-3 py-2">
      <p className="text-[10px] text-theme-faint uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-xs text-theme-primary font-medium truncate" title={value}>{value}</p>
    </div>
  );
}
