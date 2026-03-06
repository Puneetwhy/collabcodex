import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { cn } from "../../lib/utils/utils.js"

const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      "bg-black/50 backdrop-blur-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
      "duration-300",
      className
    )}
    {...props}
  />
))
AlertDialogOverlay.displayName = "AlertDialogOverlay"

const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />

    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 grid gap-6",

        // mobile
        "bottom-0 left-0 right-0 w-full rounded-t-2xl",

        // desktop
        "sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:right-auto",
        "sm:w-[92%] sm:max-w-md",
        "sm:-translate-x-1/2 sm:-translate-y-1/2",
        "sm:rounded-2xl",

        "border border-neutral-200",
        "bg-white p-6",

        "shadow-xl shadow-black/10",

        "transition-all duration-300 ease-out",

        // animations
        "data-[state=open]:animate-in",
        "data-[state=closed]:animate-out",

        "data-[state=open]:fade-in-0",
        "data-[state=closed]:fade-out-0",

        "data-[state=open]:slide-in-from-bottom",
        "data-[state=closed]:slide-out-to-bottom",

        "sm:data-[state=open]:zoom-in-95",
        "sm:data-[state=closed]:zoom-out-95",

        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = "AlertDialogContent"

const AlertDialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col gap-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)

const AlertDialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      // mobile
      "flex flex-col gap-3",

      // desktop
      "sm:flex-row sm:justify-end",

      className
    )}
    {...props}
  />
)

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold text-neutral-900",
      className
    )}
    {...props}
  />
))
AlertDialogTitle.displayName = "AlertDialogTitle"

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm text-neutral-500 leading-relaxed",
      className
    )}
    {...props}
  />
))
AlertDialogDescription.displayName = "AlertDialogDescription"

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(
      "inline-flex h-11 w-full items-center justify-center",
      "rounded-lg px-5",
      "text-sm font-medium",

      "bg-indigo-600 text-white",

      "transition-all duration-200",
      "hover:bg-indigo-700 hover:shadow-md",

      "sm:w-auto",

      className
    )}
    {...props}
  />
))
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      "inline-flex h-11 w-full items-center justify-center",
      "rounded-lg px-5",

      "border border-neutral-300",
      "bg-white text-neutral-700",

      "text-sm font-medium",

      "transition-all duration-200",
      "hover:bg-neutral-100",

      "sm:w-auto",

      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}