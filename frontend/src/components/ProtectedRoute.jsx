import React from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/auth/AuthContext"
import { Lock } from "lucide-react"

export function ProtectedRoute({ children, roles = [], fallback, onRequireAuth }) {
  const { user, booting } = useAuth()

  if (booting) {
    return (
      <div className="flex-1 flex items-center justify-center gap-3 text-muted-foreground">
        <span className="h-5 w-5 rounded-full border-2 border-border border-t-primary animate-spin" />
        <span className="text-sm">Checking session...</span>
      </div>
    )
  }

  if (!user) {
    return fallback || (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-12">
        <div className="h-12 w-12 rounded-xl bg-muted border border-border flex items-center justify-center">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-base font-medium">Sign in required</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Your saved requests and admin tools are tied to your account.
          </p>
        </div>
        {onRequireAuth && <Button size="sm" onClick={onRequireAuth}>Sign in</Button>}
      </div>
    )
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-12">
        <div className="h-12 w-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <Lock className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h3 className="text-base font-medium">Admin access only</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            This area is only available to admin users.
          </p>
        </div>
      </div>
    )
  }

  return children
}
