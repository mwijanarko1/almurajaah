'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/app/lib/contexts/AuthContext'
import { Settings, User, LogOut } from 'lucide-react'

export default function Navbar() {
  const { user, signOut } = useAuthContext()
  const pathname = usePathname()

  // Don't show navbar on landing page
  if (pathname === '/') return null

  return (
    <nav className="bg-surface border-b border-primary border-opacity-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home Link */}
          <Link href="/dashboard" className="text-primary text-xl font-bold hover:text-secondary transition-colors">
            Al-Murajaah
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                    pathname === '/profile'
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text hover:bg-background'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">Profile</span>
                </Link>
                <Link
                  href="/settings"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                    pathname === '/settings'
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text hover:bg-background'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-text-secondary hover:text-text hover:bg-background transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 