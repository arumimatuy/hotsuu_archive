import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '../UI/Input'

export function BookFilter({ searchQuery, setSearchQuery, sortBy, setSortBy }) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                    type="text"
                    placeholder="タイトル・著者名で検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                <SlidersHorizontal className="text-gray-400 w-5 h-5" />
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-48 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 cursor-pointer hover:bg-white transition-colors appearance-none"
                >
                    <option value="newest">新着順</option>
                    <option value="oldest">古い順</option>
                    <option value="title">タイトル順</option>
                    <option value="author">著者名順</option>
                </select>
            </div>
        </div>
    )
}
