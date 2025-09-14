"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "./auth-provider"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const success = login(username, password, twoFactorCode)

    if (!success) {
      setError("Invalid credentials. Use username: admin, password: finance123 and 2FA code: 123456")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">💸 Smart Finance AI</CardTitle>
          <CardDescription>Your Companion Guide & Maintenance Bot</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twoFactor">2FA Code</Label>
              <Input
                id="twoFactor"
                type="text"
                placeholder="Enter 6-digit code"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In 🔐"}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
            <p className="font-medium">Demo Credentials:</p>
            <p>Username: admin</p>
            <p>Password: finance123</p>
            <p>2FA Code: 123456</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
