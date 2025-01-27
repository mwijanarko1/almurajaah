'use client'

import { useEffect } from 'react'
import { useTheme } from '@/app/lib/contexts/ThemeContext'

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme } = useTheme()

  useEffect(() => {
    // Apply theme to document
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  return <>{children}</>
} 