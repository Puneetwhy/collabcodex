// frontend/src/components/ui/scroll-area.jsx
import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "../../lib/utils/utils.js"

/* -------------------------------------------------------------------------- */
/*                                   Root                                     */
/* -------------------------------------------------------------------------- */

const ScrollArea = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <ScrollAreaPrimitive.Root
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Viewport */}
        <ScrollAreaPrimitive.Viewport
          className="h-full w-full rounded-[inherit]"
        >
          {children}
        </ScrollAreaPrimitive.Viewport>

        {/* Scrollbars */}
        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />

        {/* Corner */}
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    )
  }
)

ScrollArea.displayName = "ScrollArea"


/* -------------------------------------------------------------------------- */
/*                                 Scroll Bar                                 */
/* -------------------------------------------------------------------------- */

const ScrollBar = React.forwardRef(
  ({ className, orientation = "vertical", ...props }, ref) => {
    return (
      <ScrollAreaPrimitive.ScrollAreaScrollbar
        ref={ref}
        orientation={orientation}
        className={cn(
          "flex touch-none select-none transition-colors duration-200",

          orientation === "vertical" &&
            "h-full w-2 border-l border-transparent p-[2px]",

          orientation === "horizontal" &&
            "h-2 border-t border-transparent p-[2px]",

          className
        )}
        {...props}
      >
        <ScrollAreaPrimitive.ScrollAreaThumb
          className={cn(
            "relative flex-1 rounded-full",
            "bg-border/60 hover:bg-border",
            "transition-colors duration-200"
          )}
        />
      </ScrollAreaPrimitive.ScrollAreaScrollbar>
    )
  }
)

ScrollBar.displayName = "ScrollBar"


/* -------------------------------------------------------------------------- */

export { ScrollArea, ScrollBar }