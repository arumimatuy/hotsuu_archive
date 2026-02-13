import { motion, AnimatePresence } from 'framer-motion'
import { BookCard } from './BookCard'

export function BookGrid({ books, onQuickLook }) {
    if (books.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
                <p className="text-lg">No books found matching your search.</p>
            </div>
        )
    }

    return (
        <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
            <AnimatePresence>
                {books.map((book) => (
                    <BookCard key={book.id} book={book} onQuickLook={onQuickLook} />
                ))}
            </AnimatePresence>
        </motion.div>
    )
}
