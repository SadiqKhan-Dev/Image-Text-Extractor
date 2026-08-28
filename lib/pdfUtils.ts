import { pdfjsLib, type PDFDocumentProxy } from './pdfSetup';

export interface PDFMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: Date | null;
  modDate: Date | null;
  pageCount: number;
}

/**
 * Load a PDF from a File object.
 */
export async function loadPDFFromFile(file: File): Promise<PDFDocumentProxy> {
  const arrayBuffer = await file.arrayBuffer();
  return pdfjsLib.getDocument({ data: arrayBuffer }).promise;
}

/**
 * Get PDF metadata.
 */
export async function getPDFMetadata(doc: PDFDocumentProxy): Promise<PDFMetadata> {
  const metadata = await doc.getMetadata();
  const info = (metadata.info || {}) as Record<string, string>;
  return {
    title: info['Title'] || '',
    author: info['Author'] || '',
    subject: info['Subject'] || '',
    keywords: info['Keywords'] || '',
    creator: info['Creator'] || '',
    producer: info['Producer'] || '',
    creationDate: info['CreationDate'] ? new Date(info['CreationDate']) : null,
    modDate: info['ModDate'] ? new Date(info['ModDate']) : null,
    pageCount: doc.numPages,
  };
}

/**
 * Render a single PDF page to a canvas element.
 */
export async function renderPageToCanvas(
  doc: PDFDocumentProxy,
  pageNumber: number,
  scale: number = 1.5
): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;
  await page.render({ canvas, viewport } as any).promise;
  return canvas;
}

/**
 * Render a PDF page to a Blob (image).
 */
export async function renderPageToImage(
  doc: PDFDocumentProxy,
  pageNumber: number,
  scale: number = 2,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.95
): Promise<Blob> {
  const canvas = await renderPageToCanvas(doc, pageNumber, scale);
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      format === 'jpeg' ? 'image/jpeg' : 'image/png',
      quality
    );
  });
}

/**
 * Render a PDF page to a File (image).
 */
export async function renderPageToFile(
  doc: PDFDocumentProxy,
  pageNumber: number,
  fileName: string,
  scale: number = 2,
  format: 'png' | 'jpeg' = 'png'
): Promise<File> {
  const blob = await renderPageToImage(doc, pageNumber, scale, format);
  return new File([blob], fileName, { type: blob.type });
}

/**
 * Get text content of a page.
 */
export async function getPageText(doc: PDFDocumentProxy, pageNumber: number): Promise<string> {
  const page = await doc.getPage(pageNumber);
  const content = await page.getTextContent();
  return content.items.map((item: any) => item.str).join(' ');
}
