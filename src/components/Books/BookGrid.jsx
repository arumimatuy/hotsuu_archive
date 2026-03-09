import { BookRow } from './BookCard'

export function BookTable({ books, onQuickLook }) {
    if (books.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                <p className="text-lg">該当する書籍が見つかりません。</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-200">
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">タイトル</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">著者</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">カテゴリ</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">公開日</th>
                            <th className="px-4 py-3 w-20"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map((book) => (
                            <BookRow key={book.id} book={book} onQuickLook={onQuickLook} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
