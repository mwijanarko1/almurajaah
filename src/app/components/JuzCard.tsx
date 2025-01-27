'use client'

import { useState, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/app/lib/firebase/firebase'
import { useAuthContext } from '@/app/lib/contexts/AuthContext'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface JuzCardProps {
  juzNumber: number
  lastRevised: string | null
  strength: 'Weak' | 'Medium' | 'Strong'
  revisionCycle: number
  onStrengthChange: (newStrength: 'Weak' | 'Medium' | 'Strong') => void
  onRevisionUpdate: (juzNumber: number, date: string) => void
}

export default function JuzCard({ 
  juzNumber, 
  lastRevised, 
  strength,
  revisionCycle,
  onStrengthChange,
  onRevisionUpdate
}: JuzCardProps) {
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
      
      // Reset time parts to compare just the dates
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
    if (!lastRevised) return true // If never revised, needs revision
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
        [`juzProgress.${juzNumber}.lastRevised`]: today
      })
      onRevisionUpdate(juzNumber, today)
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
    if (!lastRevised) return 'bg-red-900' // Not started
    if (daysSinceRevision === null) return 'bg-red-900'
    
    const progress = getProgressPercentage()
    
    if (progress <= 0) return 'bg-red-900' // Overdue
    if (progress <= 25) return 'bg-red-800'
    if (progress <= 50) return 'bg-yellow-800'
    if (progress <= 75) return 'bg-green-800'
    return 'bg-green-700' // Recently revised
  }

  const getProgressRingColor = () => {
    const progress = getProgressPercentage()
    if (progress <= 25) return '#EF4444' // red
    if (progress <= 50) return '#F59E0B' // yellow
    if (progress <= 75) return '#10B981' // green
    return '#059669' // emerald
  }

  return (
    <div className={`rounded-lg p-6 text-white ${getCardColor()} transition-colors duration-300 relative`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12">
              {/* Progress Circle */}
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                {/* Background circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-white/20"
                  strokeWidth="3"
                />
                {/* Progress circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeDasharray={`${getProgressPercentage() * 100.53/100} 100`}
                  className="transition-all duration-300"
                />
              </svg>
              {/* Juz Number */}
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                {juzNumber}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold">Juz {juzNumber}</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className={`${needsRevision() ? 'text-red-300' : 'text-green-300'}`}>
                  {getRevisionStatus()}
                </span>
                <span className="text-white text-opacity-60">•</span>
                <span className="text-white text-opacity-60">
                  {lastRevised 
                    ? daysSinceRevision === 0 
                      ? 'Revised today'
                      : `${daysSinceRevision} days ago`
                    : 'Not started'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-sm font-medium text-white">
            {getProgressPercentage()}%
          </div>
        </div>

        <div className="flex items-center gap-3">
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

        {/* View Details Link */}
        <Link
          href={`/juz/${juzNumber}`}
          className="flex items-center justify-between text-[#2ECC71] hover:text-white transition-colors mt-4 pt-4 border-t border-gray-700"
        >
          <span>View Surahs</span>
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )
} 