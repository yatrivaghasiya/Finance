"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  name: string
  username: string
  email?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string, twoFactorCode: string) => boolean
  logout: () => void
  user: User | null
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const authStatus = localStorage.getItem("financeAppAuth")
      const userData = localStorage.getItem("financeAppUser")
      if (authStatus === "true" && userData) {
        setIsAuthenticated(true)
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = (username: string, password: string, twoFactorCode: string): boolean => {
    // Simple authentication - in real app, this would be server-side
    if (username === "admin" && password === "finance123" && twoFactorCode === "123456") {
      const userData: User = {
        name: username.charAt(0).toUpperCase() + username.slice(1),
        username: username,
      }
      setIsAuthenticated(true)
      setUser(userData)
      try {
        localStorage.setItem("financeAppAuth", "true")
        localStorage.setItem("financeAppUser", JSON.stringify(userData))
      } catch (error) {
        console.error("Error saving to localStorage:", error)
      }
      return true
    }
    return false
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      try {
        localStorage.setItem("financeAppUser", JSON.stringify(updatedUser))
      } catch (error) {
        console.error("Error updating localStorage:", error)
      }
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    try {
      localStorage.removeItem("financeAppAuth")
      localStorage.removeItem("financeAppUser")
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, updateUser }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
