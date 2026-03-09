import { FileText, Calendar, User, Eye } from 'lucide-react'

export function BookRow({ book, onQuickLook }) {
    return (
        <tr
            className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-150 cursor-pointer group"
            onClick={() => onQuickLook(book)}
        >
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
                <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                    {book.category}
                </span>
            </td>
            <td className="px-4 py-3 hidden sm:table-cell">
                <div className="flex items-center text-gray-400 text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {book.publishDate}
                </div>
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
