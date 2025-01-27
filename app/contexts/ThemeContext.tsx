"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import type { Language } from "../translations"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  language: Language
  setLanguage: (lang: Language) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme
    const storedLanguage = localStorage.getItem("language") as Language
    if (storedTheme) setTheme(storedTheme)
    if (storedLanguage) setLanguage(storedLanguage)
  }, [])

  useEffect(() => {
    localStorage.setItem("theme", theme)
    localStorage.setItem("language", language)
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme, language])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme, language, setLanguage }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

