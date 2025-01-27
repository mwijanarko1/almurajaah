'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/app/lib/contexts/AuthContext'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/app/lib/firebase/firebase'
import JuzCard from '@/app/components/JuzCard'
import SurahCard from '@/app/components/SurahCard'
import Navbar from '@/app/components/Navbar'
import { surahs } from '@/app/lib/data/surahs'
import { LayoutGrid, List } from 'lucide-react'

interface JuzProgress {
  lastRevised: string | null
  strength: 'Weak' | 'Medium' | 'Strong'
}

interface SurahProgress {
  lastRevised: string | null
  strength: 'Weak' | 'Medium' | 'Strong'
}

interface UserProfile {
  memorizedJuz: number[]
  juzProgress: { [key: string]: JuzProgress }
  surahProgress: { [key: string]: SurahProgress }
  revisionCycle: number
}

type SortOption = 'number' | 'lastRevised' | 'strength'
type ViewMode = 'juz' | 'surah'

const MOTIVATIONAL_QUOTES = [
  "The Prophet ﷺ said:\n\n\"Be diligent in maintaining your connection with this Qur'an, for by the One in Whose hand is the soul of Muhammad, it escapes more easily than a camel from its tether.\""
]

export default function DashboardPage() {
  const { user } = useAuthContext()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('number')
  const [viewMode, setViewMode] = useState<ViewMode>('juz')
  const [quote, setQuote] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Set random motivational quote
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
    setQuote(randomQuote)
  }, [])

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    const fetchUserProfile = async () => {
      const userDoc = await getDoc(doc(db, 'userProfiles', user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile
        if (!data.juzProgress) {
          data.juzProgress = {}
          data.memorizedJuz.forEach(juzNum => {
            data.juzProgress[juzNum] = {
              lastRevised: null,
              strength: 'Medium'
            }
          })
        }
        if (!data.surahProgress) {
          data.surahProgress = {}
        }
        if (!data.revisionCycle) {
          data.revisionCycle = 7
        }
        await updateDoc(doc(db, 'userProfiles', user.uid), {
          juzProgress: data.juzProgress,
          surahProgress: data.surahProgress,
          revisionCycle: data.revisionCycle
        })
        setUserProfile(data)
      }
    }

    fetchUserProfile()
  }, [user, router])

  const getSurahsInJuz = (juzNum: number) => {
    return surahs.filter(surah => surah.juz.includes(juzNum))
  }

  const handleJuzRevisionUpdate = async (juzNumber: number, date: string) => {
    if (!userProfile) return
    setIsLoading(true)

    try {
      // Update all surahs in this juz
      const surahsInJuz = getSurahsInJuz(juzNumber)
      const updatedSurahProgress = { ...userProfile.surahProgress }
      
      surahsInJuz.forEach(surah => {
        updatedSurahProgress[surah.number.toString()] = {
          ...updatedSurahProgress[surah.number.toString()] || { strength: 'Medium' },
          lastRevised: date
        }
      })

      const updatedJuzProgress = {
        ...userProfile.juzProgress,
        [juzNumber.toString()]: {
          ...userProfile.juzProgress[juzNumber.toString()],
          lastRevised: date
        }
      }

      await updateDoc(doc(db, 'userProfiles', user!.uid), {
        juzProgress: updatedJuzProgress,
        surahProgress: updatedSurahProgress
      })

      setUserProfile({
        ...userProfile,
        juzProgress: updatedJuzProgress,
        surahProgress: updatedSurahProgress
      })
    } catch (error) {
      console.error('Error updating juz revision:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSurahRevisionUpdate = async (surahNumber: number, date: string) => {
    if (!userProfile) return
    setIsLoading(true)

    try {
      // Update the surah progress
      const updatedSurahProgress = {
        ...userProfile.surahProgress,
        [surahNumber.toString()]: {
          ...userProfile.surahProgress[surahNumber.toString()] || { strength: 'Medium' },
          lastRevised: date
        }
      }

      // Find which juz this surah belongs to
      const surah = surahs.find(s => s.number === surahNumber)
      if (!surah) return

      // For each juz this surah belongs to, check if all its surahs are revised
      const updatedJuzProgress = { ...userProfile.juzProgress }
      
      surah.juz.forEach(juzNum => {
        if (!userProfile.memorizedJuz.includes(juzNum)) return

        const allSurahsInJuz = getSurahsInJuz(juzNum)
        const allSurahsRevised = allSurahsInJuz.every(s => {
          const surahProgress = updatedSurahProgress[s.number.toString()]
          if (!surahProgress?.lastRevised) return false
          
          const lastRevisionDate = new Date(surahProgress.lastRevised)
          const cycleStartDate = new Date()
          cycleStartDate.setDate(cycleStartDate.getDate() - userProfile.revisionCycle)
          
          return lastRevisionDate >= cycleStartDate
        })

        if (allSurahsRevised) {
          // Find the most recent revision date among all surahs
          const mostRecentDate = allSurahsInJuz
            .map(s => new Date(updatedSurahProgress[s.number.toString()].lastRevised!))
            .reduce((latest, current) => current > latest ? current : latest)
            .toISOString()

          updatedJuzProgress[juzNum.toString()] = {
            ...updatedJuzProgress[juzNum.toString()],
            lastRevised: mostRecentDate
          }
        }
      })

      await updateDoc(doc(db, 'userProfiles', user!.uid), {
        surahProgress: updatedSurahProgress,
        juzProgress: updatedJuzProgress
      })

      setUserProfile({
        ...userProfile,
        surahProgress: updatedSurahProgress,
        juzProgress: updatedJuzProgress
      })
    } catch (error) {
      console.error('Error updating surah revision:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJuzStrengthChange = async (juzNumber: number, newStrength: 'Weak' | 'Medium' | 'Strong') => {
    if (!user || !userProfile) return
    setIsLoading(true)

    try {
      // Update strength for all surahs in this juz
      const surahsInJuz = getSurahsInJuz(juzNumber)
      const updatedSurahProgress = { ...userProfile.surahProgress }
      
      surahsInJuz.forEach(surah => {
        updatedSurahProgress[surah.number.toString()] = {
          ...updatedSurahProgress[surah.number.toString()] || { lastRevised: null },
          strength: newStrength
        }
      })

      const updatedJuzProgress = {
        ...userProfile.juzProgress,
        [juzNumber.toString()]: {
          ...userProfile.juzProgress[juzNumber.toString()],
          strength: newStrength
        }
      }

      await updateDoc(doc(db, 'userProfiles', user.uid), {
        juzProgress: updatedJuzProgress,
        surahProgress: updatedSurahProgress
      })

      setUserProfile({
        ...userProfile,
        juzProgress: updatedJuzProgress,
        surahProgress: updatedSurahProgress
      })
    } catch (error) {
      console.error('Error updating juz strength:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSurahStrengthChange = async (surahNumber: number, newStrength: 'Weak' | 'Medium' | 'Strong') => {
    if (!user || !userProfile) return
    setIsLoading(true)

    try {
      const updatedSurahProgress = {
        ...userProfile.surahProgress,
        [surahNumber.toString()]: {
          ...userProfile.surahProgress[surahNumber.toString()] || { lastRevised: null },
          strength: newStrength
        }
      }

      // Find which juz this surah belongs to
      const surah = surahs.find(s => s.number === surahNumber)
      if (!surah) return

      // For each juz this surah belongs to, check if all its surahs have the same strength
      const updatedJuzProgress = { ...userProfile.juzProgress }
      
      surah.juz.forEach(juzNum => {
        const allSurahsInJuz = getSurahsInJuz(juzNum)
        const allSurahsSameStrength = allSurahsInJuz.every(s => 
          updatedSurahProgress[s.number.toString()]?.strength === newStrength
        )

        if (allSurahsSameStrength) {
          updatedJuzProgress[juzNum.toString()] = {
            ...updatedJuzProgress[juzNum.toString()],
            strength: newStrength
          }
        }
      })

      await updateDoc(doc(db, 'userProfiles', user.uid), {
        surahProgress: updatedSurahProgress,
        juzProgress: updatedJuzProgress
      })

      setUserProfile({
        ...userProfile,
        surahProgress: updatedSurahProgress,
        juzProgress: updatedJuzProgress
      })
    } catch (error) {
      console.error('Error updating surah strength:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const needsRevision = (progress: JuzProgress | SurahProgress) => {
    if (!progress.lastRevised || !userProfile) return true
    const lastDate = new Date(progress.lastRevised)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - lastDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= userProfile.revisionCycle
  }

  const getSortedItems = () => {
    if (!userProfile) return []
    
    if (viewMode === 'juz') {
      return [...userProfile.memorizedJuz].sort((a, b) => {
        const juzA = userProfile.juzProgress[a]
        const juzB = userProfile.juzProgress[b]

        switch (sortBy) {
          case 'lastRevised': {
            if (!juzA.lastRevised && !juzB.lastRevised) return 0
            if (!juzA.lastRevised) return -1
            if (!juzB.lastRevised) return 1

            const dateA = new Date(juzA.lastRevised)
            const dateB = new Date(juzB.lastRevised)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            dateA.setHours(0, 0, 0, 0)
            dateB.setHours(0, 0, 0, 0)

            const daysA = Math.ceil(Math.abs(today.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24))
            const daysB = Math.ceil(Math.abs(today.getTime() - dateB.getTime()) / (1000 * 60 * 60 * 24))

            const needsRevisionA = daysA >= userProfile.revisionCycle
            const needsRevisionB = daysB >= userProfile.revisionCycle

            if (needsRevisionA && !needsRevisionB) return -1
            if (!needsRevisionA && needsRevisionB) return 1

            return daysB - daysA
          }
          
          case 'strength': {
            const strengthOrder = { Weak: 0, Medium: 1, Strong: 2 }
            return strengthOrder[juzB.strength] - strengthOrder[juzA.strength]
          }
          
          default: // 'number'
            return a - b
        }
      })
    } else {
      // Get surahs that are in memorized Juz
      return surahs
        .filter(surah => 
          surah.juz.some(juzNum => userProfile.memorizedJuz.includes(juzNum))
        )
        .sort((a, b) => {
          const surahA = userProfile.surahProgress[a.number] || { lastRevised: null, strength: 'Medium' }
          const surahB = userProfile.surahProgress[b.number] || { lastRevised: null, strength: 'Medium' }

          switch (sortBy) {
            case 'lastRevised': {
              if (!surahA.lastRevised && !surahB.lastRevised) return 0
              if (!surahA.lastRevised) return -1
              if (!surahB.lastRevised) return 1

              return new Date(surahB.lastRevised).getTime() - new Date(surahA.lastRevised).getTime()
            }
            
            case 'strength': {
              const strengthOrder = { Weak: 0, Medium: 1, Strong: 2 }
              return strengthOrder[surahB.strength] - strengthOrder[surahA.strength]
            }
            
            default: // 'number'
              return a.number - b.number
          }
        })
    }
  }

  const getRevisionStats = () => {
    if (!userProfile) return { needRevision: 0, relaxed: 0 }
    
    if (viewMode === 'juz') {
      return Object.values(userProfile.juzProgress).reduce(
        (acc, juz) => {
          if (needsRevision(juz)) {
            acc.needRevision++
          } else {
            acc.relaxed++
          }
          return acc
        },
        { needRevision: 0, relaxed: 0 }
      )
    } else {
      const memorizedSurahs = surahs.filter(surah => 
        surah.juz.some(juzNum => userProfile.memorizedJuz.includes(juzNum))
      )

      return memorizedSurahs.reduce(
        (acc, surah) => {
          const progress = userProfile.surahProgress[surah.number] || { lastRevised: null, strength: 'Medium' }
          if (needsRevision(progress)) {
            acc.needRevision++
          } else {
            acc.relaxed++
          }
          return acc
        },
        { needRevision: 0, relaxed: 0 }
      )
    }
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-text">Loading...</div>
      </div>
    )
  }

  const stats = getRevisionStats()
  const items = getSortedItems()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Summary Header */}
        <div className="bg-surface rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-text mb-4">
            Welcome back, {user?.displayName}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-background/20 rounded-lg p-4">
              <h3 className="text-green-400 text-lg font-semibold">Relax</h3>
              <p className="text-2xl font-bold text-text">{stats.relaxed} {viewMode === 'juz' ? 'Juz' : 'Surahs'}</p>
            </div>
            <div className="bg-background/20 rounded-lg p-4">
              <h3 className="text-red-400 text-lg font-semibold">Need Revision</h3>
              <p className="text-2xl font-bold text-text">{stats.needRevision} {viewMode === 'juz' ? 'Juz' : 'Surahs'}</p>
            </div>
            <div className="bg-background/20 rounded-lg p-4">
              <h3 className="text-blue-400 text-lg font-semibold">Total Progress</h3>
              <p className="text-2xl font-bold text-text">
                {userProfile.memorizedJuz.length}/30 Juz
              </p>
            </div>
          </div>

          <p className="text-text-secondary text-center italic">{quote}</p>
        </div>

        {/* View and Sort Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode('juz')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'juz'
                  ? 'bg-primary text-white'
                  : 'bg-background text-text-secondary hover:bg-surface'
              }`}
            >
              <LayoutGrid size={18} />
              Juz View
            </button>
            <button
              onClick={() => setViewMode('surah')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'surah'
                  ? 'bg-primary text-white'
                  : 'bg-background text-text-secondary hover:bg-surface'
              }`}
            >
              <LayoutGrid size={18} />
              Surah View
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-surface text-text px-4 py-2 rounded-md border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="number">Sort by {viewMode === 'juz' ? 'Juz' : 'Surah'} Number</option>
            <option value="lastRevised">Sort by Last Revised</option>
            <option value="strength">Sort by Strength</option>
          </select>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {viewMode === 'juz' ? (
            (items as number[]).map((juzNum) => (
              <JuzCard
                key={juzNum}
                juzNumber={juzNum}
                lastRevised={userProfile.juzProgress[juzNum.toString()]?.lastRevised || null}
                strength={userProfile.juzProgress[juzNum.toString()]?.strength || 'Medium'}
                revisionCycle={userProfile.revisionCycle}
                onStrengthChange={(newStrength) => handleJuzStrengthChange(juzNum, newStrength)}
                onRevisionUpdate={handleJuzRevisionUpdate}
              />
            ))
          ) : (
            (items as typeof surahs).map((surah) => (
              <SurahCard
                key={surah.number}
                surahNumber={surah.number}
                surahName={surah.name}
                juzNumber={surah.juz[0]}
                lastRevised={userProfile.surahProgress[surah.number.toString()]?.lastRevised || null}
                strength={userProfile.surahProgress[surah.number.toString()]?.strength || 'Medium'}
                revisionCycle={userProfile.revisionCycle}
                onStrengthChange={(newStrength) => handleSurahStrengthChange(surah.number, newStrength)}
                onRevisionUpdate={handleSurahRevisionUpdate}
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
} 