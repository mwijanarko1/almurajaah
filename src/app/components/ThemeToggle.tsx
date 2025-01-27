'use client'

import { useTheme } from '@/app/lib/contexts/ThemeContext'
import { Sun, Moon, Monitor } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-2 bg-black bg-opacity-20 rounded-md p-1">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'light'
            ? 'bg-[#2ECC71] text-white'
            : 'text-gray-400 hover:text-white'
        }`}
        title="Light Mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'dark'
            ? 'bg-[#2ECC71] text-white'
            : 'text-gray-400 hover:text-white'
        }`}
        title="Dark Mode"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'system'
            ? 'bg-[#2ECC71] text-white'
            : 'text-gray-400 hover:text-white'
        }`}
        title="System Theme"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  )
} 