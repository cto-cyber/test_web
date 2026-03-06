import { useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login:', { email, password, remember })
  }

  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-0">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Log in to your account
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Please enter your details.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pt-5 pb-0">
          <div className="space-y-3">
            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
              />
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
              />
              <span className="text-sm text-neutral-700">Remember for 30 days</span>
            </label>
            <a
              href="#"
              className="text-sm font-medium text-neutral-900 underline hover:text-neutral-700 transition-colors"
            >
              Forgot password
            </a>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 pt-6 pb-6 space-y-3 border-t-0">
          {/* Primary Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full py-3 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-800 active:bg-neutral-950 transition-colors"
          >
            Primary Action
          </button>

          {/* Google Button */}
          <button
            type="button"
            className="w-full py-3 px-4 bg-white border border-neutral-300 rounded-full text-sm font-medium text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100 transition-colors flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with <span className="font-semibold">Google</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
