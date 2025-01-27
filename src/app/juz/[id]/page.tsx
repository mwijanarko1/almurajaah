'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/app/lib/contexts/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/app/lib/firebase/firebase'
import Navbar from '@/app/components/Navbar'
import { juzData } from '@/app/lib/data/quranData'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface JuzProgress {
  lastRevised: string | null
  strength: 'Weak' | 'Medium' | 'Strong'
}

interface Props {
  params: {
    id: string
  }
}

export default function JuzDetailPage({ params }: Props) {
  const { user } = useAuthContext()
  const router = useRouter()
  const [juzProgress, setJuzProgress] = useState<JuzProgress | null>(null)
  const juzNumber = parseInt(params.id)
  const juz = juzData.find(j => j.number === juzNumber)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    const fetchJuzProgress = async () => {
      const userDoc = await getDoc(doc(db, 'userProfiles', user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        if (data.juzProgress && data.juzProgress[juzNumber]) {
          setJuzProgress(data.juzProgress[juzNumber])
        }
      }
    }

    fetchJuzProgress()
  }, [user, router, juzNumber])

  if (!juz) {
    return (
      <div className="min-h-screen bg-[#0A2E1F]">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-white">Juz not found</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A2E1F]">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/dashboard"
              className="text-[#2ECC71] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Juz {juzNumber}</h1>
          </div>

          {/* Progress Info */}
          {juzProgress && (
            <div className="bg-[#0F3528] rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Progress</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-300">Last Revised</p>
                  <p className="text-white text-lg">
                    {juzProgress.lastRevised
                      ? new Date(juzProgress.lastRevised).toLocaleDateString()
                      : 'Not yet revised'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-300">Strength</p>
                  <p className="text-white text-lg">{juzProgress.strength}</p>
                </div>
              </div>
            </div>
          )}

          {/* Surahs List */}
          <div className="bg-[#0F3528] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Surahs in this Juz</h2>
            <div className="space-y-4">
              {juz.surahs.map((surah) => (
                <div
                  key={`${surah.number}-${surah.verses || 'full'}`}
                  className="bg-black bg-opacity-20 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-[#2ECC71] text-lg font-semibold">
                        {surah.number}. {surah.name}
                      </h3>
                      <p className="text-gray-300">{surah.translatedName}</p>
                      {surah.verses && (
                        <p className="text-gray-400 text-sm mt-1">
                          Verses: {surah.verses}
                        </p>
                      )}
                    </div>
                    <div className="text-2xl font-arabic text-white">
                      {surah.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 