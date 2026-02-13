import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export function Button({ className, variant = "primary", size = "md", ...props }) {
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg",
        secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-600",
        outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
    }

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg"
    }

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={cn(
                "rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    )
}
