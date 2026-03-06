import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "../../lib/utils/utils.js"

const Avatar = React.forwardRef(({ className, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border bg-background shadow-sm transition-all duration-200 ease-out hover:shadow-md",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn(
      "aspect-square h-full w-full object-cover transition-opacity duration-300",
      "hover:scale-105 hover:duration-300",
      className
    )}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium tracking-tight transition-colors duration-200",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }