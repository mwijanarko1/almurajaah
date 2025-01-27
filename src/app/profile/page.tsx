'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/app/lib/contexts/AuthContext'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/app/lib/firebase/firebase'
import Navbar from '@/app/components/Navbar'
import { Save, X } from 'lucide-react'

interface UserProfile {
  memorizedJuz: number[]
  juzProgress: { [key: string]: JuzProgress }
  revisionCycle: number
}

interface JuzProgress {
  lastRevised: string | null
  strength: 'Weak' | 'Medium' | 'Strong'
}

export default function ProfilePage() {
  const { user } = useAuthContext()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Profile states
  const [memorizedJuz, setMemorizedJuz] = useState<number[]>([])
  const [revisionCycle, setRevisionCycle] = useState(7)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    const fetchUserProfile = async () => {
      const userDoc = await getDoc(doc(db, 'userProfiles', user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile
        setMemorizedJuz(data.memorizedJuz || [])
        setRevisionCycle(data.revisionCycle || 7)
      }
    }

    fetchUserProfile()
  }, [user, router])

  const toggleJuz = (juzNum: number) => {
    setMemorizedJuz(prev => {
      const newJuz = prev.includes(juzNum)
        ? prev.filter(num => num !== juzNum)
        : [...prev, juzNum].sort((a, b) => a - b)
      setHasChanges(true)
      return newJuz
    })
  }

  const handleSave = async () => {
    if (!user) return
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const userDoc = await getDoc(doc(db, 'userProfiles', user.uid))
      const currentData = userDoc.exists() ? userDoc.data() as UserProfile : { juzProgress: {} }
      
      // Update juzProgress for newly added Juz
      const updatedJuzProgress = { ...currentData.juzProgress }
      memorizedJuz.forEach(juzNum => {
        if (!updatedJuzProgress[juzNum]) {
          updatedJuzProgress[juzNum] = {
            lastRevised: null,
            strength: 'Medium'
          }
        }
      })

      // Remove juzProgress for removed Juz
      Object.keys(updatedJuzProgress).forEach(juzNum => {
        if (!memorizedJuz.includes(Number(juzNum))) {
          delete updatedJuzProgress[juzNum]
        }
      })

      await updateDoc(doc(db, 'userProfiles', user.uid), {
        memorizedJuz,
        revisionCycle,
        juzProgress: updatedJuzProgress
      })

      setSuccess('Profile updated successfully')
      setHasChanges(false)
    } catch (err) {
      setError('Failed to update profile')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-text">Profile Settings</h1>
            <div className="flex gap-4">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-background text-text-secondary hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white hover:bg-secondary transition-colors disabled:bg-text-secondary"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

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

          <div className="bg-surface rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-text">Memorized Juz</h2>
                <p className="text-text-secondary mt-1">Toggle the Juz you have memorized</p>
              </div>
              <div className="text-text-secondary">
                {memorizedJuz.length}/30 Juz
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                <div
                  key={num}
                  className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-surface transition-colors"
                >
                  <span className="text-text">Juz {num}</span>
                  <button
                    onClick={() => toggleJuz(num)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    style={{ backgroundColor: memorizedJuz.includes(num) ? 'rgb(46, 204, 113)' : 'rgb(75, 85, 99)' }}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        memorizedJuz.includes(num) ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-semibold text-text mt-8 mb-4">Revision Cycle</h2>
            <p className="text-text-secondary mb-4">Set how often you want to revise each Juz:</p>
            
            <div className="flex gap-4">
              {[3, 5, 7, 10, 14].map(days => (
                <button
                  key={days}
                  onClick={() => {
                    setRevisionCycle(days)
                    setHasChanges(true)
                  }}
                  className={`
                    px-4 py-2 rounded-md transition-colors
                    ${revisionCycle === days
                      ? 'bg-primary text-white'
                      : 'bg-background text-text-secondary hover:bg-surface'}
                  `}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 