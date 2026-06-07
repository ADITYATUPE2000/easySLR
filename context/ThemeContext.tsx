"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"

type ThemeContextType = {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
})

export function useThemeMode() {
  return useContext(ThemeContext)
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("theme")
    if (saved === "dark") setIsDark(true)
  }, [])

  function toggleTheme() {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem("theme", next ? "dark" : "light")
      return next
    })
  }

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  const theme = createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: { main: isDark ? "#818cf8" : "#4f46e5" },
      background: {
        default: isDark ? "#090d16" : "#f8fafc",
        paper:   isDark ? "#0f172a" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f8fafc" : "#0f172a",
        secondary: isDark ? "#94a3b8" : "#64748b",
      },
      divider: isDark ? "#1e293b" : "#e2e8f0",
    },
    shape: { borderRadius: 8 },
    typography: { fontFamily: "inherit" },
  })

  if (!mounted) return null

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}