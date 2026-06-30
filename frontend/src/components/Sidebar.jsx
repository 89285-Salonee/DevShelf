import React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BookMarked, Plus, Trash2, Pencil, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteCollection, deleteEndpoint } from "@/api"

const METHOD_CLASS = {
  GET: "method-get", POST: "method-post", PUT: "method-put",
  PATCH: "method-patch", DELETE: "method-delete", HEAD: "method-head",
}

function sameOwner(item, user) {
  if (!item?.createdBy || !user) return false
  const ownerId = typeof item.createdBy === "object" ? item.createdBy._id : item.createdBy
  return ownerId === user._id || ownerId === user.id
}

export function Sidebar({
  collections, endpointsByCollection, selectedEndpoint,
  onSelectEndpoint, onAddCollection, onEditCollection,
  onAddEndpoint, onEditEndpoint, onRefresh,
  canManage = false, isAdmin = false, currentUser = null, onRequireAuth,
}) {
  const handleDeleteCollection = async (col) => {
    if (!canManage) { onRequireAuth?.(); return }
    if (!confirm(`Delete "${col.name}" and all its endpoints?`)) return
    await deleteCollection(col._id)
    onRefresh()
  }

  const handleDeleteEndpoint = async (ep) => {
    if (!canManage) { onRequireAuth?.(); return }
    if (!confirm(`Delete endpoint "${ep.name}"?`)) return
    await deleteEndpoint(ep._id)
    onRefresh()
  }

  return (
    <aside className="w-64 shrink-0 bg-card border-r border-border flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border">
        <div className="h-7 w-7 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
          <BookMarked className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="font-semibold text-sm tracking-tight">DevShelf</span>
        <Badge variant="secondary" className="ml-auto text-[10px] py-0 px-1.5">beta</Badge>
      </div>

      {/* Collections */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center px-4">
            <div className="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs font-medium">No collections yet</p>
            <Button size="sm" variant="outline" onClick={onAddCollection} className="text-xs gap-1">
              <Plus className="h-3 w-3" /> {canManage ? "New Collection" : "Sign in"}
            </Button>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-0.5">
            {collections.map((col) => {
              const endpoints = endpointsByCollection[col._id] || []
              const canManageCollection = canManage && (isAdmin || sameOwner(col, currentUser))
              return (
                <AccordionItem key={col._id} value={col._id} className="border-0">
                  <div className="group flex items-center rounded-md hover:bg-muted/50 transition-colors">
                    <AccordionTrigger className="flex-1 py-2 px-2 text-xs font-medium hover:no-underline text-muted-foreground hover:text-foreground">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: col.color || "#6366f1" }} />
                        <span className="truncate">{col.name}</span>
                        {isAdmin && col.isAdminOnly && <Badge variant="outline" className="text-[9px] px-1">admin</Badge>}
                        {isAdmin && col.scope === "personal" && <Badge variant="secondary" className="text-[9px] px-1">personal</Badge>}
                        <span className="text-[10px] text-muted-foreground ml-auto mr-1">{endpoints.length}</span>
                      </div>
                    </AccordionTrigger>

                    {canManageCollection && (
                      <div className="flex items-center gap-0.5 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAddEndpoint(col)} title="Add endpoint">
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEditCollection(col)} title="Edit">
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={() => handleDeleteCollection(col)} title="Delete">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <AccordionContent className="pb-1 pt-0">
                    {endpoints.length === 0 ? (
                      canManageCollection ? (
                      <button
                        onClick={() => onAddEndpoint(col)}
                        className="w-full text-left text-xs text-muted-foreground px-6 py-2 hover:text-foreground transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="h-3 w-3" /> Add endpoint
                      </button>
                      ) : (
                        <p className="px-6 py-2 text-xs text-muted-foreground">No endpoints</p>
                      )
                    ) : (
                      <div className="space-y-0.5">
                        {endpoints.map((ep) => (
                          <div key={ep._id} className="group/ep flex items-center">
                            <button
                              onClick={() => onSelectEndpoint(ep)}
                              className={cn(
                                "flex-1 flex items-center gap-2 px-3 pl-6 py-1.5 rounded-md text-left transition-all text-xs",
                                selectedEndpoint?._id === ep._id
                                  ? "bg-primary/10 text-foreground"
                                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                              )}
                            >
                              <span className={cn("text-[9px] px-1.5 py-0.5 rounded-sm font-mono font-bold shrink-0 border", METHOD_CLASS[ep.method])}>
                                {ep.method}
                              </span>
                              <span className="truncate">{ep.name}</span>
                              {isAdmin && ep.isAdminOnly && <Badge variant="outline" className="text-[9px] px-1">admin</Badge>}
                            </button>

                            {(canManageCollection || (canManage && sameOwner(ep, currentUser))) && (
                              <div className="flex items-center gap-0.5 pr-1 opacity-0 group-hover/ep:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onEditEndpoint(ep)}>
                                  <Pencil className="h-2.5 w-2.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-5 w-5 hover:text-destructive" onClick={() => handleDeleteEndpoint(ep)}>
                                  <Trash2 className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </div>

      <Separator />
      <div className="p-3">
        <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs" onClick={onAddCollection}>
          <Plus className="h-3.5 w-3.5" /> {canManage ? "New Collection" : "Sign in to save"}
        </Button>
      </div>
    </aside>
  )
}
