'use client';

import dynamic from 'next/dynamic';

const PDFEditorApp = dynamic(() => import('@/components/pdf/PDFEditorApp'), { ssr: false });

export default function PDFEditorPage() {
  return <PDFEditorApp />;
}
