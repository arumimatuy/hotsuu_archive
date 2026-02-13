import { motion } from 'framer-motion'
import { FileText, Calendar, User } from 'lucide-react'
import { Button } from '../UI/Button'

export function BookCard({ book, onQuickLook }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col h-full"
        >
            <div className="relative aspect-[2/3] overflow-hidden bg-gray-100">
                <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                {/* Hover overlay button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                        variant="primary"
                        className="shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                        onClick={() => onQuickLook(book)}
                    >
                        詳細を見る
                    </Button>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <div className="mb-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                        {book.category}
                    </span>
                </div>

                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 line-clamp-2">
                    {book.title}
                </h3>

                <div className="flex items-center text-gray-500 text-sm mb-4">
                    <User className="w-4 h-4 mr-1" />
                    <span className="truncate">{book.author}</span>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {book.publishDate}
                    </div>
                    <div className="flex items-center">
                        <FileText className="w-3 h-3 mr-1" />
                        PDF
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
