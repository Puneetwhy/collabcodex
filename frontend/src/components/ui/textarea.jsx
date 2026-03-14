// frontend/src/components/ui/textarea.jsx
import * as React from "react"
import { cn } from "../../lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex w-full min-h-[90px] rounded-xl",
      "border border-neutral-300 bg-white",
      "px-3 py-2.5 text-sm text-neutral-800",
      "placeholder:text-neutral-400",
      "shadow-sm",
      "resize-none",
      "transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "sm:text-sm text-[13px]",
      className
    )}
    {...props}
  />
))

Textarea.displayName = "Textarea"

export { Textarea }