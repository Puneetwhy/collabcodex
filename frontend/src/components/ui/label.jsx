import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none tracking-tight text-neutral-800",
  {
    variants: {},
    defaultVariants: {},
  }
)

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      labelVariants(),

      // spacing for form layouts
      "mb-1.5 block",

      // smooth color change
      "transition-colors duration-200",

      // input focus interaction
      "peer-focus:text-indigo-600",

      // disabled state
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-60",

      className
    )}
    {...props}
  />
))

Label.displayName = "Label"

export { Label }