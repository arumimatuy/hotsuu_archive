import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { Button } from '../UI/Button'
import { Input } from '../UI/Input'

export function Login({ onLogin }) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)
        setError(false)

        // Simulate network delay for effect
        setTimeout(() => {
            // Hardcoded password for "Easy Management" as requested
            // In a real app, this should be an environment variable or backend check
            if (password === 'secret') {
                onLogin()
            } else {
                setError(true)
                setLoading(false)
            }
        }, 800)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Member Access</h2>
                    <p className="text-gray-500 text-sm mt-2">Enter the shared password to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={error ? "border-red-300 ring-2 ring-red-100" : ""}
                            autoFocus
                        />
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="text-red-500 text-sm mt-2 ml-1"
                            >
                                Incorrect password. Please try again.
                            </motion.p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || !password}
                    >
                        {loading ? "Verifying..." : "Enter Library"}
                    </Button>
                </form>
            </motion.div>
        </div>
    )
}
