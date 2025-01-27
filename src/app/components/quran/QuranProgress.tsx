'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/app/lib/contexts/AuthContext'
import { db } from '@/app/lib/firebase/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

interface JuzProgress {
  memorized: boolean
  lastRevised: string | null
  difficultyLevel: 1 | 2 | 3 | null
}

interface QuranData {
  [key: string]: JuzProgress
}

export default function QuranProgress() {
  const { user } = useAuthContext()
  const [quranData, setQuranData] = useState<QuranData>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuranData = async () => {
      if (!user) return

      const docRef = doc(db, 'quranProgress', user.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setQuranData(docSnap.data() as QuranData)
      } else {
        // Initialize empty progress for all 30 juz
        const initialData: QuranData = {}
        for (let i = 1; i <= 30; i++) {
          initialData[i] = {
            memorized: false,
            lastRevised: null,
            difficultyLevel: null,
          }
        }
        await setDoc(docRef, initialData)
        setQuranData(initialData)
      }
      setLoading(false)
    }

    fetchQuranData()
  }, [user])

  const updateJuzProgress = async (juzNumber: string, updates: Partial<JuzProgress>) => {
    if (!user) return

    const newData = {
      ...quranData,
      [juzNumber]: {
        ...quranData[juzNumber],
        ...updates,
        lastRevised: updates.memorized ? new Date().toISOString() : quranData[juzNumber].lastRevised,
      },
    }

    const docRef = doc(db, 'quranProgress', user.uid)
    await setDoc(docRef, newData)
    setQuranData(newData)
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {Object.entries(quranData).map(([juzNumber, juz]) => (
        <div
          key={juzNumber}
          className={`p-4 rounded-lg border ${
            juz.memorized ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold">Juz {juzNumber}</h3>
            <button
              onClick={() => updateJuzProgress(juzNumber, { memorized: !juz.memorized })}
              className={`px-2 py-1 rounded text-sm ${
                juz.memorized
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {juz.memorized ? 'Memorized' : 'Not Memorized'}
            </button>
          </div>

          {juz.memorized && (
            <>
              <div className="mt-2">
                <label className="text-sm text-gray-600 block mb-1">Difficulty:</label>
                <div className="flex space-x-2">
                  {[1, 2, 3].map((level) => (
                    <button
                      key={level}
                      onClick={() =>
                        updateJuzProgress(juzNumber, { difficultyLevel: level as 1 | 2 | 3 })
                      }
                      className={`w-8 h-8 rounded-full ${
                        juz.difficultyLevel === level
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              {juz.lastRevised && (
                <div className="mt-2 text-sm text-gray-500">
                  Last revised: {new Date(juz.lastRevised).toLocaleDateString()}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
} 