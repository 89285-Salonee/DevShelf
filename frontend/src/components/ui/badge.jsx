import React from "react"
import { cn } from "@/lib/utils"

const variants = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  destructive: "border-transparent bg-destructive text-destructive-foreground",
  outline: "text-foreground",
}

export function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
