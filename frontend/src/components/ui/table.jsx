// frontend/src/components/ui/table.jsx
import * as React from "react"
import { cn } from "../../lib/utils"

/* ------------------------ Table Root ------------------------ */
const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

/* ------------------------ Table Sections ------------------------ */
const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("bg-neutral-50 border-b border-neutral-200", className)}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:nth-child(even)]:bg-neutral-50/60", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("bg-neutral-50 border-t border-neutral-200 font-medium", className)}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

/* ------------------------ Table Rows & Cells ------------------------ */
const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-neutral-200 transition-colors duration-150",
      "hover:bg-neutral-100/70",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle",
      "font-semibold text-neutral-700",
      "whitespace-nowrap text-xs sm:text-sm",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle",
      "text-neutral-700",
      "whitespace-nowrap text-xs sm:text-sm",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

/* ------------------------ Table Caption ------------------------ */
const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-neutral-500", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

/* ------------------------ Exports ------------------------ */
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}