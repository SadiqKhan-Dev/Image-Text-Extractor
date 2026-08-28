import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export { pdfjsLib };
export type PDFDocumentProxy = pdfjsLib.PDFDocumentProxy;
export type PDFPageProxy = pdfjsLib.PDFPageProxy;
