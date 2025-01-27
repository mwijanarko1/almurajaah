import React from 'react'

export default function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-emerald-100 mb-4">
        Welcome to Al Muraja&apos;ah
      </h1>
      <p className="text-2xl text-emerald-200 mb-8 max-w-2xl">
        &ldquo;It is certainly We Who have revealed the Reminder, and it is certainly We Who will preserve it.&rdquo;
        <span className="block mt-2 text-lg text-emerald-300">(Quran 15:9)</span>
      </p>
      
      <div className="mb-8">
        <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-16 h-16 text-emerald-400"
          >
            <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
          </svg>
        </div>
      </div>

      <button
        onClick={onGetStarted}
        className="bg-emerald-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        Bismillah
      </button>
    </div>
  )
} 