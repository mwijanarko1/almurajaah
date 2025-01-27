'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/app/lib/contexts/AuthContext'
import { db } from '@/app/lib/firebase/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

interface ScheduleSettings {
  daysPerJuz: number
  notificationsEnabled: boolean
  preferredTime: string
  activeJuz: number[]
}

export default function RevisionSchedule() {
  const { user } = useAuthContext()
  const [settings, setSettings] = useState<ScheduleSettings>({
    daysPerJuz: 7,
    notificationsEnabled: true,
    preferredTime: '09:00',
    activeJuz: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return

      const docRef = doc(db, 'revisionSettings', user.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        setSettings(docSnap.data() as ScheduleSettings)
      } else {
        // Initialize with default settings
        await setDoc(docRef, {
          daysPerJuz: 7,
          notificationsEnabled: true,
          preferredTime: '09:00',
          activeJuz: [],
        })
      }
      setLoading(false)
    }

    fetchSettings()
  }, [user])

  const updateSettings = async (updates: Partial<ScheduleSettings>) => {
    if (!user) return

    const newSettings = { ...settings, ...updates }
    const docRef = doc(db, 'revisionSettings', user.uid)
    await setDoc(docRef, newSettings)
    setSettings(newSettings)
  }

  const toggleJuz = (juzNumber: number) => {
    const newActiveJuz = settings.activeJuz.includes(juzNumber)
      ? settings.activeJuz.filter((j) => j !== juzNumber)
      : [...settings.activeJuz, juzNumber]

    updateSettings({ activeJuz: newActiveJuz })
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-6">Revision Schedule Settings</h2>

        <div className="space-y-6">
          {/* Days per Juz Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Days to spend on each Juz
            </label>
            <select
              value={settings.daysPerJuz}
              onChange={(e) => updateSettings({ daysPerJuz: Number(e.target.value) })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
            >
              {[1, 3, 5, 7, 14, 30].map((days) => (
                <option key={days} value={days}>
                  {days} {days === 1 ? 'day' : 'days'}
                </option>
              ))}
            </select>
          </div>

          {/* Notification Settings */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Enable Notifications
              </label>
              <button
                onClick={() =>
                  updateSettings({ notificationsEnabled: !settings.notificationsEnabled })
                }
                className={`${
                  settings.notificationsEnabled
                    ? 'bg-emerald-600'
                    : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    settings.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>

            {settings.notificationsEnabled && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={settings.preferredTime}
                  onChange={(e) => updateSettings({ preferredTime: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
            )}
          </div>

          {/* Active Juz Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Juz to Include in Schedule
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNumber) => (
                <button
                  key={juzNumber}
                  onClick={() => toggleJuz(juzNumber)}
                  className={`p-2 text-sm rounded ${
                    settings.activeJuz.includes(juzNumber)
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  } border`}
                >
                  {juzNumber}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Preview */}
      {settings.activeJuz.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Your Schedule</h3>
          <div className="space-y-2">
            {settings.activeJuz.map((juzNumber, index) => {
              const startDate = new Date()
              startDate.setDate(startDate.getDate() + index * settings.daysPerJuz)
              const endDate = new Date(startDate)
              endDate.setDate(endDate.getDate() + settings.daysPerJuz - 1)

              return (
                <div
                  key={juzNumber}
                  className="flex justify-between items-center py-2 border-b border-gray-100"
                >
                  <div>
                    <span className="font-medium">Juz {juzNumber}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
} 