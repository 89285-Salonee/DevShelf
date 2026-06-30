import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/auth/AuthContext"
import { BookMarked, LogIn, UserPlus, X } from "lucide-react"

const EMPTY_FORM = {
  username: "",
  email: "",
  password: "",
}

export function AuthPanel({ onClose }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState("login")
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isRegister = mode === "register"
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isRegister) {
        await signUp(form)
      } else {
        await signIn({ email: form.email, password: form.password })
      }

      setForm(EMPTY_FORM)
      onClose?.()
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="h-9 w-9 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
            <BookMarked className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">{isRegister ? "Create account" : "Welcome back"}</h2>
            <p className="text-xs text-muted-foreground">DevShelf account access</p>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" className="ml-auto" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {isRegister && (
            <div className="space-y-1.5">
              <Label htmlFor="auth-username">Username</Label>
              <Input
                id="auth-username"
                value={form.username}
                onChange={set("username")}
                placeholder="devshelf-admin"
                autoComplete="username"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="At least 6 characters"
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading ? (
              <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
            ) : isRegister ? (
              <UserPlus className="h-4 w-4" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {isRegister ? "Register" : "Log in"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-xs"
            onClick={() => {
              setMode(isRegister ? "login" : "register")
              setError("")
            }}
          >
            {isRegister ? "Use an existing account" : "Create a new account"}
          </Button>
        </form>
      </div>
    </div>
  )
}
