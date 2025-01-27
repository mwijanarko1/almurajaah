'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/app/lib/contexts/AuthContext'
import { useTheme } from '@/app/lib/contexts/ThemeContext'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/app/lib/firebase/firebase'
import { updatePassword, updateEmail, updateProfile } from 'firebase/auth'
import Navbar from '@/app/components/Navbar'
import { Sun, Moon, Monitor, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react'

interface UserSettings {
  language: 'en' | 'ar'
  dateFormat: 'gregorian' | 'hijri'
  soundEnabled: boolean
}

interface CollapsibleCardProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function CollapsibleCard({ title, isOpen, onToggle, children }: CollapsibleCardProps) {
  return (
    <div className="bg-surface rounded-lg overflow-hidden mb-4">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-text hover:bg-background/5 transition-colors"
      >
        <h2 className="text-xl font-semibold">{title}</h2>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {isOpen && (
        <div className="p-6 border-t border-background/10">
          {children}
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuthContext()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [settings, setSettings] = useState<UserSettings>({
    language: 'en',
    dateFormat: 'gregorian',
    soundEnabled: true
  })

  // Collapsible states
  const [openSections, setOpenSections] = useState({
    profile: false,
    password: false,
    theme: false,
    language: false,
    sound: false
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    // Initialize form with user data
    setName(user.displayName || '')
    setEmail(user.email || '')

    // Fetch user settings
    const fetchSettings = async () => {
      const userDoc = await getDoc(doc(db, 'userProfiles', user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        if (data.settings) {
          setSettings(data.settings)
        }
      }
    }

    fetchSettings()
  }, [user, router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name })
      }
      if (email !== user.email) {
        await updateEmail(user, email)
      }
      setSuccess('Profile updated successfully')
    } catch (err) {
      setError('Failed to update profile')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      await updatePassword(user, newPassword)
      setSuccess('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setError('Failed to update password')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingsUpdate = async (updates: Partial<UserSettings>) => {
    if (!user) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const newSettings = { ...settings, ...updates }
      await updateDoc(doc(db, 'userProfiles', user.uid), {
        settings: newSettings
      })
      setSettings(newSettings)
      setSuccess('Settings updated successfully')
    } catch (err) {
      setError('Failed to update settings')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-text mb-8">Settings</h1>

          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-2 rounded-md mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-500 px-4 py-2 rounded-md mb-4">
              {success}
            </div>
          )}

          {/* Profile Settings */}
          <CollapsibleCard
            title="Profile Settings"
            isOpen={openSections.profile}
            onToggle={() => toggleSection('profile')}
          >
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-text-secondary mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background text-text px-4 py-2 rounded-md border border-text-secondary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-text-secondary mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background text-text px-4 py-2 rounded-md border border-text-secondary focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors disabled:bg-text-secondary"
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </CollapsibleCard>

          {/* Password Settings */}
          <CollapsibleCard
            title="Password Settings"
            isOpen={openSections.password}
            onToggle={() => toggleSection('password')}
          >
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-text-secondary mb-1">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-background text-text px-4 py-2 rounded-md border border-text-secondary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-text-secondary mb-1">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-background text-text px-4 py-2 rounded-md border border-text-secondary focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !currentPassword || !newPassword}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors disabled:bg-text-secondary"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </CollapsibleCard>

          {/* Theme Settings */}
          <CollapsibleCard
            title="Theme Settings"
            isOpen={openSections.theme}
            onToggle={() => toggleSection('theme')}
          >
            <div className="flex gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  theme === 'light'
                    ? 'bg-primary text-white'
                    : 'bg-background text-text-secondary hover:bg-opacity-80'
                }`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  theme === 'dark'
                    ? 'bg-primary text-white'
                    : 'bg-background text-text-secondary hover:bg-opacity-80'
                }`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  theme === 'system'
                    ? 'bg-primary text-white'
                    : 'bg-background text-text-secondary hover:bg-opacity-80'
                }`}
              >
                <Monitor className="w-4 h-4" />
                System
              </button>
            </div>
          </CollapsibleCard>

          {/* Language and Date Format */}
          <CollapsibleCard
            title="Language & Date Settings"
            isOpen={openSections.language}
            onToggle={() => toggleSection('language')}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary mb-2">Language</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleSettingsUpdate({ language: 'en' })}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      settings.language === 'en'
                        ? 'bg-primary text-white'
                        : 'bg-background text-text-secondary hover:bg-opacity-80'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleSettingsUpdate({ language: 'ar' })}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      settings.language === 'ar'
                        ? 'bg-primary text-white'
                        : 'bg-background text-text-secondary hover:bg-opacity-80'
                    }`}
                  >
                    العربية
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-text-secondary mb-2">Date Format</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleSettingsUpdate({ dateFormat: 'gregorian' })}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      settings.dateFormat === 'gregorian'
                        ? 'bg-primary text-white'
                        : 'bg-background text-text-secondary hover:bg-opacity-80'
                    }`}
                  >
                    Gregorian
                  </button>
                  <button
                    onClick={() => handleSettingsUpdate({ dateFormat: 'hijri' })}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      settings.dateFormat === 'hijri'
                        ? 'bg-primary text-white'
                        : 'bg-background text-text-secondary hover:bg-opacity-80'
                    }`}
                  >
                    Hijri
                  </button>
                </div>
              </div>
            </div>
          </CollapsibleCard>

          {/* Sound Settings */}
          <CollapsibleCard
            title="Sound Settings"
            isOpen={openSections.sound}
            onToggle={() => toggleSection('sound')}
          >
            <div className="flex gap-4">
              <button
                onClick={() => handleSettingsUpdate({ soundEnabled: true })}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  settings.soundEnabled
                    ? 'bg-primary text-white'
                    : 'bg-background text-text-secondary hover:bg-opacity-80'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                Sound On
              </button>
              <button
                onClick={() => handleSettingsUpdate({ soundEnabled: false })}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  !settings.soundEnabled
                    ? 'bg-primary text-white'
                    : 'bg-background text-text-secondary hover:bg-opacity-80'
                }`}
              >
                <VolumeX className="w-4 h-4" />
                Sound Off
              </button>
            </div>
          </CollapsibleCard>
        </div>
      </main>
    </div>
  )
} 