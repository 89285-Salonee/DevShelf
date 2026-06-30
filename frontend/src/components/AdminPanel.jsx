import React, { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { deleteUser, getUsers, updateUserRole } from "@/api"
import { useAuth } from "@/auth/AuthContext"
import { RefreshCw, ShieldCheck, Trash2, Users } from "lucide-react"

export function AdminPanel() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      setUsers(await getUsers())
    } catch (err) {
      setError(err.response?.data?.error || "Could not load users")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleRoleChange = async (id, role) => {
    try {
      const updated = await updateUserRole(id, role)
      setUsers((items) => items.map((item) => (item._id === id ? updated : item)))
    } catch (err) {
      setError(err.response?.data?.error || "Could not update role")
    }
  }

  const handleDelete = async (targetUser) => {
    if (!confirm(`Delete ${targetUser.email}?`)) return

    try {
      await deleteUser(targetUser._id)
      setUsers((items) => items.filter((item) => item._id !== targetUser._id))
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete user")
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Admin</h2>
            <p className="text-xs text-muted-foreground">Users and global templates</p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto gap-2" onClick={loadUsers}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>

        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Users</span>
            <Badge variant="secondary" className="ml-auto">{users.length}</Badge>
          </div>

          {error && (
            <div className="m-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-sm text-muted-foreground flex items-center justify-center gap-3">
              <span className="h-5 w-5 rounded-full border-2 border-border border-t-primary animate-spin" />
              Loading users...
            </div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((item) => (
                <div key={item._id} className="grid grid-cols-[1fr_150px_40px] gap-3 items-center px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{item.username}</span>
                      {item._id === user?._id && <Badge variant="outline">you</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{item.email}</p>
                  </div>

                  <Select
                    value={item.role}
                    onValueChange={(value) => handleRoleChange(item._id, value)}
                    disabled={item._id === user?._id}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">user</SelectItem>
                      <SelectItem value="admin">admin</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-destructive"
                    disabled={item._id === user?._id}
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium">Global templates</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Use the sidebar controls to create or edit collections with global scope. Admin-only docs are hidden from standard users.
          </p>
        </div>
      </div>
    </div>
  )
}
