// theme toggle button (light / dark) with persisted preference
import React from 'react'
import { useTheme } from '../context/ThemeContext'
import '../styles/global.css'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      className="btn theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  )
}
