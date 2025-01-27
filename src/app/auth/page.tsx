'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthContext } from '@/app/lib/contexts/AuthContext'
import IslamicPattern from '@/app/components/ui/IslamicPattern'
import HeroSection from '@/app/components/landing/HeroSection'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const { signIn, signUp, signInWithGoogle, isSetupComplete } = useAuthContext()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isSignUp) {
        if (!acceptedTerms || !acceptedPrivacy) {
          setError('Please accept both the Terms of Service and Privacy Policy')
          return
        }
        await signUp(email, password, name)
        router.push('/profile-setup')
      } else {
        await signIn(email, password)
        router.push(isSetupComplete ? '/dashboard' : '/profile-setup')
      }
    } catch (err) {
      setError('Failed to authenticate. Please check your credentials.')
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      router.push(isSetupComplete ? '/dashboard' : '/profile-setup')
    } catch (err) {
      setError('Failed to sign in with Google.')
    }
  }

  const handleAuthChoice = (choice: 'signup' | 'login') => {
    setIsSignUp(choice === 'signup')
    setShowForm(true)
  }

  return (
    <main className="min-h-screen bg-emerald-900 relative">
      <IslamicPattern />
      
      <div className="relative z-10">
        {!showAuth ? (
          <HeroSection onGetStarted={() => setShowAuth(true)} />
        ) : !showForm ? (
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full">
              <div className="bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-xl">
                <div className="flex items-center mb-6">
                  <button
                    onClick={() => setShowAuth(false)}
                    className="text-emerald-900 hover:text-emerald-700 mr-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <h2 className="text-2xl font-bold text-emerald-900 flex-1 text-center pr-9">
                    Choose an Option
                  </h2>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => handleAuthChoice('signup')}
                    className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors text-lg font-semibold"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => handleAuthChoice('login')}
                    className="w-full bg-white border-2 border-emerald-600 text-emerald-900 py-3 px-4 rounded-lg hover:bg-emerald-50 transition-colors text-lg font-semibold"
                  >
                    Log In
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full">
              <div className="bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-xl">
                <div className="flex items-center mb-6">
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-emerald-900 hover:text-emerald-700 mr-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <h2 className="text-2xl font-bold text-emerald-900 flex-1 text-center pr-9">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                  </h2>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <label htmlFor="name" className="block text-emerald-900 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900"
                        required={isSignUp}
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-emerald-900 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-emerald-900 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900"
                      required
                    />
                  </div>

                  {isSignUp && (
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                        />
                        <label htmlFor="terms" className="ml-2 text-sm text-emerald-900">
                          I agree to the{' '}
                          <Link href="/terms" className="text-emerald-600 hover:underline">
                            Terms of Service
                          </Link>
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="privacy"
                          checked={acceptedPrivacy}
                          onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                        />
                        <label htmlFor="privacy" className="ml-2 text-sm text-emerald-900">
                          I agree to the{' '}
                          <Link href="/privacy" className="text-emerald-600 hover:underline">
                            Privacy Policy
                          </Link>
                        </label>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
                  >
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <span className="text-emerald-900">or</span>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  className="w-full mt-4 bg-white border border-emerald-200 text-emerald-900 py-2 px-4 rounded-md hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
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
                  Continue with Google
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
} 