import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef(
({ className, children, ...props }, ref) => (
<SelectPrimitive.Trigger
ref={ref}
className={cn(
"flex h-11 w-full items-center justify-between",

"rounded-lg border border-neutral-200 bg-white",

"px-3 py-2 text-sm text-neutral-800",

"shadow-sm transition-all duration-200",

"placeholder:text-neutral-400",

"focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:border-indigo-500",

"hover:border-neutral-300",

"disabled:cursor-not-allowed disabled:opacity-50",

// mobile tap feedback
"active:scale-[0.99]",

className
)}
{...props}
>
{children}

<ChevronDown className="h-4 w-4 opacity-70 transition-transform duration-200 data-[state=open]:rotate-180" />

</SelectPrimitive.Trigger>
)
)
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef(
({ className, children, position = "popper", ...props }, ref) => (
<SelectPrimitive.Portal>
<SelectPrimitive.Content
ref={ref}
position={position}
className={cn(
"relative z-50",

"min-w-[10rem] overflow-hidden rounded-xl",

"border border-neutral-200 bg-white",

"shadow-xl shadow-black/10",

// animation
"data-[state=open]:animate-in data-[state=closed]:animate-out",

"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",

"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",

// mobile dropdown height
"max-h-72",

position === "popper" &&
"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",

className
)}
{...props}
>

<SelectPrimitive.Viewport
className={cn(
"p-1 overflow-y-auto",

position === "popper" &&
"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
)}
>
{children}
</SelectPrimitive.Viewport>

</SelectPrimitive.Content>
</SelectPrimitive.Portal>
)
)
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef(
({ className, ...props }, ref) => (
<SelectPrimitive.Label
ref={ref}
className={cn(
"px-2.5 py-2",

"text-xs font-medium uppercase tracking-wide",

"text-neutral-400",

className
)}
{...props}
/>
)
)
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef(
({ className, children, ...props }, ref) => (
<SelectPrimitive.Item
ref={ref}
className={cn(
"relative flex w-full cursor-pointer select-none items-center",

"rounded-md py-2.5 px-2.5 text-sm",

"text-neutral-700",

"outline-none transition-colors",

"focus:bg-neutral-100 focus:text-neutral-900",

"hover:bg-neutral-100",

"data-[disabled]:pointer-events-none data-[disabled]:opacity-40",

// mobile tap
"active:bg-neutral-200",

className
)}
{...props}
>

<SelectPrimitive.ItemText>
{children}
</SelectPrimitive.ItemText>

<span className="absolute right-2 flex h-4 w-4 items-center justify-center">
<SelectPrimitive.ItemIndicator>
<Check className="h-4 w-4 text-indigo-600" />
</SelectPrimitive.ItemIndicator>
</span>

</SelectPrimitive.Item>
)
)
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef(
({ className, ...props }, ref) => (
<SelectPrimitive.Separator
ref={ref}
className={cn("my-1 h-px bg-neutral-200", className)}
{...props}
/>
)
)
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
Select,
SelectGroup,
SelectValue,
SelectTrigger,
SelectContent,
SelectLabel,
SelectItem,
SelectSeparator,
}