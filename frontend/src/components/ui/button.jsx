// frontend/src/components/ui/button.jsx
import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-gray-500 via-cyan-300 to-gray-500 text-black shadow-md " +
          "hover:shadow-xl hover:brightness-110 " +
          "active:shadow-xl active:brightness-110 active:scale-95",

        destructive:
          "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md " +
          "hover:shadow-xl hover:brightness-110 " +
          "active:shadow-xl active:brightness-110 active:scale-95",

        outline:
          "border border-neutral-300 bg-white/60 backdrop-blur-md text-neutral-800 shadow-sm " +
          "hover:bg-neutral-100 hover:shadow-md " +
          "active:bg-neutral-100 active:shadow-md active:scale-95",

        secondary:
          "bg-neutral-900 text-white shadow-md " +
          "hover:bg-neutral-800 hover:shadow-lg " +
          "active:bg-neutral-800 active:shadow-lg active:scale-95",

        ghost:
          "text-neutral-700 hover:bg-neutral-100 " +
          "active:bg-neutral-100 active:scale-95",

        link:
          "text-indigo-600 underline-offset-4 hover:underline hover:text-indigo-500 " +
          "active:text-indigo-500 active:scale-95",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }