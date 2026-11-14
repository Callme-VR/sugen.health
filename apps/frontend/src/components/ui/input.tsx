import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

/* ─── Input ──────────────────────────────────────────────────────────────── */
/* Rounded-sm (4px) per DESIGN.md UI control token.                           */
/* Border: --input token; focus ring: --ring token.                           */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        [
          "h-8 w-full min-w-0",
          "rounded-sm border border-input bg-transparent",
          "px-2.5 py-1 text-sm",
          "placeholder:text-muted-foreground placeholder:font-semibold",
          "transition-snap outline-none",
          /* Focus */
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
          /* File input */
          "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-foreground",
          /* Disabled */
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
          /* Invalid */
          "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
          /* Dark mode surface */
          "dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        ].join(" "),
        className
      )}
      {...props}
    />
  )
}

export { Input }
