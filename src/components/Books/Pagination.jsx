import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }) {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = []
        const maxVisible = 5
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
        let end = Math.min(totalPages, start + maxVisible - 1)

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1)
        }

        if (start > 1) {
            pages.push(1)
            if (start > 2) pages.push('...')
        }

        for (let i = start; i <= end; i++) {
            pages.push(i)
        }

        if (end < totalPages) {
            if (end < totalPages - 1) pages.push('...')
            pages.push(totalPages)
        }

        return pages
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
            {/* Items info + per page selector */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                    全 <strong className="text-gray-900">{totalItems}</strong> 件中{' '}
                    <strong className="text-gray-900">{startItem}</strong>–
                    <strong className="text-gray-900">{endItem}</strong> 件を表示
                </span>
                <div className="flex items-center gap-2">
                    <label htmlFor="page-size" className="text-gray-500">表示件数:</label>
                    <select
                        id="page-size"
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        className="px-2 py-1 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>{size}件</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-1">
                <NavButton
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    title="最初のページ"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </NavButton>
                <NavButton
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="前のページ"
                >
                    <ChevronLeft className="w-4 h-4" />
                </NavButton>

                {getPageNumbers().map((page, i) =>
                    page === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all duration-150 ${currentPage === page
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {page}
                        </button>
                    )
                )}

                <NavButton
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="次のページ"
                >
                    <ChevronRight className="w-4 h-4" />
                </NavButton>
                <NavButton
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    title="最後のページ"
                >
                    <ChevronsRight className="w-4 h-4" />
                </NavButton>
            </div>
        </div>
    )
}

function NavButton({ children, disabled, onClick, title }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
            {children}
        </button>
    )
}
