import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1B4D3E] flex flex-col items-center justify-center text-center px-4">
      <div className="w-40 h-40 bg-[#1a2e3b] rounded-full flex items-center justify-center mb-16">
        <BookOpen className="w-20 h-20 text-[#98F5C4]" />
      </div>
      
      <div className="max-w-3xl space-y-6">
        <h1 className="text-5xl md:text-7xl font-bold text-[#98F5C4]">
          Welcome to Al Muraja&apos;ah
        </h1>
        <p className="text-2xl md:text-3xl text-[#98F5C4] font-light">
          Preserve the Reminder, One Revision at a Time.
        </p>
      </div>
      
      <Link
        href="/auth"
        className="mt-16 bg-[#2ECC71] text-white px-12 py-4 rounded-full text-xl font-semibold hover:bg-[#27AE60] transition-colors"
      >
        Get Started
      </Link>
    </main>
  )
}
