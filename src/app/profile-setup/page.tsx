'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/app/lib/contexts/AuthContext'
import { db } from '@/app/lib/firebase/firebase'
import { doc, setDoc } from 'firebase/firestore'

export default function ProfileSetup() {
  const [selectedJuz, setSelectedJuz] = useState<number[]>([])
  const [revisionCycle, setRevisionCycle] = useState(7) // Default 7 days
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthContext()
  const router = useRouter()

  const toggleJuz = (juzNumber: number) => {
    setSelectedJuz(prev => 
      prev.includes(juzNumber)
        ? prev.filter(num => num !== juzNumber)
        : [...prev, juzNumber]
    )
  }

  const handleSubmit = async () => {
    if (!user) return
    setIsLoading(true)

    try {
      const userProfileRef = doc(db, 'userProfiles', user.uid)
      const juzProgress: { [key: string]: any } = {}
      
      selectedJuz.forEach(juzNum => {
        juzProgress[juzNum] = {
          lastRevised: null,
          strength: 'Medium'
        }
      })

      await setDoc(userProfileRef, {
        memorizedJuz: selectedJuz,
        juzProgress,
        revisionCycle,
        setupCompleted: true,
        displayName: user.displayName || 'User' // Add display name from user object
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedJuz.length === 30) {
      setSelectedJuz([])
    } else {
      setSelectedJuz(Array.from({ length: 30 }, (_, i) => i + 1))
    }
  }

  return (
    <main className="min-h-screen bg-[#0A2E1F] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1B4D3E] rounded-lg p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-2">
            Setup Your Profile
          </h1>
          <p className="text-gray-300 mb-8">
            Select the Juz you have memorized and set your revision cycle.
          </p>

          {/* Revision Cycle Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Revision Cycle
            </h2>
            <p className="text-gray-300 mb-4">
              How many days should one cycle of revision be?
            </p>
            <div className="flex flex-wrap gap-4">
              {[3, 5, 7, 10, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setRevisionCycle(days)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${revisionCycle === days
                      ? 'bg-[#2ECC71] text-white'
                      : 'bg-black bg-opacity-20 text-gray-300 hover:bg-opacity-30'
                    }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Juz Selection */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                Select Memorized Juz
              </h2>
              <button
                onClick={handleSelectAll}
                className="text-[#2ECC71] hover:text-[#27AE60] text-sm"
              >
                {selectedJuz.length === 30 ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNumber) => (
                <div
                  key={juzNumber}
                  className="flex items-center justify-between p-3 rounded-lg bg-black bg-opacity-20 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-lg text-white">Juz {juzNumber}</span>
                  <button
                    onClick={() => toggleJuz(juzNumber)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      selectedJuz.includes(juzNumber) ? 'bg-[#2ECC71]' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform bg-white ${
                        selectedJuz.includes(juzNumber) ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedJuz.length === 0 || isLoading}
            className={`w-full py-3 rounded-lg text-white font-medium transition-colors
              ${selectedJuz.length === 0 || isLoading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-[#2ECC71] hover:bg-[#27AE60]'
              }`}
          >
            {isLoading ? 'Setting up...' : 'Continue to Dashboard'}
          </button>
        </div>
      </div>
    </main>
  )
} 