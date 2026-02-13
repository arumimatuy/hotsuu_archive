import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export function AuthorList({ authors, selectedAuthor, onSelectAuthor }) {
    if (authors.length === 0) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 justify-center mb-8"
        >
            <button
                onClick={() => onSelectAuthor(null)}
                className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                    selectedAuthor === null
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                )}
            >
                全て
            </button>
            {authors.map((author) => (
                <button
                    key={author}
                    onClick={() => onSelectAuthor(author)}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                        selectedAuthor === author
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                    )}
                >
                    {author}
                </button>
            ))}
        </motion.div>
    )
}
