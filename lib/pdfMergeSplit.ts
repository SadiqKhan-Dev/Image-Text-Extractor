import { PDFDocument, degrees } from 'pdf-lib';

function toBlob(bytes: Uint8Array): Blob {
  const buf = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buf).set(bytes);
  return new Blob([buf], { type: 'application/pdf' });
}

/**
 * Merge multiple PDF files into one.
 */
export async function mergePDFs(files: File[]): Promise<Blob> {
  const merged = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer);
    const copiedPages = await merged.copyPages(doc, doc.getPageIndices());
    copiedPages.forEach((page) => merged.addPage(page));
  }

  return toBlob(await merged.save());
}

/**
 * Extract specific pages from a PDF.
 */
export async function extractPages(file: File, pageIndices: number[]): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
  copiedPages.forEach((page) => newDoc.addPage(page));
  return toBlob(await newDoc.save());
}

/**
 * Split a PDF into individual pages.
 */
export async function splitPDF(file: File): Promise<Blob[]> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const pageCount = srcDoc.getPageCount();
  const results: Blob[] = [];

  for (let i = 0; i < pageCount; i++) {
    const newDoc = await PDFDocument.create();
    const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
    newDoc.addPage(copiedPage);
    results.push(toBlob(await newDoc.save()));
  }

  return results;
}

/**
 * Rotate pages in a PDF.
 */
export async function rotatePDFPages(file: File, rotations: Record<number, 90 | 180 | 270>): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(arrayBuffer);

  Object.entries(rotations).forEach(([pageIndex, deg]) => {
    const page = doc.getPage(parseInt(pageIndex));
    page.setRotation(degrees(page.getRotation().angle + deg));
  });

  return toBlob(await doc.save());
}

/**
 * Delete pages from a PDF.
 */
export async function deletePDFPages(file: File, pageIndices: number[]): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(arrayBuffer);
  const sorted = [...pageIndices].sort((a, b) => b - a);
  sorted.forEach((i) => doc.removePage(i));
  return toBlob(await doc.save());
}

/**
 * Reorder pages in a PDF.
 */
export async function reorderPDFPages(file: File, newOrder: number[]): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, newOrder);
  copiedPages.forEach((page) => newDoc.addPage(page));
  return toBlob(await newDoc.save());
}

/**
 * Create a PDF from multiple images.
 */
export async function imagesToPDF(files: File[], pageSize: 'a4' | 'letter' | 'fit' = 'a4'): Promise<Blob> {
  const doc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let image;
    if (file.type === 'image/png') {
      image = await doc.embedPng(arrayBuffer);
    } else {
      image = await doc.embedJpg(arrayBuffer);
    }

    let width, height;
    if (pageSize === 'fit') {
      width = image.width;
      height = image.height;
    } else if (pageSize === 'letter') {
      width = 612;
      height = 792;
    } else {
      width = 595.28;
      height = 841.89;
    }

    const page = doc.addPage([width, height]);
    const scaled = image.scaleToFit(width - 40, height - 40);
    page.drawImage(image, {
      x: (width - scaled.width) / 2,
      y: (height - scaled.height) / 2,
      width: scaled.width,
      height: scaled.height,
    });
  }

  return toBlob(await doc.save());
}
