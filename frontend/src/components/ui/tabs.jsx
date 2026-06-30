import React, { createContext, useContext, useState } from "react"
import { cn } from "@/lib/utils"

const TabsContext = createContext(null)

export function Tabs({ defaultValue, value, onValueChange, className, children, ...props }) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const currentValue = value ?? internalValue

  const setValue = (nextValue) => {
    setInternalValue(nextValue)
    onValueChange?.(nextValue)
  }

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue }}>
      <div className={cn(className)} {...props}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }) {
  return (
    <div
      className={cn("inline-flex h-9 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}
      {...props}
    />
  )
}

export function TabsTrigger({ value, className, ...props }) {
  const context = useContext(TabsContext)
  const active = context?.value === value

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        active ? "bg-background text-foreground shadow-sm" : "hover:text-foreground",
        className
      )}
      onClick={() => context?.setValue(value)}
      {...props}
    />
  )
}

export function TabsContent({ value, className, ...props }) {
  const context = useContext(TabsContext)
  if (context?.value !== value) return null

  return (
    <div
      className={cn("mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
      {...props}
    />
  )
}
