import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/* ─── Button ─────────────────────────────────────────────────────────────── */
/* Heights: xs=24px, sm=28px, default=32px, lg=36px                           */
/* Radius: rounded-sm (4px) — per DESIGN.md UI control token                  */
/* Focus ring uses CSS token --ring, 2px offset                               */
const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center",
    "rounded-sm border border-transparent bg-clip-padding",
    "text-sm font-bold whitespace-nowrap",
    "transition-snap outline-none select-none",
    /* Focus ring */
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    /* Disabled */
    "disabled:pointer-events-none disabled:opacity-50",
    /* ARIA invalid */
    "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
    /* SVG sizing */
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        /* Primary — Action Green */
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        /* Secondary — Electric Blue */
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80",
        /* Outline — 1px border, background-colored surface */
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        /* Ghost — no visible resting border */
        ghost:
          "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
        /* Destructive — subdued danger tone, not screaming red fill */
        destructive:
          "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20 focus-visible:ring-destructive/40",
        /* Link */
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 gap-1.5 px-3",
        xs:      "h-6 gap-1 rounded-sm px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm:      "h-7 gap-1 rounded-sm px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg:      "h-9 gap-1.5 px-3.5",
        icon:    "size-8",
        "icon-xs": "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-sm [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
