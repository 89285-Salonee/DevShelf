import React, { createContext, useContext } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

const DialogContext = createContext(null)

export function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

export function DialogContent({ className, children, ...props }) {
  const context = useContext(DialogContext)

  if (!context?.open || typeof document === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onMouseDown={() => context.onOpenChange?.(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full rounded-lg border border-border bg-card p-6 shadow-xl",
          className
        )}
        onMouseDown={(event) => event.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn("flex flex-col space-y-1.5 text-left", className)} {...props} />
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
}

export function DialogDescription({ className, ...props }) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export function DialogClose({ asChild = false, children }) {
  const context = useContext(DialogContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (event) => {
        children.props.onClick?.(event)
        context?.onOpenChange?.(false)
      },
    })
  }

  return (
    <button type="button" onClick={() => context?.onOpenChange?.(false)}>
      {children || "Close"}
    </button>
  )
}
