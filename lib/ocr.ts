/**
 * OCR utility — wraps Tesseract.js with a clean, typed interface.
 * Uses a dynamic import so the heavy Tesseract bundle is never included
 * in the server-side bundle.
 */

export interface OCRProgressInfo {
  /** Human-readable status label from Tesseract */
  status: string;
  /** Percentage 0–100 */
  progress: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
}

// ─── Supported languages ──────────────────────────────────────────────────────

export const LANGUAGES: Record<string, string> = {
  eng: 'English',
  spa: 'Spanish',
  fra: 'French',
  deu: 'German',
  hin: 'Hindi',
  ara: 'Arabic',
  chi_sim: 'Chinese (Simplified)',
  chi_tra: 'Chinese (Traditional)',
  jpn: 'Japanese',
  kor: 'Korean',
  por: 'Portuguese',
  rus: 'Russian',
  ita: 'Italian',
  nld: 'Dutch',
  pol: 'Polish',
  tur: 'Turkish',
  vie: 'Vietnamese',
  tha: 'Thai',
  ind: 'Indonesian',
  swe: 'Swedish',
};

/**
 * Extracts text from an image using Tesseract.js running entirely in the browser.
 *
 * @param imageSource  A File object or a URL string.
 * @param language     Tesseract language code (default: 'eng').
 * @param onProgress   Optional callback invoked with progress updates.
 * @returns            The extracted text and confidence score.
 */
export async function extractTextFromImage(
  imageSource: File | string,
  language: string = 'eng',
  onProgress?: (info: OCRProgressInfo) => void
): Promise<OCRResult> {
  const { createWorker } = await import('tesseract.js');

  const worker = await createWorker(language, 1, {
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
      data: { text, confidence },
    } = await worker.recognize(imageSource);
    return {
      text: cleanText(text),
      confidence: Math.round(confidence),
    };
  } finally {
    await worker.terminate();
  }
}

/**
 * Strips everything that isn't a letter, digit, or whitespace.
 * Collapses multiple blank lines into one and trims the result.
 */
function cleanText(raw: string): string {
  return raw
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\n{3,}/g, '\n\n')
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
