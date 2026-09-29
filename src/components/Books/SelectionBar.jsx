import { Download, X } from 'lucide-react'
import { formatBytes } from '../../lib/format'

// チェックした記事があるときだけ画面の下に出る（ページや絞り込みを変えても選択は残る）
export function SelectionBar({ count, size, progress, onDownload, onClear }) {
    if (count === 0 && !progress) return null
    const busy = Boolean(progress)
    return (
        <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 pointer-events-none">
            <div className="pointer-events-auto max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 bg-gray-900/95 text-white rounded-2xl shadow-2xl animate-fade-in">
                <p className="text-sm" aria-live="polite">
                    {busy ? (
                        <>PDFを集めています… {progress.done}/{progress.total}</>
                    ) : (
                        <>
                            選択中 <strong className="text-lg mx-0.5">{count}</strong>件
                            {size ? <span className="text-gray-300">（約{formatBytes(size)}）</span> : null}
                        </>
                    )}
                </p>
                <div className="flex items-center gap-2">
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-wait"
                        disabled={busy}
                        onClick={onDownload}
                    >
                        <Download className="w-4 h-4" />
                        まとめてダウンロード
                    </button>
                    <button
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                        disabled={busy}
                        onClick={onClear}
                    >
                        <X className="w-4 h-4" />
                        選択を解除
                    </button>
                </div>
            </div>
        </div>
    )
}
