/**
 * OCR utility — wraps Tesseract.js with a clean, typed interface.
 * Uses a dynamic import so the heavy Tesseract bundle is never included
 * in the server-side bundle.
 */

export interface OCRProgressInfo {
  /** Human-readable status label from Tesseract (e.g. "recognizing text") */
  status: string;
  /** Percentage 0–100 */
  progress: number;
}

/**
 * Extracts text from an image using Tesseract.js running entirely in the browser.
 *
 * @param imageSource  A File object (from an <input type="file">) or a URL string.
 * @param onProgress   Optional callback invoked with progress updates during recognition.
 * @returns            The extracted text, trimmed of surrounding whitespace.
 */
export async function extractTextFromImage(
  imageSource: File | string,
  onProgress?: (info: OCRProgressInfo) => void
): Promise<string> {
  // Dynamic import keeps Tesseract.js out of the initial JS bundle and off the server
  const { createWorker } = await import('tesseract.js');

  const worker = await createWorker('eng', 1, {
    logger: (message: { status?: string; progress?: number }) => {
      if (onProgress && typeof message.progress === 'number') {
        onProgress({
          status: formatStatus(String(message.status ?? 'Processing')),
          progress: Math.min(100, Math.round(message.progress * 100)),
        });
      }
    },
  });

  try {
    const {
      data: { text },
    } = await worker.recognize(imageSource);
    return cleanText(text);
  } finally {
    // Always terminate the worker to free memory
    await worker.terminate();
  }
}

/**
 * Strips everything that isn't a letter, digit, or whitespace.
 * Collapses multiple blank lines into one and trims the result.
 */
function cleanText(raw: string): string {
  return raw
    // Keep: a-z A-Z 0-9, spaces, tabs, newlines — drop all other symbols
    .replace(/[^a-zA-Z0-9\s]/g, '')
    // Collapse 3+ consecutive newlines down to 2 (one blank line)
    .replace(/\n{3,}/g, '\n\n')
    // Collapse multiple spaces/tabs on the same line into one space
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/** Converts Tesseract's snake_case status strings to readable labels. */
function formatStatus(raw: string): string {
  const map: Record<string, string> = {
    'loading tesseract core': 'Loading OCR engine...',
    'initializing tesseract': 'Initializing engine...',
    'initialized tesseract': 'Engine ready',
    'loading language traineddata': 'Loading language data...',
    'loaded language traineddata': 'Language data loaded',
    'initializing api': 'Starting recognition...',
    'recognizing text': 'Recognizing text...',
  };
  return map[raw] ?? raw;
}
