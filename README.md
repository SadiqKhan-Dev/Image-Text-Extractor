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
| **Multiple input methods** | Drag & drop, file browse, clipboard paste (Ctrl+V), or right-click paste |
| **Clipboard paste** | Paste screenshots or copied images directly with `Ctrl+V` or the right-click context menu |
| **Supported formats** | PNG, JPG, JPEG, WEBP — up to 10 MB |
| **Copy & Download** | Copy extracted text to clipboard or download as a `.txt` file |
| **Real-time progress** | Live progress bar and status updates during OCR processing |
| **Privacy first** | Zero server-side processing — images never leave your browser |
| **Responsive design** | Works beautifully on desktop, tablet, and mobile |
| **Modern UI** | Dark theme with glassmorphism effects, built with Tailwind CSS |

---

## Screenshots

```
┌─────────────────────────┬─────────────────────────┐
│                         │                         │
│    ┌───────────────┐    │   Extracted Text        │
│    │               │    │                         │
│    │   Image       │    │   Hello World           │
│    │   Preview     │    │   This is extracted     │
│    │               │    │   text from the         │
│    └───────────────┘    │   uploaded image.       │
│                         │                         │
│   [ Upload Image ]      │   [ Copy ] [ Download ] │
│                         │                         │
└─────────────────────────┴─────────────────────────┘
```

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

   Navigate to [http://localhost:3000](http://localhost:3200)

That's it — you're ready to go.

---

## Usage

### Upload an Image

- **Drag & drop** an image onto the upload zone
- **Click** the upload zone to browse and select a file
- **Paste** an image from your clipboard using `Ctrl+V` (or `Cmd+V` on macOS)
- **Right-click** anywhere on the page and select "Paste Image from Clipboard"

### Extract Text

Once an image is uploaded, the OCR engine processes it automatically:

1. The image preview appears in the left panel
2. A progress bar shows the current processing status
3. Extracted text appears in the right panel with word/character/line counts

### Export Results

- **Copy Text** — copies extracted text to your clipboard
- **Download .txt** — saves extracted text as a timestamped `.txt` file

---

## Architecture

```
Image-Text-Extractor/
├── app/
│   ├── globals.css          # Tailwind + custom scrollbar styles
│   ├── layout.tsx           # Root layout (HTML shell, Inter font)
│   └── page.tsx             # Home page (server component)
├── components/
│   ├── ContextMenu.tsx      # Custom right-click context menu
│   ├── ImageUploader.tsx    # Drag-drop, file browse, paste hint
│   ├── OCRApp.tsx           # Root client component (state + orchestration)
│   └── OCRResult.tsx        # Text output, progress bar, actions
├── lib/
│   └── ocr.ts               # Tesseract.js wrapper with progress tracking
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

### Component Responsibilities

| Component | Role |
|---|---|
| `OCRApp` | Owns all shared state, handles clipboard paste events, context menu, and orchestrates the OCR pipeline |
| `ImageUploader` | Manages the drop zone UI, file validation, drag-and-drop, and image preview |
| `OCRResult` | Displays extracted text, progress bar, error states, and copy/download actions |
| `ContextMenu` | Renders a custom right-click menu with clipboard paste option |
| `ocr.ts` | Dynamically imports Tesseract.js and provides a typed `extractTextFromImage` function |

### Data Flow

```
User Input (drop / paste / browse)
        │
        ▼
   OCRApp.handleFileSelect(file)
        │
        ├──► Creates blob URL for preview
        ├──► Sets processing state
        │
        ▼
   lib/ocr.ts → Tesseract.js worker
        │
        ├──► Progress callbacks → OCRResult progress bar
        │
        ▼
   Extracted text → OCRResult textarea
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
| Linting | [ESLint 9](https://eslint.org) with Next.js config |

---

## Contributing

Contributions are welcome. To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run `npm run lint` to check for issues
5. Run `npm run build` to verify the build passes
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Tesseract.js](https://tesseract.projectnaptha.com) — the open-source OCR engine that powers this tool
- [Next.js](https://nextjs.org) — the React framework for production
- [Tailwind CSS](https://tailwindcss.com) — utility-first CSS framework
