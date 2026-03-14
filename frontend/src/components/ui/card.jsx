// frontend/src/components/ui/card.jsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group relative rounded-2xl border border-neutral-200",
      "bg-white cursor-pointer",
      "shadow-md transition-all duration-300 ease-out",
      "hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]",
      "active:-translate-y-1 active:shadow-[0_20px_40px_rgba(0,0,0,0.12)]",
      className
    )}
    {...props}
  >
    {/* Glow behind card */}
    <div
      className="
        absolute inset-0 -z-10 rounded-2xl blur-2xl opacity-0
        transition duration-300
        group-hover:opacity-100
        group-active:opacity-100
        bg-gradient-to-r from-red-400/30 via-yellow-400/30 to-pink-400/30
      "
    />
    {props.children}
  </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 pb-3", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold tracking-tight text-neutral-900",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-neutral-600 leading-relaxed",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 pb-6 text-neutral-700", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between px-6 pb-6 pt-2", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
}