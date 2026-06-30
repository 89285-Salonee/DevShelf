import React, { createContext, useContext, useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const SelectContext = createContext(null)

export function Select({ value, onValueChange, disabled = false, children }) {
  const [open, setOpen] = useState(false)

  const choose = (nextValue) => {
    onValueChange?.(nextValue)
    setOpen(false)
  }

  return (
    <SelectContext.Provider value={{ value, choose, open, setOpen, disabled }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ className, children, ...props }) {
  const context = useContext(SelectContext)

  return (
    <button
      type="button"
      disabled={context?.disabled}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => context?.setOpen((current) => !current)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-60" />
    </button>
  )
}

export function SelectValue({ placeholder }) {
  const context = useContext(SelectContext)
  return <span className="truncate">{context?.value || placeholder}</span>
}

export function SelectContent({ className, ...props }) {
  const context = useContext(SelectContext)
  if (!context?.open) return null

  return (
    <div
      className={cn(
        "absolute z-50 mt-1 max-h-64 min-w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-md",
        className
      )}
      {...props}
    />
  )
}

export function SelectItem({ value, className, children, ...props }) {
  const context = useContext(SelectContext)

  return (
    <button
      type="button"
      className={cn(
        "flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        context?.value === value && "bg-accent text-accent-foreground",
        className
      )}
      onClick={() => context?.choose(value)}
      {...props}
    >
      {children}
    </button>
  )
}
