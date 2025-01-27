'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/app/lib/contexts/AuthContext'
import { db } from '@/app/lib/firebase/firebase'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'

interface RevisionEntry {
  id: string
  juzNumber: number
  date: string
  notes: string
  quality: 1 | 2 | 3 | 4 | 5
}

export default function RevisionHistory() {
  const { user } = useAuthContext()
  const [history, setHistory] = useState<RevisionEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return

      const historyRef = collection(db, 'revisionHistory')
      const q = query(
        historyRef,
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const entries: RevisionEntry[] = []
      querySnapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() } as RevisionEntry)
      })

      setHistory(entries)
      setLoading(false)
    }

    fetchHistory()
  }, [user])

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  if (history.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No revision history yet. Start revising to see your progress!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((entry) => (
        <div
          key={entry.id}
          className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">Juz {entry.juzNumber}</h3>
              <p className="text-sm text-gray-500">
                {new Date(entry.date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <span
                  key={index}
                  className={`w-4 h-4 rounded-full ${
                    index < entry.quality
                      ? 'bg-emerald-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
          {entry.notes && (
            <p className="mt-2 text-gray-600 text-sm">{entry.notes}</p>
          )}
        </div>
      ))}
    </div>
  )
} 