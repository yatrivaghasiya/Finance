"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 h-9">
        <div className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="w-9 h-9 transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 transition-all duration-200" />
      ) : (
        <Sun className="h-4 w-4 transition-all duration-200" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
