import React, { createContext, useContext, useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const AccordionContext = createContext(null)
const AccordionItemContext = createContext(null)

export function Accordion({ type = "single", defaultValue, className, children, ...props }) {
  const initial = type === "multiple"
    ? (Array.isArray(defaultValue) ? defaultValue : [])
    : (defaultValue || null)
  const [value, setValue] = useState(initial)

  const isOpen = (itemValue) =>
    type === "multiple" ? value.includes(itemValue) : value === itemValue

  const toggle = (itemValue) => {
    if (type === "multiple") {
      setValue((current) =>
        current.includes(itemValue)
          ? current.filter((entry) => entry !== itemValue)
          : [...current, itemValue]
      )
    } else {
      setValue((current) => (current === itemValue ? null : itemValue))
    }
  }

  return (
    <AccordionContext.Provider value={{ isOpen, toggle }}>
      <div className={cn(className)} {...props}>{children}</div>
    </AccordionContext.Provider>
  )
}

export function AccordionItem({ value, className, children, ...props }) {
  return (
    <AccordionItemContext.Provider value={value}>
      <div className={cn("border-b", className)} {...props}>{children}</div>
    </AccordionItemContext.Provider>
  )
}

export function AccordionTrigger({ className, children, ...props }) {
  const value = useContext(AccordionItemContext)
  const context = useContext(AccordionContext)
  const open = context?.isOpen(value)

  return (
    <button
      type="button"
      className={cn("flex flex-1 items-center justify-between text-left transition-all", className)}
      onClick={() => context?.toggle(value)}
      {...props}
    >
      {children}
      <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")} />
    </button>
  )
}

export function AccordionContent({ className, ...props }) {
  const value = useContext(AccordionItemContext)
  const context = useContext(AccordionContext)
  if (!context?.isOpen(value)) return null

  return <div className={cn("overflow-hidden", className)} {...props} />
}
