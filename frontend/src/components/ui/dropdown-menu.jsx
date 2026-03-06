// frontend/src/components/ui/dropdown-menu.jsx
import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "../../lib/utils/utils.js"

/* ------------------------ Core Components ------------------------ */
const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuGroup = DropdownMenuPrimitive.Group
const DropdownMenuPortal = DropdownMenuPrimitive.Portal
const DropdownMenuSub = DropdownMenuPrimitive.Sub
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

/* ------------------------ Sub Trigger ------------------------ */
const DropdownMenuSubTrigger = React.forwardRef(
  ({ className, inset, children, ...props }, ref) => (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        "flex items-center w-full rounded-lg px-3 py-2 text-sm outline-none",
        "transition-colors duration-200",
        "hover:bg-accent hover:text-accent-foreground",
        "data-[state=open]:bg-accent",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
    </DropdownMenuPrimitive.SubTrigger>
  )
)
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger"

/* ------------------------ Sub Content ------------------------ */
const DropdownMenuSubContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        "z-50 min-w-[9rem] overflow-hidden rounded-xl border border-border/60",
        "bg-popover p-1 text-popover-foreground shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    />
  )
)
DropdownMenuSubContent.displayName = "DropdownMenuSubContent"

/* ------------------------ Content ------------------------ */
const DropdownMenuContent = React.forwardRef(
  ({ className, sideOffset = 6, ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[9rem] overflow-hidden rounded-xl border border-border/60",
          "bg-popover p-1 text-popover-foreground shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "sm:min-w-[12rem]", // mobile-friendly wider tap area
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
)
DropdownMenuContent.displayName = "DropdownMenuContent"

/* ------------------------ Menu Items ------------------------ */
const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-lg px-3 py-2 text-sm",
      "transition-colors duration-200",
      "hover:bg-accent hover:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = "DropdownMenuItem"

/* ------------------------ Checkbox Item ------------------------ */
const DropdownMenuCheckboxItem = React.forwardRef(
  ({ className, checked, children, ...props }, ref) => (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-lg px-3 py-2 text-sm",
        "transition-colors duration-200",
        "hover:bg-accent hover:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
)
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

/* ------------------------ Radio Item ------------------------ */
const DropdownMenuRadioItem = React.forwardRef(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-lg px-3 py-2 text-sm",
      "transition-colors duration-200",
      "hover:bg-accent hover:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2.5 w-2.5 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {props.children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

/* ------------------------ Label & Separator ------------------------ */
const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("my-1 h-px bg-border/60", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

/* ------------------------ Shortcut ------------------------ */
const DropdownMenuShortcut = ({ className, ...props }) => (
  <span
    className={cn(
      "ml-auto text-xs tracking-wide text-muted-foreground",
      className
    )}
    {...props}
  />
)
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

/* ------------------------ Export ------------------------ */
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}