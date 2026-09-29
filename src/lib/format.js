// 号・頁・大きさの表示（2026-09-29）

export function issueLabel(book) {
    if (!book?.issueYm) return ''
    const [y, m] = book.issueYm.split('-').map((x) => parseInt(x, 10))
    return `${y}年${m}月号`
}

// 例: 保育通信 859号（2026年10月）p.34–35
export function citationLine(book) {
    if (!book?.issueYm && !book?.issueNo) return ''
    const parts = ['保育通信']
    if (book.issueNo) parts.push(`${book.issueNo}号`)
    let s = parts.join(' ')
    if (book.issueYm) {
        const [y, m] = book.issueYm.split('-').map((x) => parseInt(x, 10))
        s += `（${y}年${m}月）`
    }
    if (book.pageStart) {
        s += book.pageEnd && book.pageEnd !== book.pageStart ? ` p.${book.pageStart}–${book.pageEnd}` : ` p.${book.pageStart}`
    }
    return s
}

export function formatBytes(n) {
    if (!n && n !== 0) return ''
    if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))}KB`
    return `${(n / 1024 / 1024).toFixed(1)}MB`
}

// 並べ替えの鍵＝号の年月（YYYY-MM）。号の分からない行はシートの日付（2026/6/3 など）から年月を取る
export function issueSortKey(book) {
    if (book.issueYm) return book.issueYm
    const m = String(book.publishDate || '').match(/(\d{4})\D+(\d{1,2})/)
    return m ? `${m[1]}-${m[2].padStart(2, '0')}` : ''
}
