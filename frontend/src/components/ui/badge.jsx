import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils/utils.js"

const badgeVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium tracking-tight transition-all duration-200 ease-out select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:brightness-105",

        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-sm hover:shadow-md hover:brightness-105",

        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:shadow-md hover:brightness-105",

        outline:
          "border-border bg-background text-foreground hover:bg-muted/50 hover:shadow-sm",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

function Badge({ className, variant, size, ...props }) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }