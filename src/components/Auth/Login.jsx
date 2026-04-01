import { useState } from 'react'
import { Lock } from 'lucide-react'

export function Login({ onLogin }) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)
        setError(false)

        setTimeout(() => {
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
            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 animate-fade-in">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">保育通信ライブラリ</h2>
                    <p className="text-gray-500 text-sm mt-2">パスワードを入力してください</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            placeholder="パスワード"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white/50 backdrop-blur-sm ${error ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'
                                }`}
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-2 ml-1 animate-fade-in">
                                パスワードが正しくありません。
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || !password}
                    >
                        {loading ? '確認中...' : 'ログイン'}
                    </button>
                </form>
            </div>
        </div>
    )
}
