import { X, FileText, Calendar, User, Download, BookOpen } from 'lucide-react'
import { citationLine } from '../../lib/format'

export function QuickLook({ book, onClose }) {
    if (!book) return null
    const citation = citationLine(book)
    const unavailable = !book.available

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] animate-modal-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-900 transition-colors"
                    aria-label="閉じる"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto max-h-[90vh]">
                    <div className="mb-6">
                        {book.category && (
                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-3">
                                {book.category}
                            </span>
                        )}
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight pr-10">
                            {book.title}
                        </h2>
                        <div className="flex items-center text-gray-600 font-medium">
                            <User className="w-5 h-5 mr-2" />
                            {book.author}
                        </div>
                        {citation && (
                            <div className="flex items-center text-gray-500 text-sm mt-2">
                                <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                                {citation}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">概要</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {book.description}
                        </p>
                    </div>

                    {unavailable && (
                        <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2">
                            この記事のPDFはまだサイトに載っていません（準備中）。
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                        <button
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            disabled={unavailable}
                            onClick={() => window.open(book.pdfUrl, '_blank')}
                        >
                            <FileText className="w-5 h-5" />
                            PDFを読む
                        </button>
                        <button
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            disabled={unavailable}
                            onClick={async () => {
                                try {
                                    // Fetch the file to force download, avoiding browser's default PDF viewer
                                    const response = await fetch(book.pdfUrl);
                                    if (!response.ok) throw new Error('Network response was not ok');
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;

                                    // Extract filename from URL or use book title
                                    let filename = `${book.title}.pdf`;
                                    if (book.pdfUrl && book.pdfUrl.includes('/')) {
                                        const urlParts = book.pdfUrl.split('/');
                                        const lastPart = decodeURIComponent(urlParts[urlParts.length - 1]);
                                        if (lastPart.endsWith('.pdf')) {
                                            filename = lastPart.normalize('NFC');
                                        }
                                    }

                                    link.download = filename;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(url);
                                } catch (error) {
                                    console.error('Download failed:', error);
                                    // Fallback to old method if fetch fails (e.g., CORS issues from other domains)
                                    const link = document.createElement('a');
                                    link.href = book.pdfUrl;
                                    link.download = `${book.title}.pdf`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }
                            }}
                        >
                            <Download className="w-5 h-5" />
                            ダウンロード
                        </button>
                    </div>

                    <div className="mt-6 flex items-center text-sm text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        発行日: {book.publishDate}
                    </div>
                </div>
            </div>
        </div>
    )
}
