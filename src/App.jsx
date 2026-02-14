import { useState, useEffect, useMemo } from 'react'
import { Login } from './components/Auth/Login'
import { BookGrid } from './components/Books/BookGrid'
import { BookFilter } from './components/Books/BookFilter'
import { KanaFilter } from './components/Books/KanaFilter'
import { AuthorList } from './components/Books/AuthorList'
import { QuickLook } from './components/Books/QuickLook'
import { useBookData } from './hooks/useBookData'
import { KANA_MAP } from './lib/constants'
import { AnimatePresence } from 'framer-motion'

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [appLoading, setAppLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('newest')
    const [selectedKana, setSelectedKana] = useState('all')
    const [selectedAuthor, setSelectedAuthor] = useState(null)
    const [selectedBook, setSelectedBook] = useState(null)

    const { books, loading: dataLoading, error } = useBookData()

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

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(book =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query)
            )
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

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title, 'ja')
                case 'author':
                    return (a.author_kana || a.author).localeCompare(b.author_kana || b.author, 'ja')
                case 'newest':
                    return new Date(b.publishDate) - new Date(a.publishDate)
                case 'oldest':
                    return new Date(a.publishDate) - new Date(b.publishDate)
                default:
                    return 0
            }
        })

        return result
    }, [books, searchQuery, sortBy, selectedKana, selectedAuthor])

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
                            社内図書ライブラリ
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

            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 text-center sm:text-left">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">書籍一覧</h2>
                    <p className="text-gray-500">お探しの書籍を検索または著者名フィルターで絞り込めます。</p>
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
                        setSelectedAuthor(null) // Reset author when changing kana row
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
                />

                {dataLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <BookGrid
                        books={filteredBooks}
                        onQuickLook={(book) => setSelectedBook(book)}
                    />
                )}
            </main>

            <AnimatePresence>
                {selectedBook && (
                    <QuickLook
                        book={selectedBook}
                        onClose={() => setSelectedBook(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

export default App
