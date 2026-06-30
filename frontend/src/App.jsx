import React from "react"
import Dashboard from "./Dashboard"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/auth/AuthContext"

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
      <Toaster />
    </AuthProvider>
  )
}
