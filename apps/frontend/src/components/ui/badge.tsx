import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/* ─── Badge ──────────────────────────────────────────────────────────────── */
/* Pills (rounded-full) are ONLY valid for compact status/count chips.         */
/* Use semantic tokens — no raw hex in component templates.                    */
const badgeVariants = cva(
  [
    "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1",
    "overflow-hidden border border-transparent",
    "px-2 py-0.5 text-xs font-bold whitespace-nowrap",
    "transition-snap",
    "focus-visible:ring-2 focus-visible:ring-ring",
    "has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
    "[&>svg]:pointer-events-none [&>svg]:size-3!",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-primary text-primary-foreground",
        secondary:
          "rounded-full bg-secondary text-secondary-foreground",
        destructive:
          "rounded-full bg-destructive/10 text-destructive border-destructive/30",
        outline:
          "rounded-sm border-border text-foreground",
        ghost:
          "rounded-sm hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        success:
          "rounded-full bg-success/10 text-success border-success/30",
        warning:
          "rounded-full bg-warning/10 text-warning border-warning/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      { className: cn(badgeVariants({ variant }), className) },
      props
    ),
    render,
    state: { slot: "badge", variant },
  })
}

export { Badge, badgeVariants }
