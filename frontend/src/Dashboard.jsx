import React, { useState, useEffect, useCallback } from "react"
import { Sidebar } from "@/components/Sidebar"
import { EndpointDetail } from "@/components/EndpointDetail"
import { CollectionDialog } from "@/components/CollectionDialog"
import { EndpointDialog } from "@/components/EndpointDialog"
import { AuthPanel } from "@/components/AuthPanel"
import { AdminPanel } from "@/components/AdminPanel"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getCollections, getCollectionEndpoints } from "@/api"
import { useAuth } from "@/auth/AuthContext"
import { AlertCircle, LogIn, LogOut, RefreshCw, ShieldCheck } from "lucide-react"

function sameOwner(item, user) {
  if (!item?.createdBy || !user) return false
  const ownerId = typeof item.createdBy === "object" ? item.createdBy._id : item.createdBy
  return ownerId === user._id || ownerId === user.id
}

export default function Dashboard() {
  const { user, isAdmin, signOut } = useAuth()
  const [collections, setCollections] = useState([])
  const [endpointsByCollection, setEndpointsByCollection] = useState({})
  const [selectedEndpoint, setSelectedEndpoint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAuth, setShowAuth] = useState(false)
  const [view, setView] = useState("docs")

  const [collectionDialog, setCollectionDialog] = useState({ open: false, collection: null })
  const [endpointDialog, setEndpointDialog] = useState({ open: false, endpoint: null, collectionId: null })

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const cols = await getCollections()
      setCollections(cols)
      const entries = await Promise.all(
        cols.map(async (col) => [col._id, await getCollectionEndpoints(col._id)])
      )
      setEndpointsByCollection(Object.fromEntries(entries))
    } catch {
      setError("Could not connect to the DevShelf backend. Is the server running on port 5000?")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll, user?._id, user?.role])

  useEffect(() => {
    if (selectedEndpoint) {
      const allEps = Object.values(endpointsByCollection).flat()
      setSelectedEndpoint(allEps.find((e) => e._id === selectedEndpoint._id) || null)
    }
  }, [endpointsByCollection, selectedEndpoint])

  const getCollectionForEndpoint = (ep) =>
    ep ? collections.find((c) => c._id === ep.collectionId) || null : null

  const canManageEndpoint = Boolean(user && selectedEndpoint && (isAdmin || sameOwner(selectedEndpoint, user)))
  const requireAuth = () => setShowAuth(true)

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="h-10 border-b border-border bg-card/60 flex items-center px-4 gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <span className="text-xs text-muted-foreground font-mono ml-1">
          devshelf - api documentation & testing
        </span>

        <div className="ml-auto flex items-center gap-2">
          {isAdmin && (
            <Button
              variant={view === "admin" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setView((current) => (current === "admin" ? "docs" : "admin"))}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </Button>
          )}

          {!loading && view === "docs" && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchAll} title="Refresh">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}

          {user ? (
            <>
              <Badge variant={isAdmin ? "default" : "secondary"} className="hidden sm:inline-flex">
                {user.role}
              </Badge>
              <span className="hidden md:inline text-xs text-muted-foreground max-w-40 truncate">{user.email}</span>
              <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={signOut}>
                <LogOut className="h-3.5 w-3.5" /> Logout
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={requireAuth}>
              <LogIn className="h-3.5 w-3.5" /> Sign in
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collections={collections}
          endpointsByCollection={endpointsByCollection}
          selectedEndpoint={selectedEndpoint}
          onSelectEndpoint={(endpoint) => {
            setView("docs")
            setSelectedEndpoint(endpoint)
          }}
          canManage={Boolean(user)}
          isAdmin={isAdmin}
          currentUser={user}
          onRequireAuth={requireAuth}
          onAddCollection={() => user ? setCollectionDialog({ open: true, collection: null }) : requireAuth()}
          onEditCollection={(col) => user ? setCollectionDialog({ open: true, collection: col }) : requireAuth()}
          onAddEndpoint={(col) => user ? setEndpointDialog({ open: true, endpoint: null, collectionId: col._id }) : requireAuth()}
          onEditEndpoint={(ep) => user ? setEndpointDialog({ open: true, endpoint: ep, collectionId: ep.collectionId }) : requireAuth()}
          onRefresh={fetchAll}
        />

        <main className="flex-1 overflow-hidden flex flex-col">
          {view === "admin" ? (
            <ProtectedRoute roles={["admin"]} onRequireAuth={requireAuth}>
              <AdminPanel />
            </ProtectedRoute>
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center gap-3 text-muted-foreground">
              <span className="h-5 w-5 rounded-full border-2 border-border border-t-primary animate-spin" />
              <span className="text-sm">Loading collections...</span>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-12">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-base font-medium">Connection Error</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchAll} className="gap-2">
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </Button>
            </div>
          ) : (
            <EndpointDetail
              endpoint={selectedEndpoint}
              collection={getCollectionForEndpoint(selectedEndpoint)}
              canEdit={canManageEndpoint}
              canTest={Boolean(user)}
              onRequireAuth={requireAuth}
              onEdit={() => selectedEndpoint && setEndpointDialog({ open: true, endpoint: selectedEndpoint, collectionId: selectedEndpoint.collectionId })}
            />
          )}
        </main>
      </div>

      <CollectionDialog
        open={collectionDialog.open}
        onOpenChange={(v) => setCollectionDialog((d) => ({ ...d, open: v }))}
        collection={collectionDialog.collection}
        isAdmin={isAdmin}
        onSuccess={() => fetchAll()}
      />

      <EndpointDialog
        open={endpointDialog.open}
        onOpenChange={(v) => setEndpointDialog((d) => ({ ...d, open: v }))}
        endpoint={endpointDialog.endpoint}
        collectionId={endpointDialog.collectionId}
        isAdmin={isAdmin}
        onSuccess={(result, isEdit) => {
          fetchAll()
          if (!isEdit) setSelectedEndpoint(result)
        }}
      />

      {showAuth && <AuthPanel onClose={() => setShowAuth(false)} />}
    </div>
  )
}
