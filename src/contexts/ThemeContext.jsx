import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({ isDark: false, toggle: () => {} })

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('veras_theme') === 'dark')

  useEffect(() => {
    localStorage.setItem('veras_theme', isDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

export function useColors() {
  const { isDark } = useTheme()
  return {
    bg:          isDark ? '#0f172a' : '#f8fafc',
    card:        isDark ? '#1e293b' : '#ffffff',
    cardBorder:  isDark ? '#334155' : '#e2e8f0',
    divider:     isDark ? '#334155' : '#f1f5f9',
    text:        isDark ? '#f1f5f9' : '#0f172a',
    textSec:     isDark ? '#94a3b8' : '#475569',
    accent:      '#7c3aed',
    navBg:       isDark ? '#020617' : '#0f172a',
  }
}
