import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { getMe, login, logoutServer, register, setAuthToken, TOKEN_KEY } from "@/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (!token) {
      setUser(null)
      setBooting(false)
      return null
    }

    setAuthToken(token)

    try {
      const result = await getMe()
      setUser(result.user)
      return result.user
    } catch {
      setAuthToken(null)
      setUser(null)
      return null
    } finally {
      setBooting(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const signIn = useCallback(async (payload) => {
    const result = await login(payload)
    setAuthToken(result.token)
    setUser(result.user)
    return result.user
  }, [])

  const signUp = useCallback(async (payload) => {
    const result = await register(payload)
    setAuthToken(result.token)
    setUser(result.user)
    return result.user
  }, [])

  const signOut = useCallback(async () => {
    try {
      await logoutServer()
    } catch {
      // Logging out locally still matters if the backend is offline.
    }

    setAuthToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      booting,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      signIn,
      signUp,
      signOut,
      refreshUser,
    }),
    [booting, refreshUser, signIn, signOut, signUp, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return value
}
