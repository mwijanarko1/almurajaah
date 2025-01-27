'use client'

import { useState } from 'react'
import { useAuthContext } from '@/app/lib/contexts/AuthContext'
import LoginForm from '@/app/components/auth/LoginForm'
import QuranProgress from '@/app/components/quran/QuranProgress'
import RevisionHistory from '@/app/components/quran/RevisionHistory'
import RevisionSchedule from '@/app/components/quran/RevisionSchedule'

export default function Dashboard() {
  const { user } = useAuthContext()
  const [activeTab, setActiveTab] = useState('progress')

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <LoginForm />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.email}</h1>
        <p className="text-gray-600 mt-2">Track and manage your Quran revision journey</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('progress')}
            className={`pb-4 px-1 ${
              activeTab === 'progress'
                ? 'border-b-2 border-emerald-500 text-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Progress
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-4 px-1 ${
              activeTab === 'history'
                ? 'border-b-2 border-emerald-500 text-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-4 px-1 ${
              activeTab === 'schedule'
                ? 'border-b-2 border-emerald-500 text-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Schedule
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'progress' && <QuranProgress />}
        {activeTab === 'history' && <RevisionHistory />}
        {activeTab === 'schedule' && <RevisionSchedule />}
      </div>
    </div>
  )
} 