<div align="center">

# Image Text Extractor

**Extract text from any image instantly — right in your browser.**

A modern, privacy-first OCR web application built with Next.js and Tesseract.js.
No uploads to any server. No API keys. Everything runs on your device.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Tesseract.js](https://img.shields.io/badge/Tesseract.js-5-orange)](https://tesseract.projectnaptha.com)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

---

[Live Demo](#getting-started) · [Report Bug](https://github.com/your-username/Image-Text-Extractor/issues) · [Request Feature](https://github.com/your-username/Image-Text-Extractor/issues)

</div>

---

## Overview

Image Text Extractor is a client-side optical character recognition (OCR) tool that extracts readable text from images. Built with the modern Next.js App Router and powered by Tesseract.js, it processes images entirely in the browser — no data ever leaves your device.

### Key Features

| Feature | Description |
|---|---|
| **On-device OCR** | Text extraction powered by Tesseract.js — runs 100% in the browser |
| **20+ languages** | English, Spanish, French, German, Hindi, Arabic, Chinese, Japanese, Korean, and more |
| **Multiple input methods** | Drag & drop, file browse, clipboard paste (Ctrl+V), right-click paste, or batch upload |
| **Batch processing** | Upload and OCR multiple images at once with tabbed results |
| **Image preprocessing** | Rotate (90/180/270), adjust brightness and contrast before OCR |
| **Search in text** | Find and highlight specific terms in extracted text (Ctrl+F) |
| **Export formats** | Download as TXT, PDF, or Word DOCX |
| **OCR History** | Save past extractions with thumbnails — revisit anytime (Ctrl+H) |
| **Confidence score** | See the OCR engine's confidence percentage for each extraction |
| **Dark/Light theme** | Toggle between dark and light modes — respects your system preference |
| **Clipboard paste** | Paste screenshots or copied images directly with Ctrl+V or right-click |
| **Supported formats** | PNG, JPG, JPEG, WEBP — up to 10 MB |
| **Real-time progress** | Live progress bar and status updates during OCR processing |
| **Privacy first** | Zero server-side processing — images never leave your browser |
| **Keyboard shortcuts** | Full keyboard navigation with Ctrl+/, Ctrl+H, Ctrl+F, Ctrl+S, and more |

---

## Getting Started

### Prerequisites

- **Node.js** 18.0 or later
- **npm**, **yarn**, or **pnpm**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/Image-Text-Extractor.git
   cd Image-Text-Extractor
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Usage

### Upload an Image

- **Drag & drop** an image onto the upload zone (or anywhere on the page)
- **Click** the upload zone to browse and select a file
- **Paste** an image from your clipboard using `Ctrl+V` (or `Cmd+V` on macOS)
- **Right-click** anywhere on the page and select "Paste Image from Clipboard"
- **Batch mode** — drop multiple files at once or use the batch upload button

### Select Language

Choose the image's language from the dropdown in the header for best accuracy. The first scan for each language downloads the language model (~10 MB) — subsequent scans are instant.

### Preprocess Images

After uploading, use the Image Editor toolbar to:
- **Rotate** the image by 90°, 180°, or 270°
- **Adjust brightness** with a slider (-100 to +100)
- **Adjust contrast** with a slider (-100 to +100)
- Click **Apply Adjustments** to re-process the image

### Extract Text

Once an image is uploaded, the OCR engine processes it automatically:

1. The image preview appears in the left panel
2. A progress bar shows the current processing status
3. Extracted text appears in the right panel with word/character/line counts and confidence score

### Search in Text

- Click the **Search** button or press `Ctrl+F` to open the search bar
- Type to find and highlight matches in the extracted text
- Navigate between matches with the up/down arrows

### Export Results

Click the **Export** dropdown to choose your format:
- **TXT** — plain text file
- **PDF** — formatted PDF document with title and date
- **DOCX** — Word document with headings and metadata

### View History

Press `Ctrl+H` or click the **History** button to see past extractions with thumbnails, timestamps, and word counts. Click any entry to restore its text.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+V` | Paste image from clipboard |
| `Ctrl+C` | Copy extracted text |
| `Ctrl+F` | Search in extracted text |
| `Ctrl+S` | Download extracted text |
| `Ctrl+/` | Toggle keyboard shortcuts panel |
| `Ctrl+H` | Toggle extraction history |
| `Esc` | Close menus / clear search |

---

## Architecture

```
Image-Text-Extractor/
├── app/
│   ├── globals.css           # Tailwind + light/dark mode overrides
│   ├── layout.tsx            # Root layout (HTML shell, Inter font)
│   └── page.tsx              # Home page (server component)
├── components/
│   ├── BatchResults.tsx      # Tabbed view for batch OCR results
│   ├── BatchUpload.tsx       # Multi-file upload for batch mode
│   ├── ContextMenu.tsx       # Custom right-click context menu
│   ├── ExportMenu.tsx        # Export dropdown (TXT/PDF/DOCX)
│   ├── HistoryPanel.tsx      # Extraction history modal
│   ├── ImageEditor.tsx       # Rotate, brightness, contrast controls
│   ├── ImageUploader.tsx     # Drag-drop, file browse, language selector
│   ├── LanguageSelector.tsx  # Language dropdown with search
│   ├── OCRApp.tsx            # Root client component (state + orchestration)
│   ├── OCRResult.tsx         # Text output, search, progress, actions
│   ├── ShortcutsModal.tsx    # Keyboard shortcuts panel
│   └── ThemeToggle.tsx       # Dark/light mode toggle button
├── lib/
│   ├── history.ts            # localStorage CRUD for extraction history
│   ├── imageProcessing.ts    # Canvas-based image manipulations
│   ├── ocr.ts                # Tesseract.js wrapper with multi-language support
│   └── theme.ts              # Dark/light theme hook with localStorage
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| UI Library | [React 18](https://react.dev) |
| OCR Engine | [Tesseract.js 5](https://tesseract.projectnaptha.com) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| PDF Export | [jsPDF](https://github.com/parallax/jsPDF) |
| DOCX Export | [docx](https://github.com/dolanmiu/docx) |
| Linting | [ESLint 9](https://eslint.org) with Next.js config |

---

## Contributing

Contributions are welcome. To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run `npm run build` to verify the build passes
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Tesseract.js](https://tesseract.projectnaptha.com) — the open-source OCR engine that powers this tool
- [Next.js](https://nextjs.org) — the React framework for production
- [Tailwind CSS](https://tailwindcss.com) — utility-first CSS framework
- [jsPDF](https://github.com/parallax/jsPDF) — PDF generation
- [docx](https://github.com/dolanmiu/docx) — Word document generation
