import { motion } from 'framer-motion'
import { X, FileText, Calendar, User, Download } from 'lucide-react'
import { Button } from '../UI/Button'

export function QuickLook({ book, onClose }) {
    if (!book) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/50 backdrop-blur-md rounded-full hover:bg-white text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left: Image */}
                <div className="w-full md:w-2/5 h-64 md:h-auto relative bg-gray-100 flex-shrink-0">
                    <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Right: Content */}
                <div className="p-6 md:p-8 flex flex-col flex-grow overflow-y-auto">
                    <div className="mb-6">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-3">
                            {book.category}
                        </span>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                            {book.title}
                        </h2>
                        <div className="flex items-center text-gray-600 font-medium">
                            <User className="w-5 h-5 mr-2" />
                            {book.author}
                        </div>
                    </div>

                    <div className="space-y-4 mb-8 flex-grow">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">概要</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {book.description}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100 mt-auto">
                        <Button
                            variant="primary"
                            size="lg"
                            className="flex-1 flex items-center justify-center gap-2"
                            onClick={() => window.open(book.pdfUrl, '_blank')}
                        >
                            <FileText className="w-5 h-5" />
                            PDFを読む
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="flex items-center justify-center gap-2"
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = book.pdfUrl;
                                link.download = book.title || 'download';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                        >
                            <Download className="w-5 h-5" />
                            ダウンロード
                        </Button>
                    </div>

                    <div className="mt-6 flex items-center text-sm text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        公開日: {book.publishDate}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
