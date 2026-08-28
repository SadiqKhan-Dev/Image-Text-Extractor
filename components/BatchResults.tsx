'use client';

interface BatchFile { file: File; status: 'pending' | 'processing' | 'done' | 'error'; text?: string; error?: string; previewUrl?: string; }
interface BatchResultsProps { files: BatchFile[]; activeIndex: number; onSelect: (index: number) => void; isProcessing: boolean; }

export default function BatchResults({ files, activeIndex, onSelect, isProcessing }: BatchResultsProps) {
  if (files.length === 0) return null;
  const completedCount = files.filter((f) => f.status === 'done').length;

  const handleCopyAll = async () => {
    const allText = files.filter((f) => f.status === 'done' && f.text).map((f) => `--- ${f.file.name} ---\n${f.text}`).join('\n\n');
    try { await navigator.clipboard.writeText(allText); } catch {}
  };

  return (
    <div className="mt-4 p-4 rounded-xl bg-theme-card border border-theme-muted">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-theme-secondary">Batch Progress</span>
          <span className="text-xs text-purple-500 tabular-nums">{completedCount}/{files.length}</span>
        </div>
        {completedCount > 1 && <button onClick={handleCopyAll} className="text-xs text-purple-500 hover:text-purple-400 transition-colors">Copy All</button>}
      </div>

      <div className="w-full h-1.5 bg-theme-secondary rounded-full overflow-hidden mb-3">
        <div className="h-full bg-gradient-to-r from-purple-600 to-violet-400 rounded-full transition-[width] duration-300" style={{ width: `${(completedCount / files.length) * 100}%` }} />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {files.map((f, i) => (
          <button key={i} onClick={() => onSelect(i)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${i === activeIndex ? 'bg-purple-500/10 text-purple-500 border border-purple-500/30' : 'text-theme-faint hover:bg-theme-secondary border border-transparent'}`}>
            {f.status === 'done' && <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
            {f.status === 'processing' && <div className="w-3 h-3 border border-purple-500 border-t-transparent rounded-full animate-spin" />}
            {f.status === 'error' && <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
            {f.file.name.length > 15 ? f.file.name.slice(0, 12) + '...' : f.file.name}
          </button>
        ))}
      </div>
    </div>
  );
}
