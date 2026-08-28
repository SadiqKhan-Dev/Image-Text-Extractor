import { PDFDocument, degrees, rgb } from 'pdf-lib';
import type { Annotation } from './pdfAnnotation';

function toBlob(bytes: Uint8Array): Blob {
  const buf = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buf).set(bytes);
  return new Blob([buf], { type: 'application/pdf' });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export the edited PDF with all page operations and annotations applied.
 */
export async function exportEditedPDF(
  file: File,
  pageOrder: number[],
  deletedPages: Set<number>,
  rotatedPages: Record<number, number>,
  annotations: Record<number, Annotation[]>,
  fileName: string = 'edited.pdf'
): Promise<void> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const newDoc = await PDFDocument.create();

  const activePages = pageOrder.filter((p) => !deletedPages.has(p));

  for (const pageNum of activePages) {
    const srcIndex = pageNum - 1;
    const [copiedPage] = await newDoc.copyPages(srcDoc, [srcIndex]);

    const rot = rotatedPages[pageNum] || 0;
    if (rot !== 0) {
      copiedPage.setRotation(degrees((srcDoc.getPage(srcIndex).getRotation().angle + rot) % 360));
    }

    newDoc.addPage(copiedPage);
  }

  // Embed annotations as PDF content streams
  const pageAnnotations = Object.entries(annotations);
  for (const [pageNumStr, anns] of pageAnnotations) {
    const pageNum = parseInt(pageNumStr);
    const activeIndex = activePages.indexOf(pageNum);
    if (activeIndex === -1 || anns.length === 0) continue;

    const page = newDoc.getPage(activeIndex);
    const { width, height } = page.getSize();

    for (const ann of anns) {
      const a = ann as any;
      try {
        switch (ann.type) {
          case 'text':
            page.drawText(a.text, {
              x: a.x,
              y: height - a.y,
              size: a.fontSize || 14,
              color: parseColor(ann.color),
            });
            break;
          case 'rectangle':
            page.drawRectangle({
              x: Math.min(a.x, a.x + a.width),
              y: height - Math.max(a.y, a.y + a.height),
              width: Math.abs(a.width),
              height: Math.abs(a.height),
              borderColor: parseColor(ann.color),
              borderWidth: ann.strokeWidth || 1,
            });
            break;
          case 'circle':
            page.drawEllipse({
              x: a.x + a.width / 2,
              y: height - (a.y + a.height / 2),
              xScale: Math.abs(a.width / 2),
              yScale: Math.abs(a.height / 2),
              borderColor: parseColor(ann.color),
              borderWidth: ann.strokeWidth || 1,
            });
            break;
          case 'line':
            page.drawLine({
              start: { x: a.x1, y: height - a.y1 },
              end: { x: a.x2, y: height - a.y2 },
              color: parseColor(ann.color),
              thickness: ann.strokeWidth || 1,
            });
            break;
          case 'highlight':
            page.drawRectangle({
              x: Math.min(a.x, a.x + a.width),
              y: height - Math.max(a.y, a.y + a.height),
              width: Math.abs(a.width),
              height: Math.abs(a.height),
              color: parseColor(ann.color),
              opacity: 0.3,
            });
            break;
          case 'underline':
            page.drawLine({
              start: { x: a.x, y: height - (a.y + a.height) },
              end: { x: a.x + a.width, y: height - (a.y + a.height) },
              color: parseColor(ann.color),
              thickness: ann.strokeWidth || 1,
            });
            break;
          case 'strikethrough':
            page.drawLine({
              start: { x: a.x, y: height - (a.y + a.height / 2) },
              end: { x: a.x + a.width, y: height - (a.y + a.height / 2) },
              color: parseColor(ann.color),
              thickness: ann.strokeWidth || 1,
            });
            break;
        }
      } catch {
        // Skip annotations that fail to embed
      }
    }
  }

  const blob = toBlob(await newDoc.save());
  downloadBlob(blob, fileName);
}

/**
 * Add a text watermark to all pages of a PDF.
 */
export async function addWatermark(
  file: File,
  text: string,
  options: {
    fontSize?: number;
    color?: string;
    opacity?: number;
    rotation?: number;
    pages?: number[];
  } = {}
): Promise<Blob> {
  const { fontSize = 50, color = '#999999', opacity = 0.3, rotation = -45, pages } = options;
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices());
  copiedPages.forEach((p) => newDoc.addPage(p));

  const colorParts = (() => { const c = hexToRgb(color); return rgb(c.red, c.green, c.blue); })();
  const pageIndices = pages || Array.from({ length: newDoc.getPageCount() }, (_, i) => i);

  for (const idx of pageIndices) {
    if (idx < 0 || idx >= newDoc.getPageCount()) continue;
    const page = newDoc.getPage(idx);
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width / 2 - (text.length * fontSize * 0.3),
      y: height / 2,
      size: fontSize,
      color: colorParts,
      opacity,
      rotate: degrees(rotation),
    });
  }

  return toBlob(await newDoc.save());
}

/**
 * Get PDF file info.
 */
export function getPDFFileInfo(file: File, doc: { numPages: number }) {
  const sizeKB = file.size / 1024;
  const sizeMB = sizeKB / 1024;
  return {
    name: file.name,
    size: sizeMB > 1 ? `${sizeMB.toFixed(1)} MB` : `${sizeKB.toFixed(0)} KB`,
    pages: doc.numPages,
    type: file.type,
  };
}

function hexToRgb(hex: string): { red: number; green: number; blue: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        red: parseInt(result[1], 16) / 255,
        green: parseInt(result[2], 16) / 255,
        blue: parseInt(result[3], 16) / 255,
      }
    : { red: 0.6, green: 0.6, blue: 0.6 };
}

function parseColor(hex: string) {
  const c = hexToRgb(hex);
  return rgb(c.red, c.green, c.blue);
}
