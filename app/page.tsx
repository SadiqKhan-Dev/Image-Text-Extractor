import OCRApp from '@/components/OCRApp';

export default function Home() {
  return (
    <main className="min-h-screen bg-theme-gradient">
      {/* Subtle purple glow in the background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-10 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 mb-4">
            <svg
              className="w-8 h-8 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-theme-primary mb-3 tracking-tight">
            Image Text Extractor
          </h1>
          <p className="text-theme-muted text-lg max-w-xl mx-auto">
            Upload any image and instantly extract all readable text using
            on-device OCR — no server required.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {['PNG', 'JPG', 'WEBP', 'Drag & Drop', 'Copy & Download', '100% Private'].map(
              (label) => (
                <span
                  key={label}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-theme-secondary border border-theme-secondary text-theme-muted"
                >
                  {label}
                </span>
              )
            )}
          </div>
        </header>

        {/* Main OCR Application */}
        <OCRApp />

        {/* Footer */}
        <footer className="text-center mt-12 text-theme-faint text-sm">
          <p>
            Powered by{' '}
            <span className="text-theme-muted font-medium">Tesseract.js</span> ·
            All processing happens in your browser
          </p>
        </footer>
      </div>
    </main>
  );
}
