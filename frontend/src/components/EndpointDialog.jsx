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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createEndpoint, updateEndpoint } from "@/api"
import { cn } from "@/lib/utils"

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]
const METHOD_CLASS = {
  GET: "method-get", POST: "method-post", PUT: "method-put",
  PATCH: "method-patch", DELETE: "method-delete", HEAD: "method-head",
}

function getInitialForm(endpoint) {
  return {
    name: endpoint?.name || "",
    url: endpoint?.url || "",
    method: endpoint?.method || "GET",
    headers: endpoint?.headers ? JSON.stringify(endpoint.headers, null, 2) : "{}",
    body: endpoint?.body || "",
    notes: endpoint?.notes || "",
    scope: endpoint?.scope || "global",
    visibility: endpoint?.visibility || "public",
    isAdminOnly: Boolean(endpoint?.isAdminOnly),
  }
}

export function EndpointDialog({ open, onOpenChange, endpoint, collectionId, onSuccess, isAdmin = false }) {
  const isEdit = Boolean(endpoint)
  const [form, setForm] = useState(getInitialForm(endpoint))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [headerError, setHeaderError] = useState("")

  useEffect(() => {
    setForm(getInitialForm(endpoint))
    setError("")
    setHeaderError("")
  }, [endpoint, open])

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.url.trim()) {
      setError("Name and URL are required")
      return
    }

    let parsedHeaders = {}
    try {
      if (form.headers.trim() && form.headers.trim() !== "{}") parsedHeaders = JSON.parse(form.headers)
      setHeaderError("")
    } catch {
      setHeaderError("Invalid JSON in headers")
      return
    }

    setLoading(true)
    setError("")

    try {
      const payload = {
        ...form,
        headers: parsedHeaders,
        collectionId: collectionId || endpoint?.collectionId,
      }

      if (!isAdmin) {
        payload.scope = "personal"
        payload.visibility = "private"
        payload.isAdminOnly = false
      }

      const result = isEdit ? await updateEndpoint(endpoint._id, payload) : await createEndpoint(payload)
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Endpoint" : "New Endpoint"}</DialogTitle>
          <DialogDescription>Document and configure an API endpoint.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="ep-name">Endpoint Name *</Label>
            <Input id="ep-name" placeholder="e.g. Get User Profile" value={form.name} onChange={set("name")} />
          </div>

          <div className="flex gap-2">
            <div className="w-36 shrink-0 space-y-1.5">
              <Label>Method</Label>
              <Select value={form.method} onValueChange={(value) => setForm((current) => ({ ...current, method: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      <span className={cn("font-mono font-bold text-xs border px-1.5 py-0.5 rounded-sm", METHOD_CLASS[method])}>
                        {method}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-1.5">
              <Label htmlFor="ep-url">URL *</Label>
              <Input id="ep-url" className="font-mono text-xs" placeholder="https://api.example.com/users/:id" value={form.url} onChange={set("url")} />
            </div>
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
            <Label htmlFor="ep-headers">Headers (JSON)</Label>
            <Textarea
              id="ep-headers"
              className="font-mono text-xs resize-none"
              rows={3}
              placeholder={'{\n  "Authorization": "Bearer {{token}}"\n}'}
              value={form.headers}
              onChange={set("headers")}
            />
            {headerError && <p className="text-xs text-destructive">{headerError}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ep-body">Request Body (JSON)</Label>
            <Textarea
              id="ep-body"
              className="font-mono text-xs resize-none"
              rows={4}
              placeholder={'{\n  "key": "value"\n}'}
              value={form.body}
              onChange={set("body")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ep-notes">Notes / Documentation</Label>
            <Textarea
              id="ep-notes"
              className="text-sm resize-none"
              rows={3}
              placeholder="Describe what this endpoint does, auth requirements, or response shape"
              value={form.notes}
              onChange={set("notes")}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <Button size="sm" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Endpoint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
