import { BookRow } from './BookCard'

// selection … 一括ダウンロードが有効なときだけ渡す { selectedKeys: Set, onToggle(book), onTogglePage(books, checked) }
export function BookTable({ books, onQuickLook, selection }) {
    if (books.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                <p className="text-lg">該当する記事が見つかりません。</p>
            </div>
        )
    }

    const selectable = selection ? books.filter((b) => !b.external && b.available) : []
    const allChecked = selectable.length > 0 && selectable.every((b) => selection.selectedKeys.has(b.articleKey))

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-200">
                            {selection && (
                                <th className="pl-4 pr-1 py-3 w-8">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-blue-600 cursor-pointer align-middle"
                                        aria-label="このページの記事をすべて選ぶ"
                                        title="このページの記事をすべて選ぶ"
                                        checked={allChecked}
                                        disabled={selectable.length === 0}
                                        onChange={(e) => selection.onTogglePage(selectable, e.target.checked)}
                                    />
                                </th>
                            )}
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">タイトル</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">著者</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">カテゴリ</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">号</th>
                            <th className="px-4 py-3 w-20"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map((book) => (
                            <BookRow key={book.rowKey} book={book} onQuickLook={onQuickLook} selection={selection} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
