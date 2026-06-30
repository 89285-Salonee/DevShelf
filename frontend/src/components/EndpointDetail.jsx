import React, { useState } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { sendProxyRequest } from "@/api"
import { cn } from "@/lib/utils"
import {
  Send, FileText, Zap, Copy, Check,
  Clock, Globe, AlignLeft, Braces, Link2,
} from "lucide-react"

const METHOD_CLASS = {
  GET: "method-get", POST: "method-post", PUT: "method-put",
  PATCH: "method-patch", DELETE: "method-delete", HEAD: "method-head",
}

function getStatusClass(status) {
  if (!status) return ""
  if (status >= 200 && status < 300) return "status-2xx"
  if (status >= 300 && status < 400) return "status-3xx"
  if (status >= 400 && status < 500) return "status-4xx"
  return "status-5xx"
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }}
    >
      {copied
        ? <Check className="h-3.5 w-3.5 text-emerald-400" />
        : <Copy className="h-3.5 w-3.5" />}
    </Button>
  )
}

function KeyValueTable({ data, label }) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-xs text-muted-foreground italic py-2">No {label} defined</p>
  }

  return (
    <div className="rounded-md border border-border overflow-hidden text-xs">
      <table className="w-full">
        <tbody>
          {Object.entries(data).map(([k, v], i) => (
            <tr key={k} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
              <td className="px-3 py-2 font-mono text-primary w-2/5 border-r border-border">{k}</td>
              <td className="px-3 py-2 font-mono text-muted-foreground break-all">{String(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function EndpointDetail({ endpoint, collection, onEdit, canEdit = true, canTest = true, onRequireAuth }) {
  const [url, setUrl] = useState("")
  const [headers, setHeaders] = useState("")
  const [body, setBody] = useState("")
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [proxyError, setProxyError] = useState("")

  React.useEffect(() => {
    if (endpoint) {
      setUrl(endpoint.url || "")
      setHeaders(
        endpoint.headers && Object.keys(endpoint.headers).length
          ? JSON.stringify(endpoint.headers, null, 2)
          : ""
      )
      setBody(endpoint.body || "")
      setResponse(null)
      setProxyError("")
    }
  }, [endpoint?._id])

  const handleSend = async () => {
    if (!canTest) {
      onRequireAuth?.()
      return
    }

    setLoading(true)
    setProxyError("")
    setResponse(null)

    let parsedHeaders = {}
    try {
      if (headers.trim()) parsedHeaders = JSON.parse(headers)
    } catch {
      setProxyError("Invalid JSON in headers")
      setLoading(false)
      return
    }

    try {
      const result = await sendProxyRequest({
        url, method: endpoint.method,
        headers: parsedHeaders,
        body: body || undefined,
      })
      setResponse(result)
    } catch (err) {
      setProxyError(err.response?.data?.error || err.message || "Request failed")
    } finally {
      setLoading(false)
    }
  }

  if (!endpoint) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-12">
        <div className="h-16 w-16 rounded-2xl bg-muted border border-border flex items-center justify-center">
          <Globe className="h-7 w-7 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-base font-medium">Select an endpoint</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Pick an endpoint from the sidebar to view docs and run requests.
          </p>
        </div>
      </div>
    )
  }

  const headersObj = endpoint.headers || {}
  const responseBody = response?.data != null
    ? (typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2))
    : null

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
      <div className="flex items-start gap-4 px-6 py-4 border-b border-border bg-card/50">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {collection && (
              <>
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: collection.color || "#6366f1" }} />
                <span className="text-xs text-muted-foreground">{collection.name}</span>
                <span className="text-muted-foreground text-xs">/</span>
              </>
            )}
            <h2 className="text-sm font-semibold truncate">{endpoint.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-sm font-mono font-bold border shrink-0", METHOD_CLASS[endpoint.method])}>
              {endpoint.method}
            </span>
            <span className="text-xs font-mono text-muted-foreground truncate">{endpoint.url}</span>
            <CopyButton text={endpoint.url} />
          </div>
        </div>
        {canEdit && (
          <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5 shrink-0">
            <FileText className="h-3.5 w-3.5" /> Edit
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="docs" className="flex flex-col h-full">
          <div className="px-6 pt-4">
            <TabsList>
              <TabsTrigger value="docs" className="gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" /> Documentation
              </TabsTrigger>
              <TabsTrigger value="playground" className="gap-1.5 text-xs">
                <Zap className="h-3.5 w-3.5" /> Playground
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="docs" className="px-6 pb-8 space-y-6">
            <section>
              <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                <AlignLeft className="h-3.5 w-3.5" /> Description
              </p>
              {endpoint.notes
                ? <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{endpoint.notes}</p>
                : <p className="text-sm text-muted-foreground italic">No notes added for this endpoint.</p>}
            </section>

            <Separator />

            <section>
              <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                <Link2 className="h-3.5 w-3.5" /> Request Details
              </p>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">URL</Label>
                  <div className="flex items-center gap-2 font-mono text-xs bg-background border border-border rounded-md px-3 py-2">
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-sm font-bold border shrink-0", METHOD_CLASS[endpoint.method])}>
                      {endpoint.method}
                    </span>
                    <span className="text-muted-foreground truncate flex-1">{endpoint.url}</span>
                    <CopyButton text={endpoint.url} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Headers</Label>
                  <KeyValueTable data={headersObj} label="headers" />
                </div>

                {endpoint.body && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Request Body</Label>
                    <div className="relative">
                      <pre className="code-block">{endpoint.body}</pre>
                      <div className="absolute top-2 right-2">
                        <CopyButton text={endpoint.body} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="playground" className="px-6 pb-8 space-y-4">
            {!canTest ? (
              <div className="rounded-lg border border-border bg-card p-5 max-w-md">
                <h3 className="text-sm font-medium">Sign in to run requests</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Public documentation stays visible, while API testing is tied to your account.
                </p>
                <Button size="sm" className="mt-4" onClick={onRequireAuth}>Sign in</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>URL</Label>
                  <div className="flex gap-2">
                    <span className={cn("h-10 px-3 flex items-center text-[10px] rounded-md font-mono font-bold border shrink-0", METHOD_CLASS[endpoint.method])}>
                      {endpoint.method}
                    </span>
                    <Input
                      className="font-mono text-xs flex-1"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Headers (JSON)</Label>
                  <Textarea
                    className="font-mono text-xs resize-none"
                    rows={3}
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    placeholder={'{\n  "Authorization": "Bearer ..."\n}'}
                  />
                </div>

                {!["GET", "HEAD", "OPTIONS"].includes(endpoint.method) && (
                  <div className="space-y-1.5">
                    <Label>Request Body</Label>
                    <Textarea
                      className="font-mono text-xs resize-none"
                      rows={4}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="JSON body..."
                    />
                  </div>
                )}

                <Button onClick={handleSend} disabled={loading} className="gap-2">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send Request
                    </>
                  )}
                </Button>
              </div>
            )}

            {proxyError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {proxyError}
              </div>
            )}

            {response && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-muted-foreground">Response</span>
                  <Badge className={cn("font-mono text-xs rounded-full", getStatusClass(response.status))}>
                    {response.status} {response.statusText}
                  </Badge>
                  {response.elapsed != null && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                      <Clock className="h-3 w-3" /> {response.elapsed}ms
                    </span>
                  )}
                </div>

                {response.headers && (
                  <details>
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground mb-2 flex items-center gap-1 list-none select-none">
                      <Braces className="h-3 w-3" /> Response Headers
                    </summary>
                    <KeyValueTable data={response.headers} label="response headers" />
                  </details>
                )}

                {responseBody != null && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Response Body</Label>
                      <CopyButton text={responseBody} />
                    </div>
                    <pre className="code-block">{responseBody}</pre>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
