import { Download } from 'lucide-react'
import { assetUrl } from '../../lib/config'
import { downloadUrl } from '../../lib/bulkDownload'
import { formatBytes } from '../../lib/format'

// 号で絞っているときに表の上に出す「この号をまとめてダウンロード」
export function IssueDownload({ issue }) {
    if (!issue?.zip) return null
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-4 py-3 bg-blue-50/60 border border-blue-100 rounded-xl">
            <p className="text-sm text-gray-700">
                <strong className="text-gray-900">{issue.label}</strong>
                {issue.no ? `（${issue.no}号）` : ''}の記事PDF {issue.count}本を1つのZIPにまとめています（約{formatBytes(issue.zipSize ?? issue.size)}）。
            </p>
            <button
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors whitespace-nowrap"
                onClick={() => downloadUrl(assetUrl(`zips/${encodeURIComponent(issue.zip)}`), issue.zip)}
            >
                <Download className="w-4 h-4" />
                この号をまとめてダウンロード
            </button>
        </div>
    )
}
