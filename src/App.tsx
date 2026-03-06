import { useState, useEffect, useCallback } from 'react'
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import './App.css'

// Replace these with real IDs when ready
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'
const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID'

declare global {
  interface Window {
    FB: {
      init: (params: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void
      login: (callback: (response: { authResponse?: { accessToken: string } }) => void, options: { scope: string }) => void
      api: (path: string, callback: (response: { name?: string; email?: string }) => void) => void
    }
    fbAsyncInit: () => void
  }
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; provider: string } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login:', { email, password, remember })
  }

  // Google OAuth
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        const profile = await res.json()
        setUser({ name: profile.name, email: profile.email, provider: 'Google' })
        console.log('Google login success:', profile)
      } catch (error) {
        console.error('Google login error:', error)
        alert('Google login failed. Make sure you have a valid Client ID configured.')
      }
    },
    onError: () => {
      console.error('Google login failed')
      alert('Google login failed. Make sure you have a valid Client ID configured.')
    },
  })

  // Facebook SDK initialization
  useEffect(() => {
    if (document.getElementById('facebook-jssdk')) return

    window.fbAsyncInit = () => {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0',
      })
    }

    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)
  }, [])

  const handleFacebookLogin = useCallback(() => {
    if (!window.FB) {
      alert('Facebook SDK not loaded. Make sure you have a valid App ID configured.')
      return
    }
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          window.FB.api('/me?fields=name,email', (profile) => {
            setUser({
              name: profile.name || 'Facebook User',
              email: profile.email || '',
              provider: 'Facebook',
            })
            console.log('Facebook login success:', profile)
          })
        } else {
          console.log('Facebook login cancelled')
        }
      },
      { scope: 'email,public_profile' }
    )
  }, [])

  // Show logged-in state
  if (user) {
    return (
      <div className="min-h-screen bg-neutral-200 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-2xl overflow-hidden p-6">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
            Welcome, {user.name}!
          </h1>
          <p className="text-sm text-neutral-500 mb-1">Email: {user.email}</p>
          <p className="text-sm text-neutral-500 mb-4">Signed in via {user.provider}</p>
          <button
            onClick={() => setUser(null)}
            className="w-full py-3 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-800 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    )
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
            onClick={() => googleLogin()}
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

          {/* Facebook Button */}
          <button
            type="button"
            onClick={handleFacebookLogin}
            className="w-full py-3 px-4 bg-white border border-neutral-300 rounded-full text-sm font-medium text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100 transition-colors flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                fill="#1877F2"
              />
            </svg>
            Sign in with <span className="font-semibold">Facebook</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginForm />
    </GoogleOAuthProvider>
  )
}

export default App
