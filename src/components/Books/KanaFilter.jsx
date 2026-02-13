import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const KANA_ROWS = [
    { label: 'ALL', value: 'all' },
    { label: 'あ', value: 'あ' },
    { label: 'か', value: 'か' },
    { label: 'さ', value: 'さ' },
    { label: 'た', value: 'た' },
    { label: 'な', value: 'な' },
    { label: 'は', value: 'は' },
    { label: 'ま', value: 'ま' },
    { label: 'や', value: 'や' },
    { label: 'ら', value: 'ら' },
    { label: 'わ', value: 'わ' },
]

export function KanaFilter({ activeRow, onSelectRow }) {
    return (
        <div className="flex flex-wrap gap-2 justify-center mb-8 p-4 bg-white/50 backdrop-blur-md rounded-xl border border-gray-100">
            {KANA_ROWS.map((row) => (
                <button
                    key={row.value}
                    onClick={() => onSelectRow(row.value)}
                    className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200",
                        activeRow === row.value
                            ? "bg-blue-600 text-white shadow-md scale-110"
                            : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-100"
                    )}
                >
                    {row.label}
                </button>
            ))}
        </div>
    )
}
