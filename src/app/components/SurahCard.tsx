'use client'

import { useState, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/app/lib/firebase/firebase'
import { useAuthContext } from '@/app/lib/contexts/AuthContext'

interface SurahProgress {
  lastRevised: string | null
  strength: 'Weak' | 'Medium' | 'Strong'
}

interface SurahCardProps {
  surahNumber: number
  surahName: string
  juzNumber: number
  lastRevised: string | null
  strength: 'Weak' | 'Medium' | 'Strong'
  revisionCycle: number
  onStrengthChange: (newStrength: 'Weak' | 'Medium' | 'Strong') => void
  onRevisionUpdate: (surahNumber: number, date: string) => void
}

export default function SurahCard({ 
  surahNumber,
  surahName,
  juzNumber,
  lastRevised, 
  strength,
  revisionCycle,
  onStrengthChange,
  onRevisionUpdate
}: SurahCardProps) {
  const [daysSinceRevision, setDaysSinceRevision] = useState<number | null>(null)
  const { user } = useAuthContext()
  const [isUpdating, setIsUpdating] = useState(false)

  const strengthColors = {
    Weak: 'text-red-500',
    Medium: 'text-yellow-500',
    Strong: 'text-green-500'
  }

  const strengthIcons = {
    Weak: '●○○',
    Medium: '●●○',
    Strong: '●●●'
  }

  const nextStrength: { [key: string]: 'Weak' | 'Medium' | 'Strong' } = {
    Weak: 'Medium',
    Medium: 'Strong',
    Strong: 'Weak'
  }

  useEffect(() => {
    if (lastRevised) {
      const lastDate = new Date(lastRevised)
      const today = new Date()
      
      lastDate.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)
      
      if (lastDate.getTime() === today.getTime()) {
        setDaysSinceRevision(0)
      } else {
        const diffTime = Math.abs(today.getTime() - lastDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        setDaysSinceRevision(diffDays)
      }
    } else {
      setDaysSinceRevision(null)
    }
  }, [lastRevised])

  const needsRevision = () => {
    if (!lastRevised) return true
    return daysSinceRevision !== null && daysSinceRevision >= revisionCycle
  }

  const getRevisionStatus = () => {
    if (!lastRevised) return 'Not Started'
    return needsRevision() ? 'Revise Now' : 'Relax'
  }

  const handleRevisionUpdate = async () => {
    if (!user) return
    setIsUpdating(true)
    const today = new Date().toISOString()

    try {
      await updateDoc(doc(db, 'userProfiles', user.uid), {
        [`surahProgress.${surahNumber}.lastRevised`]: today
      })
      onRevisionUpdate(surahNumber, today)
    } catch (error) {
      console.error('Error updating revision:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStrengthClick = () => {
    onStrengthChange(nextStrength[strength])
  }

  const getProgressPercentage = () => {
    if (!lastRevised || daysSinceRevision === null) return 0
    const progress = Math.max(0, 100 - (daysSinceRevision / revisionCycle * 100))
    return Math.round(progress)
  }

  const getCardColor = () => {
    if (!lastRevised) return 'bg-red-900'
    if (daysSinceRevision === null) return 'bg-red-900'
    
    const progress = getProgressPercentage()
    
    if (progress <= 0) return 'bg-red-900'
    if (progress <= 25) return 'bg-red-800'
    if (progress <= 50) return 'bg-yellow-800'
    if (progress <= 75) return 'bg-green-800'
    return 'bg-green-700'
  }

  return (
    <div className={`rounded-lg p-6 text-white ${getCardColor()} transition-colors duration-300 relative`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{surahName}</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white text-opacity-60">Surah {surahNumber}</span>
              <span className="text-white text-opacity-60">•</span>
              <span className="text-white text-opacity-60">Juz {juzNumber}</span>
            </div>
          </div>
          <div className="text-sm font-medium text-white">
            {getProgressPercentage()}%
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStrengthClick}
            className="bg-black bg-opacity-20 px-3 py-1.5 rounded-md flex items-center gap-2 text-sm hover:bg-opacity-30 transition-colors"
          >
            <span className={strengthColors[strength]}>
              {strengthIcons[strength]}
            </span>
            <span className={strengthColors[strength]}>
              {strength}
            </span>
          </button>

          <button
            onClick={handleRevisionUpdate}
            disabled={isUpdating}
            className="flex-1 py-1.5 px-3 rounded-md transition-colors text-sm font-medium bg-black bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Updating...' : 'Mark as Revised'}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm text-white text-opacity-60">
          <span>
            {lastRevised 
              ? daysSinceRevision === 0 
                ? 'Revised today'
                : `${daysSinceRevision} days ago`
              : 'Not started'}
          </span>
          <span className={needsRevision() ? 'text-red-300' : 'text-green-300'}>
            {getRevisionStatus()}
          </span>
        </div>
      </div>
    </div>
  )
} 