import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-neutral-200 bg-white",

        // spacing + text
        "px-4 py-2 text-sm text-neutral-900",

        // placeholder
        "placeholder:text-neutral-400",

        // shadow + smooth animation
        "shadow-sm transition-all duration-200",

        // hover
        "hover:border-neutral-300",

        // focus state
        "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",

        // mobile tap feel
        "active:scale-[0.99]",

        // disabled
        "disabled:cursor-not-allowed disabled:opacity-50",

        // file input styling
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",

        className
      )}
      {...props}
    />
  )
})

Input.displayName = "Input"

export { Input }