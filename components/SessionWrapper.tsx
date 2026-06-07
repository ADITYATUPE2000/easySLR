"use client"

import { SessionProvider } from "next-auth/react"
import { AppThemeProvider } from "@/context/ThemeContext"
import ThemeToggle from "@/components/ThemeToggle"

export default function SessionWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <AppThemeProvider>
        {children}
      </AppThemeProvider>
    </SessionProvider>
  )
}