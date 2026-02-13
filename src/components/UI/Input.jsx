import { cn } from '../../lib/utils'

export function Input({ className, ...props }) {
    return (
        <input
            className={cn(
                "w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm",
                className
            )}
            {...props}
        />
    )
}
