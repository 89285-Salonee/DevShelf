import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createCollection, updateCollection } from "@/api"

const COLORS = ["#6366f1", "#22d3ee", "#34d399", "#f59e0b", "#f87171", "#a78bfa", "#fb923c", "#38bdf8"]

function getInitialForm(collection) {
  return {
    name: collection?.name || "",
    description: collection?.description || "",
    baseUrl: collection?.baseUrl || "",
    color: collection?.color || COLORS[0],
    scope: collection?.scope || "global",
    visibility: collection?.visibility || "public",
    isAdminOnly: Boolean(collection?.isAdminOnly),
  }
}

export function CollectionDialog({ open, onOpenChange, collection, onSuccess, isAdmin = false }) {
  const isEdit = Boolean(collection)
  const [form, setForm] = useState(getInitialForm(collection))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setForm(getInitialForm(collection))
    setError("")
  }, [collection, open])

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Name is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      const payload = isAdmin
        ? form
        : { ...form, scope: "personal", visibility: "private", isAdminOnly: false }
      const result = isEdit ? await updateCollection(collection._id, payload) : await createCollection(payload)
      onSuccess(result, isEdit)
      onOpenChange(false)
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Collection" : "New Collection"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update collection details." : "Group related endpoints together."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="col-name">Collection Name *</Label>
            <Input id="col-name" placeholder="e.g. Auth API" value={form.name} onChange={set("name")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="col-desc">Description</Label>
            <Input id="col-desc" placeholder="What does this collection cover?" value={form.description} onChange={set("description")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="col-url">Base URL</Label>
            <Input id="col-url" className="font-mono text-xs" placeholder="https://api.example.com/v1" value={form.baseUrl} onChange={set("baseUrl")} />
          </div>

          {isAdmin && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Scope</Label>
                <Select value={form.scope} onValueChange={(value) => setForm((current) => ({ ...current, scope: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">global</SelectItem>
                    <SelectItem value="personal">personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Visibility</Label>
                <Select value={form.visibility} onValueChange={(value) => setForm((current) => ({ ...current, visibility: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">public</SelectItem>
                    <SelectItem value="private">private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {isAdmin && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={form.isAdminOnly}
                onChange={(event) => setForm((current) => ({ ...current, isAdminOnly: event.target.checked }))}
                className="h-4 w-4 accent-primary"
              />
              Admin-only documentation
            </label>
          )}

          <div className="space-y-1.5">
            <Label>Colour</Label>
            <div className="flex gap-2 flex-wrap pt-1">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, color }))}
                  className="h-6 w-6 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: color,
                    borderColor: form.color === color ? "#fff" : "transparent",
                    transform: form.color === color ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <Button size="sm" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
