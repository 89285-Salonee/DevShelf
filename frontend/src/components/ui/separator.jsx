import React from "react"
import { cn } from "@/lib/utils"

export function Separator({ className, orientation = "horizontal", ...props }) {
  return (
    <div
      role="separator"
      className={cn(
        orientation === "vertical" ? "h-full w-px" : "h-px w-full",
        "bg-border",
        className
      )}
      {...props}
    />
  )
}
