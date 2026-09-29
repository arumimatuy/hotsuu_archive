import { useState, useEffect, useMemo } from 'react'
import { Login } from './components/Auth/Login'
import { BookTable } from './components/Books/BookGrid'
import { BookFilter } from './components/Books/BookFilter'
import { KanaFilter } from './components/Books/KanaFilter'
import { AuthorList } from './components/Books/AuthorList'
import { QuickLook } from './components/Books/QuickLook'
import { Pagination } from './components/Books/Pagination'
import { IssueDownload } from './components/Books/IssueDownload'
import { SelectionBar } from './components/Books/SelectionBar'
import { useBookData } from './hooks/useBookData'
import { KANA_MAP } from './lib/constants'
import { BULK_DOWNLOAD } from './lib/config'
import { issueLabel, issueSortKey, formatBytes } from './lib/format'
import { downloadAsZip } from './lib/bulkDownload'

// 選んだ記事の合計がこれを超えたら確認を出す（⚠️Claudeの提案・仮の値＝全件はおよそ80MB）
const CONFIRM_BYTES = 50 * 1024 * 1024

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [appLoading, setAppLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('newest')
    const [selectedKana, setSelectedKana] = useState('all')
    const [selectedAuthor, setSelectedAuthor] = useState(null)
    const [selectedIssue, setSelectedIssue] = useState('all')
    const [selectedBook, setSelectedBook] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)
    const [selectedKeys, setSelectedKeys] = useState(() => new Set())
    const [progress, setProgress] = useState(null)

    const { books, catalog, loading: dataLoading, error } = useBookData()
    const bulkEnabled = BULK_DOWNLOAD && Boolean(catalog?.bulkDownload)

    useEffect(() => {
        const auth = sessionStorage.getItem('isAuthenticated')
        if (auth === 'true') {
            setIsAuthenticated(true)
        }
        setAppLoading(false)
    }, [])

    const handleLogin = () => {
        sessionStorage.setItem('isAuthenticated', 'true')
        setIsAuthenticated(true)
    }

    const handleLogout = () => {
        sessionStorage.removeItem('isAuthenticated')
        setIsAuthenticated(false)
    }

    // 号の一覧（新しい号から）。ZIPの情報は catalog.json から
    const issues = useMemo(() => {
        const zipByYm = new Map((catalog?.issues || []).map((i) => [i.ym, i]))
        const byYm = new Map()
        for (const book of books) {
            if (!book.issueYm) continue
            if (!byYm.has(book.issueYm)) {
                const z = zipByYm.get(book.issueYm)
                byYm.set(book.issueYm, {
                    ym: book.issueYm,
                    no: book.issueNo ?? z?.no ?? null,
                    label: issueLabel(book),
                    zip: bulkEnabled ? z?.zip : undefined,
                    zipSize: z?.zipSize,
                    size: z?.size,
                    count: z?.count,
                })
            }
        }
        return [...byYm.values()].sort((a, b) => b.ym.localeCompare(a.ym))
    }, [books, catalog, bulkEnabled])

    // Available authors for selected Kana row
    const availableAuthors = useMemo(() => {
        if (selectedKana === 'all') return []

        const targetChars = KANA_MAP[selectedKana] || []

        const authors = new Set()
        books.forEach(book => {
            const firstChar = book.author_kana?.charAt(0)
            if (firstChar && targetChars.includes(firstChar)) {
                authors.add(book.author)
            }
        })
        return Array.from(authors).sort((a, b) => a.localeCompare(b, 'ja'))
    }, [books, selectedKana])

    const filteredBooks = useMemo(() => {
        let result = [...books]

        // Search filter（タイトル・著者・号）
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(book =>
                book.title.toLowerCase().includes(query) ||
                (book.author || '').toLowerCase().includes(query) ||
                issueLabel(book).includes(query) ||
                (book.issueNo ? `${book.issueNo}号`.includes(query) : false)
            )
        }

        // Issue filter
        if (selectedIssue !== 'all') {
            result = result.filter(book => book.issueYm === selectedIssue)
        }

        // Kana filter
        if (selectedKana !== 'all') {
            const targetChars = KANA_MAP[selectedKana] || []

            result = result.filter(book => {
                const firstChar = book.author_kana?.charAt(0)
                if (!firstChar) return false
                return targetChars.includes(firstChar)
            })
        }

        // Author filter
        if (selectedAuthor) {
            result = result.filter(book => book.author === selectedAuthor)
        }

        // Sort（号の新旧 → 同じ号の中は頁の順＝誌面の並び）
        const page = (b) => b.pageStart ?? 9999
        result.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title, 'ja')
                case 'author':
                    return (a.author_kana || a.author || '').localeCompare(b.author_kana || b.author || '', 'ja')
                case 'newest':
                    return issueSortKey(b).localeCompare(issueSortKey(a)) || page(a) - page(b) || a.title.localeCompare(b.title, 'ja')
                case 'oldest':
                    return issueSortKey(a).localeCompare(issueSortKey(b)) || page(a) - page(b) || a.title.localeCompare(b.title, 'ja')
                default:
                    return 0
            }
        })

        return result
    }, [books, searchQuery, sortBy, selectedKana, selectedAuthor, selectedIssue])

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, sortBy, selectedKana, selectedAuthor, selectedIssue])

    // Paginated books
    const paginatedBooks = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredBooks.slice(start, start + itemsPerPage)
    }, [filteredBooks, currentPage, itemsPerPage])

    const handleItemsPerPageChange = (newSize) => {
        setItemsPerPage(newSize)
        setCurrentPage(1)
    }

    // ---- 選んだ記事のまとめてダウンロード ----
    const bookByKey = useMemo(() => {
        const m = new Map()
        for (const b of books) if (!m.has(b.articleKey)) m.set(b.articleKey, b)
        return m
    }, [books])

    const selectedSize = useMemo(
        () => [...selectedKeys].reduce((sum, k) => sum + (bookByKey.get(k)?.size || 0), 0),
        [selectedKeys, bookByKey],
    )

    const selection = bulkEnabled
        ? {
            selectedKeys,
            onToggle: (book) =>
                setSelectedKeys((prev) => {
                    const next = new Set(prev)
                    if (next.has(book.articleKey)) next.delete(book.articleKey)
                    else next.add(book.articleKey)
                    return next
                }),
            onTogglePage: (pageBooks, checked) =>
                setSelectedKeys((prev) => {
                    const next = new Set(prev)
                    for (const b of pageBooks) {
                        if (checked) next.add(b.articleKey)
                        else next.delete(b.articleKey)
                    }
                    return next
                }),
        }
        : null

    const handleBulkDownload = async () => {
        const items = [...selectedKeys]
            .map((k) => bookByKey.get(k))
            .filter((b) => b && !b.external && b.available)
            .map((b) => ({ name: b.fileName, url: b.pdfUrl, title: b.title }))
        if (items.length === 0) return
        if (selectedSize > CONFIRM_BYTES && !window.confirm(`合計 約${formatBytes(selectedSize)} あります。まとめてダウンロードしますか？`)) {
            return
        }
        setProgress({ done: 0, total: items.length })
        try {
            const result = await downloadAsZip(items, (done, total) => setProgress({ done, total }))
            if (result.failed.length > 0) {
                window.alert(`次の${result.failed.length}件は取得できませんでした。\n${result.failed.join('\n')}`)
            }
        } finally {
            setProgress(null)
        }
    }

    const currentIssue = selectedIssue !== 'all' ? issues.find((i) => i.ym === selectedIssue) : null

    if (appLoading) return null

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">📚</span>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            保育通信ライブラリ
                        </h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        ログアウト
                    </button>
                </div>
            </header>

            <main className={`flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 ${selectedKeys.size > 0 ? 'pb-28' : ''}`}>
                <div className="mb-8 text-center sm:text-left">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">記事一覧</h2>
                    <p className="text-gray-500">
                        お探しの記事を検索または著者名フィルターで絞り込めます。
                        {bulkEnabled && ' 号で絞るとその号をまとめて、チェックした記事は選んだ分だけまとめてダウンロードできます。'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 border border-red-100">
                        <p className="font-bold">データの読み込みに失敗しました。</p>
                        <p className="text-sm mt-1">{error.message || "詳細なエラー情報はコンソールを確認してください。"}</p>
                    </div>
                )}

                <KanaFilter
                    activeRow={selectedKana}
                    onSelectRow={(row) => {
                        setSelectedKana(row)
                        setSelectedAuthor(null)
                    }}
                />

                {selectedKana !== 'all' && (
                    <AuthorList
                        authors={availableAuthors}
                        selectedAuthor={selectedAuthor}
                        onSelectAuthor={setSelectedAuthor}
                    />
                )}

                <BookFilter
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    issues={issues}
                    selectedIssue={selectedIssue}
                    setSelectedIssue={setSelectedIssue}
                />

                {dataLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {bulkEnabled && currentIssue && <IssueDownload issue={currentIssue} />}
                        <BookTable
                            books={paginatedBooks}
                            onQuickLook={(book) => setSelectedBook(book)}
                            selection={selection}
                        />
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredBooks.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    </>
                )}
            </main>

            {bulkEnabled && (
                <SelectionBar
                    count={selectedKeys.size}
                    size={selectedSize}
                    progress={progress}
                    onDownload={handleBulkDownload}
                    onClear={() => setSelectedKeys(new Set())}
                />
            )}

            {selectedBook && (
                <QuickLook
                    book={selectedBook}
                    onClose={() => setSelectedBook(null)}
                />
            )}
        </div>
    )
}

export default App
