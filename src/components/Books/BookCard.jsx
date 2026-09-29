import { User, Eye } from 'lucide-react'
import { issueLabel } from '../../lib/format'

export function BookRow({ book, onQuickLook, selection }) {
    const canSelect = selection && !book.external && book.available
    const checked = canSelect && selection.selectedKeys.has(book.articleKey)
    const reason = !selection
        ? ''
        : book.external
            ? '号まるごとのPDF（別のサーバ）はまとめてダウンロードの対象外です'
            : !book.available
                ? 'PDFがまだサイトに載っていません'
                : ''

    return (
        <tr
            className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-150 cursor-pointer group ${checked ? 'bg-blue-50/40' : ''}`}
            onClick={() => onQuickLook(book)}
        >
            {selection && (
                <td className="pl-4 pr-1 py-3 w-8" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        className="w-4 h-4 accent-blue-600 cursor-pointer disabled:cursor-not-allowed align-middle"
                        aria-label={`${book.title} を選ぶ`}
                        title={reason || 'まとめてダウンロードに入れる'}
                        checked={Boolean(checked)}
                        disabled={!canSelect}
                        onChange={() => selection.onToggle(book)}
                    />
                </td>
            )}
            <td className="px-4 py-3">
                <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                    {book.title}
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center text-gray-600 text-sm">
                    <User className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{book.author}</span>
                </div>
            </td>
            <td className="px-4 py-3 hidden md:table-cell">
                {book.category && (
                    <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                        {book.category}
                    </span>
                )}
            </td>
            <td className="px-4 py-3 hidden sm:table-cell whitespace-nowrap">
                {book.issueYm ? (
                    <div className="text-sm text-gray-700">
                        {issueLabel(book)}
                        {book.issueNo && <span className="ml-1.5 text-xs text-gray-400">{book.issueNo}号</span>}
                    </div>
                ) : (
                    <span className="text-xs text-gray-400">{book.publishDate}</span>
                )}
            </td>
            <td className="px-4 py-3 text-right">
                <button
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                        e.stopPropagation()
                        onQuickLook(book)
                    }}
                >
                    <Eye className="w-3.5 h-3.5" />
                    詳細
                </button>
            </td>
        </tr>
    )
}
